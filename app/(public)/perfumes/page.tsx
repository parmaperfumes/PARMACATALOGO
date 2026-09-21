import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { datosDelCatalogo, jsonLdSeguro } from "@/lib/datosEstructurados"
import { NOMBRE_SITIO } from "@/lib/sitio"
import PerfumesClient, { type PerfumeFromDB } from "./PerfumesClient"

// El inventario vive en Labs (QualiaBusiness). La misma función sirve a las dos
// tiendas; sin `tienda=parma` contesta por Perfume Labs y ningún PAR-xx aparece.
const STOCK_API_URL = "https://uzvnluxxaekmaqnuocvo.supabase.co/functions/v1/stock-woocommerce"
const STOCK_TIENDA = "parma"
// El mismo formato que acepta la función. Un solo SKU fuera de formato hace que
// rechace el pedido ENTERO (400) y el catálogo deje de filtrar sin avisar: pasó
// con un perfume cuyo SKU era su propio nombre, con un espacio.
const PATRON_SKU = /^[A-Za-z0-9._-]{1,32}$/

// `/` redirige acá: sin la canónica, Google duda entre las dos direcciones.
export const metadata: Metadata = { alternates: { canonical: "/perfumes" } }

export const dynamic = "force-dynamic"
export const revalidate = 0

// Qué tamaños hay en inventario. Parma vende 30 y 50 ml: mirar sólo «hay o no hay»
// escondía los perfumes que sólo tienen de 50 y ofrecía de 50 los que no tienen.
type TamanosEnStock = { hay30: boolean; hay50: boolean }

/** Obtiene el stock por SKU y tamaño. Retorna null si falla (para no ocultar perfumes por error de API). */
async function fetchStockStatus(
	skus: string[]
): Promise<Map<string, TamanosEnStock> | null> {
	const limpios = [...new Set(skus.map((s) => String(s ?? "").trim()).filter(Boolean))]
	const uniqueSkus = limpios.filter((s) => PATRON_SKU.test(s))
	const descartados = limpios.filter((s) => !PATRON_SKU.test(s))
	if (descartados.length > 0) {
		// Se quedan visibles (dato desconocido), pero que conste: hay que corregirlos en el admin.
		console.warn(`Stock: ${descartados.length} SKU con formato inválido, no se consultan: ${descartados.join(" | ")}`)
	}
	if (uniqueSkus.length === 0) return new Map()

	try {
		const skusParam = uniqueSkus.map(encodeURIComponent).join(",")
		const url = `${STOCK_API_URL}?tienda=${STOCK_TIENDA}&skus=${skusParam}`
		const res = await fetch(url, { next: { revalidate: 0 } })
		if (!res.ok) return null

		const data = (await res.json()) as {
			success?: boolean
			products?: Record<string, { nombre?: string; stock_status?: string; tamanos?: { "30"?: boolean; "50"?: boolean } }>
		}
		if (!data?.success || !data.products) return null

		// Solo confiamos en entradas donde la API realmente encontró el producto
		// (nombre no vacío). Si viene vacío, el servicio no matcheó el SKU y NO
		// debemos ocultar el perfume por un dato poco fiable.
		const map = new Map<string, TamanosEnStock>()
		for (const [sku, info] of Object.entries(data.products)) {
			const nombre = info?.nombre ? String(info.nombre).trim() : ""
			if (!nombre) continue // dato no confiable → tratar como desconocido
			// `stock_status` sólo mira los de 30 ml: vale como respaldo si la función
			// todavía no manda `tamanos`.
			const hay30 = info?.tamanos ? info.tamanos["30"] === true : info?.stock_status === "instock"
			const hay50 = info?.tamanos ? info.tamanos["50"] === true : false
			map.set(sku.trim(), { hay30, hay50 })
		}
		return map
	} catch (e) {
		console.error("Error al consultar stock:", e)
		return null
	}
}

