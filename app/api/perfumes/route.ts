import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest) {
	if (!process.env.DATABASE_URL) {
		return new NextResponse("DATABASE_URL no configurada", { status: 501 })
	}
	try {
		const body = await req.json()
		const { id, activo } = body
		
		if (!id) {
			return new NextResponse("ID es requerido", { status: 400 })
		}
		
		if (typeof activo !== 'boolean') {
			return new NextResponse("activo debe ser un booleano", { status: 400 })
		}
		
		// Usar Prisma si es posible, sino usar SQL raw
		try {
			await prisma.perfume.update({
				where: { id },
				data: { activo }
			})
		} catch (prismaError: any) {
			// Si falla con Prisma, usar SQL raw
			await prisma.$executeRawUnsafe(
				`UPDATE "Perfume" SET activo = $1 WHERE id = $2`,
				activo,
				id
			)
		}
		
		return NextResponse.json({ success: true, id, activo })
	} catch (e: any) {
		console.error("Error al actualizar estado del perfume:", e)
		return new NextResponse(e?.message || "Error", { status: 500 })
	}
}

export async function GET(req: NextRequest) {
	if (!process.env.DATABASE_URL) {
		return NextResponse.json([])
	}
	try {
		// Verificar si es una petición del admin (incluir inactivos)
		const url = new URL(req.url)
		const includeInactive = url.searchParams.get('includeInactive') === 'true'
		
		// Usar SQL raw para evitar errores si los campos nuevos no existen
		let perfumes: any[]
		try {
			// Intentar leer con los nuevos campos primero
			const whereClause = includeInactive ? '' : 'WHERE activo = true'
			perfumes = await prisma.$queryRawUnsafe<Array<any>>(`
				SELECT id, nombre, slug, descripcion, precio, "precioDescuento", "imagenPrincipal", 
				       imagenes, stock, destacado, activo, "categoriaId", "marcaId", genero, 
				       subtitulo, volumen, notas, sizes, "createdAt", "updatedAt",
				       "usoPorDefecto", "fijarUso"
				FROM "Perfume"
				${whereClause}
				ORDER BY "createdAt" DESC
			`)
		} catch (e: any) {
			// Si los campos nuevos no existen, leer sin ellos
			if (e.message?.includes("usoPorDefecto") || e.message?.includes("fijarUso") || e.message?.includes("column") || e.message?.includes("does not exist")) {
				const whereClause = includeInactive ? '' : 'WHERE activo = true'
				perfumes = await prisma.$queryRawUnsafe<Array<any>>(`
					SELECT id, nombre, slug, descripcion, precio, "precioDescuento", "imagenPrincipal", 
					       imagenes, stock, destacado, activo, "categoriaId", "marcaId", genero, 
					       subtitulo, volumen, notas, sizes, "createdAt", "updatedAt"
					FROM "Perfume"
					${whereClause}
					ORDER BY "createdAt" DESC
				`)
				// Agregar valores por defecto para los campos que no existen
				perfumes = perfumes.map(p => ({
					...p,
					usoPorDefecto: null,
					fijarUso: false
				}))
			} else {
				throw e
			}
		}
		
		// Asegurar que los arrays estén en formato correcto y normalizar usoPorDefecto
		perfumes = perfumes.map(p => ({
			...p,
			imagenes: Array.isArray(p.imagenes) ? p.imagenes : [],
			notas: Array.isArray(p.notas) ? p.notas : [],
			sizes: Array.isArray(p.sizes) ? p.sizes : [],
			usoPorDefecto: p.usoPorDefecto ? String(p.usoPorDefecto).trim().toUpperCase() : null,
			fijarUso: p.fijarUso !== undefined ? Boolean(p.fijarUso) : false
		}))
		
		// Agregar headers de caché para optimizar rendimiento
		// s-maxage: 60 segundos en CDN, stale-while-revalidate: 5 minutos
		return NextResponse.json(perfumes, {
			headers: {
				'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
				'CDN-Cache-Control': 'public, s-maxage=60',
				'Vercel-CDN-Cache-Control': 'public, s-maxage=60'
			}
		})
	} catch (e: any) {
		console.error("Error al listar perfumes:", e)
		return new NextResponse(e?.message || "Error al listar", { status: 500 })
	}
}

