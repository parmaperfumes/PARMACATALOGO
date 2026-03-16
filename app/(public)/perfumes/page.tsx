import { prisma } from "@/lib/prisma"
import PerfumesClient, { type PerfumeFromDB } from "./PerfumesClient"

const STOCK_API_URL = "https://uzvnluxxaekmaqnuocvo.supabase.co/functions/v1/stock-woocommerce"

export const dynamic = "force-dynamic"
export const revalidate = 0

/** Obtiene el estado de stock por SKU. Retorna null si falla (para no ocultar perfumes por error de API). */
async function fetchStockStatus(
	skus: string[]
): Promise<Map<string, "instock" | "outofstock"> | null> {
	const uniqueSkus = [...new Set(skus.filter((s) => s && String(s).trim()))]
	if (uniqueSkus.length === 0) return new Map()

	try {
		const skusParam = uniqueSkus.map(encodeURIComponent).join(",")
		const url = `${STOCK_API_URL}?skus=${skusParam}`
		const res = await fetch(url, { next: { revalidate: 0 } })
		if (!res.ok) return null

		const data = (await res.json()) as { success?: boolean; products?: Record<string, { stock_status?: string }> }
		if (!data?.success || !data.products) return null

		const map = new Map<string, "instock" | "outofstock">()
		for (const [sku, info] of Object.entries(data.products)) {
			const status = info?.stock_status === "instock" ? "instock" : "outofstock"
			map.set(sku.trim(), status)
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
				WHERE activo = true
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
					WHERE activo = true
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

	// Filtrar por stock: ocultar perfumes con SKU que estén outofstock
	const skus = perfumes.map((p) => p.sku).filter(Boolean) as string[]
	if (skus.length > 0) {
		const stockMap = await fetchStockStatus(skus)
		if (stockMap) {
			perfumes = perfumes.filter((p) => {
				const sku = p.sku ? String(p.sku).trim() : null
				if (!sku) return true // Sin SKU: mostrar siempre
				const status = stockMap.get(sku)
				return status === "instock" // Solo mostrar si hay stock
			})
		}
		// Si stockMap es null (API falló), no filtramos y mostramos todos
	}

	return <PerfumesClient initialData={perfumes} />
}