async function getPerfumes(): Promise<PerfumeFromDB[]> {
	try {
		// Intentar con todos los campos
		let perfumes: any[]
		try {
			perfumes = await prisma.$queryRawUnsafe<Array<any>>(`
				SELECT id, nombre, slug, descripcion, precio, "precioDescuento", "imagenPrincipal", 
				       imagenes, stock, destacado, activo, "categoriaId", "marcaId", genero, 
				       subtitulo, volumen, notas, sizes, "createdAt", "updatedAt",
				       "usoPorDefecto", "fijarUso", precio30, precio50,
				       "tipoLanzamiento", fijado, "ordenFijado", sku
				FROM "Perfume"
				WHERE 1 = 1
				ORDER BY COALESCE(fijado, false) DESC, COALESCE("ordenFijado", 999) ASC, CASE WHEN "tipoLanzamiento" = 'LANZAMIENTO' THEN 0 WHEN "tipoLanzamiento" = 'RESTOCK' THEN 1 ELSE 2 END ASC, "createdAt" DESC
			`)
		} catch (e: any) {
			// Si falla por campos que no existen, leer sin ellos
			if (e.message?.includes("usoPorDefecto") || e.message?.includes("fijarUso") || e.message?.includes("column") || e.message?.includes("does not exist")) {
				perfumes = await prisma.$queryRawUnsafe<Array<any>>(`
					SELECT id, nombre, slug, descripcion, precio, "precioDescuento", "imagenPrincipal", 
					       imagenes, stock, destacado, activo, "categoriaId", "marcaId", genero, 
					       subtitulo, volumen, notas, sizes, "createdAt", "updatedAt"
					FROM "Perfume"
					WHERE 1 = 1
					ORDER BY "createdAt" DESC
				`)
			perfumes = perfumes.map(p => ({
				...p,
				usoPorDefecto: null,
				fijarUso: false,
				tipoLanzamiento: null,
				precio30: null,
				precio50: null,
				fijado: false,
				ordenFijado: 0,
			}))
			} else {
				throw e
			}
		}

		// Normalizar datos
		return perfumes.map(p => ({
			...p,
			imagenes: Array.isArray(p.imagenes) ? p.imagenes : [],
			notas: Array.isArray(p.notas) ? p.notas : [],
			sizes: Array.isArray(p.sizes) ? p.sizes : [],
			usoPorDefecto: p.usoPorDefecto ? String(p.usoPorDefecto).trim().toUpperCase() : null,
			fijarUso: p.fijarUso !== undefined ? Boolean(p.fijarUso) : false,
			fijado: p.fijado !== undefined ? Boolean(p.fijado) : false,
			ordenFijado: p.ordenFijado !== undefined ? Number(p.ordenFijado) : 0,
		}))
	} catch (error) {
		console.error("Error al cargar perfumes desde la BD:", error)
		return []
	}
}

export default async function PerfumesPage() {
	let perfumes = await getPerfumes()

	// El inventario de LABS manda: se muestra lo que tenga stock (30 y/o 50 ml),
	// AUNQUE en el admin esté "Oculto". Si no hay dato de Labs (perfume sin SKU,
	// SKU no encontrado, o la API falla) → se respeta el interruptor del admin.
	const skus = perfumes.map((p) => p.sku).filter(Boolean) as string[]
	const stockMap = skus.length > 0 ? await fetchStockStatus(skus) : new Map()

	perfumes = perfumes
		.map((p) => {
			const sku = p.sku ? String(p.sku).trim() : null
			const stock = sku && stockMap ? stockMap.get(sku) : undefined
			if (!stock) return p // sin dato de Labs → como viene del admin
			return {
				...p,
				agotado30: !stock.hay30,
				agotado50: !stock.hay50,
				sinStock: !stock.hay30 && !stock.hay50,
			}
		})
		.filter((p) => {
			const sku = p.sku ? String(p.sku).trim() : null
			const stock = sku && stockMap ? stockMap.get(sku) : undefined
			// Labs decide: visible si hay de algún tamaño; escondido si no hay de ninguno.
			if (stock) return stock.hay30 || stock.hay50
			// Sin dato de Labs → se respeta "Activo/Oculto" del admin.
			return p.activo !== false
		})

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: jsonLdSeguro(datosDelCatalogo(perfumes)) }}
			/>
			{/* La página no tenía título de primer nivel: lo leen los lectores de pantalla y los buscadores. */}
			<h1 className="sr-only">{NOMBRE_SITIO} · Catálogo de perfumes inspirados</h1>
			<PerfumesClient initialData={perfumes} />
		</>
	)
}
