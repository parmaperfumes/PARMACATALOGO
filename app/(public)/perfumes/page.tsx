import { prisma } from "@/lib/prisma"
import PerfumesClient, { type PerfumeFromDB } from "./PerfumesClient"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function getPerfumes(): Promise<PerfumeFromDB[]> {
	try {
		// Intentar con todos los campos
		let perfumes: any[]
		try {
			perfumes = await prisma.$queryRawUnsafe<Array<any>>(`
				SELECT id, nombre, slug, descripcion, precio, "precioDescuento", "imagenPrincipal", 
				       imagenes, stock, destacado, activo, "categoriaId", "marcaId", genero, 
				       subtitulo, volumen, notas, sizes, "createdAt", "updatedAt",
				       "usoPorDefecto", "fijarUso", precio30, precio50
				FROM "Perfume"
				WHERE activo = true
				ORDER BY "createdAt" DESC
			`)
			// Agregar tipoLanzamiento como null (no existe en la BD)
			perfumes = perfumes.map(p => ({ ...p, tipoLanzamiento: null }))
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
		}))
	} catch (error) {
		console.error("Error al cargar perfumes desde la BD:", error)
		return []
	}
}

export default async function PerfumesPage() {
	const perfumes = await getPerfumes()
	return <PerfumesClient initialData={perfumes} />
}