export async function POST(req: NextRequest) {
	const data = await req.json()

	if (!process.env.DATABASE_URL) {
		return new NextResponse(
			"DATABASE_URL no configurada. Configura la base de datos para guardar perfumes.",
			{ status: 501 }
		)
	}

	try {
		// Construir el objeto de datos base (sin los campos nuevos que pueden no existir)
		const perfumeData: any = {
			nombre: data.name,
			slug: data.slug,
			descripcion: data.description || null,
			precio: Number(data.precio),
			precioDescuento: data.precioDescuento ? Number(data.precioDescuento) : null,
			imagenPrincipal: data.imagenPrincipal,
			imagenes: data.imagenes && data.imagenes.length > 0 ? data.imagenes : [data.imagenPrincipal],
			stock: data.stock ?? 0,
			destacado: !!data.destacado,
			activo: !!data.activo,
			categoriaId: data.categoriaId || null,
			marcaId: data.marcaId || null,
			genero: data.genero || null,
			volumen: data.volumen || null,
			notas: data.notas && Array.isArray(data.notas) ? data.notas : [],
			sizes: data.sizes && Array.isArray(data.sizes) ? data.sizes : [],
		}

		// Solo agregar subtitulo si está presente (evita error si el campo no existe en la BD)
		if (data.subtitulo !== undefined && data.subtitulo !== null && data.subtitulo !== "") {
			perfumeData.subtitulo = data.subtitulo
		}

		// Intentar crear con Prisma, pero si falla por campos que no existen, usar SQL raw
		let perfume
		try {
			perfume = await prisma.perfume.create({
				data: perfumeData,
			})
		} catch (e: any) {
			// Si falla por campos que no existen, usar SQL raw
			if (e.message?.includes("column") || e.message?.includes("does not exist") || e.message?.includes("Unknown arg")) {
				// Construir la consulta SQL manualmente
				const columns: string[] = []
				const values: any[] = []
				let paramIndex = 1
				
				Object.keys(perfumeData).forEach(key => {
					if (perfumeData[key] !== undefined) {
						columns.push(`"${key}"`)
						values.push(perfumeData[key])
						paramIndex++
					}
				})
				
				const placeholders = values.map((_, i) => `$${i + 1}`).join(", ")
				const result = await prisma.$queryRawUnsafe<Array<any>>(
					`INSERT INTO "Perfume" (${columns.join(", ")}) VALUES (${placeholders}) RETURNING id`,
					...values
				)
				perfume = { id: result[0].id }
			} else {
				throw e
			}
		}
		return NextResponse.json({ id: perfume.id })
	} catch (e: any) {
		console.error("Error al guardar perfume:", e)
		
		// Mensajes de error más descriptivos
		let errorMessage = "Error al guardar el perfume"
		
		if (e.message) {
			if (e.message.includes("does not exist") || e.message.includes("relation") || e.message.includes("table")) {
				errorMessage = "La tabla 'Perfume' no existe en la base de datos. Por favor, ejecuta el script SQL 'crear_tablas_y_agregar_subtitulo.sql' en Supabase Dashboard > SQL Editor."
			} else if (e.message.includes("Can't reach database") || e.message.includes("connection")) {
				errorMessage = "No se puede conectar a la base de datos. Verifica que DATABASE_URL esté configurada correctamente en .env.local y que el proyecto de Supabase esté activo."
			} else if (e.message.includes("Invalid") || e.message.includes("Unknown arg")) {
				errorMessage = "Error de validación. La tabla 'Perfume' puede no existir o tener campos faltantes. Ejecuta el script SQL 'crear_tablas_y_agregar_subtitulo.sql' en Supabase."
			} else {
				errorMessage = `Error: ${e.message}`
			}
		}
		
		return new NextResponse(errorMessage, { status: 500 })
	}
}
