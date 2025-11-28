import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Datos de respaldo si la base de datos falla
const FALLBACK_PERFUMES = [
	{
		id: "mock-1",
		nombre: "INVICTUS",
		slug: "invictus",
		descripcion: "Fragancia deportiva y fresca",
		precio: 45000,
		precioDescuento: null,
		imagenPrincipal: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80",
		imagenes: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80"],
		stock: 10,
		destacado: true,
		activo: true,
		categoriaId: null,
		marcaId: null,
		genero: "HOMBRE",
		subtitulo: "EAU DE TOILETTE",
		volumen: "100ml",
		notas: ["Pomelo", "Laurel", "Guayaco"],
		sizes: [30, 50],
		usoPorDefecto: "DIA",
		fijarUso: true,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: "mock-2",
		nombre: "ONE MILLION",
		slug: "one-million",
		descripcion: "Fragancia intensa y seductora",
		precio: 48000,
		precioDescuento: 42000,
		imagenPrincipal: "https://images.unsplash.com/photo-1588405748880-12d1d2a59c75?w=800&q=80",
		imagenes: ["https://images.unsplash.com/photo-1588405748880-12d1d2a59c75?w=800&q=80"],
		stock: 15,
		destacado: true,
		activo: true,
		categoriaId: null,
		marcaId: null,
		genero: "HOMBRE",
		subtitulo: "EAU DE TOILETTE",
		volumen: "100ml",
		notas: ["Pomelo", "Menta", "Canela"],
		sizes: [30, 50],
		usoPorDefecto: "NOCHE",
		fijarUso: true,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: "mock-3",
		nombre: "SAUVAGE",
		slug: "sauvage",
		descripcion: "Fragancia salvaje y magnética",
		precio: 52000,
		precioDescuento: null,
		imagenPrincipal: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80",
		imagenes: ["https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80"],
		stock: 20,
		destacado: true,
		activo: true,
		categoriaId: null,
		marcaId: null,
		genero: "HOMBRE",
		subtitulo: "EAU DE PARFUM",
		volumen: "100ml",
		notas: ["Bergamota", "Pimienta", "Ámbar"],
		sizes: [30, 50],
		usoPorDefecto: "AMBOS",
		fijarUso: false,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: "mock-4",
		nombre: "ANGEL",
		slug: "angel",
		descripcion: "Fragancia dulce y gourmand",
		precio: 50000,
		precioDescuento: null,
		imagenPrincipal: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
		imagenes: ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80"],
		stock: 12,
		destacado: true,
		activo: true,
		categoriaId: null,
		marcaId: null,
		genero: "MUJER",
		subtitulo: "EAU DE PARFUM",
		volumen: "50ml",
		notas: ["Vainilla", "Caramelo", "Pachulí"],
		sizes: [30, 50],
		usoPorDefecto: "NOCHE",
		fijarUso: true,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: "mock-5",
		nombre: "COCO MADEMOISELLE",
		slug: "coco-mademoiselle",
		descripcion: "Fragancia elegante y sofisticada",
		precio: 55000,
		precioDescuento: 49000,
		imagenPrincipal: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80",
		imagenes: ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80"],
		stock: 8,
		destacado: true,
		activo: true,
		categoriaId: null,
		marcaId: null,
		genero: "MUJER",
		subtitulo: "EAU DE PARFUM",
		volumen: "100ml",
		notas: ["Naranja", "Rosa", "Pachulí"],
		sizes: [30, 50],
		usoPorDefecto: "DIA",
		fijarUso: true,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: "mock-6",
		nombre: "LA VIE EST BELLE",
		slug: "la-vie-est-belle",
		descripcion: "Fragancia floral y femenina",
		precio: 47000,
		precioDescuento: null,
		imagenPrincipal: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80",
		imagenes: ["https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80"],
		stock: 18,
		destacado: false,
		activo: true,
		categoriaId: null,
		marcaId: null,
		genero: "MUJER",
		subtitulo: "EAU DE PARFUM",
		volumen: "75ml",
		notas: ["Iris", "Jazmín", "Vainilla"],
		sizes: [30, 75],
		usoPorDefecto: "AMBOS",
		fijarUso: false,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: "mock-7",
		nombre: "BLEU DE CHANEL",
		slug: "bleu-de-chanel",
		descripcion: "Fragancia aromática y amaderada",
		precio: 58000,
		precioDescuento: null,
		imagenPrincipal: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80",
		imagenes: ["https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80"],
		stock: 14,
		destacado: true,
		activo: true,
		categoriaId: null,
		marcaId: null,
		genero: "HOMBRE",
		subtitulo: "EAU DE PARFUM",
		volumen: "100ml",
		notas: ["Cítricos", "Incienso", "Sándalo"],
		sizes: [30, 50],
		usoPorDefecto: "AMBOS",
		fijarUso: false,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: "mock-8",
		nombre: "GOOD GIRL",
		slug: "good-girl",
		descripcion: "Fragancia audaz y seductora",
		precio: 51000,
		precioDescuento: 46000,
		imagenPrincipal: "https://images.unsplash.com/photo-1528912101095-e1e04e965ecb?w=800&q=80",
		imagenes: ["https://images.unsplash.com/photo-1528912101095-e1e04e965ecb?w=800&q=80"],
		stock: 10,
		destacado: false,
		activo: true,
		categoriaId: null,
		marcaId: null,
		genero: "MUJER",
		subtitulo: "EAU DE PARFUM",
		volumen: "80ml",
		notas: ["Almendra", "Café", "Vainilla"],
		sizes: [30, 50, 80],
		usoPorDefecto: "NOCHE",
		fijarUso: true,
		createdAt: new Date(),
		updatedAt: new Date()
	}
]

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
	const url = new URL(req.url)
	const includeInactive = url.searchParams.get('includeInactive') === 'true'
	
	// Si no hay DATABASE_URL, usar datos de respaldo
	if (!process.env.DATABASE_URL) {
		console.warn("⚠️ DATABASE_URL no configurada, usando datos de respaldo")
		const fallbackData = includeInactive ? FALLBACK_PERFUMES : FALLBACK_PERFUMES.filter(p => p.activo)
		return NextResponse.json(fallbackData, {
			headers: {
				'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
			}
		})
	}
	
	try {
		// Usar SQL raw para evitar errores si los campos nuevos no existen
		let perfumes: any[]
		try {
			// Leer sin tipoLanzamiento (no existe en la BD)
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
			
			// Agregar tipoLanzamiento como null
			perfumes = perfumes.map(p => ({ ...p, tipoLanzamiento: null }))
			
			// Debug: verificar el primer perfume
			console.log("✅ Consulta exitosa")
			console.log("Primer perfume:", perfumes[0]?.nombre, "- usoPorDefecto:", perfumes[0]?.usoPorDefecto)
		} catch (e: any) {
			console.error("❌ Error en primera consulta:", e.message)
			// Si los campos nuevos no existen, leer sin ellos
			if (e.message?.includes("usoPorDefecto") || e.message?.includes("fijarUso") || e.message?.includes("column") || e.message?.includes("does not exist")) {
				console.log("⚠️ Campos no existen, usando fallback")
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
		// s-maxage: 10 segundos en CDN para actualizaciones rápidas
		return NextResponse.json(perfumes, {
			headers: {
				'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60',
				'CDN-Cache-Control': 'public, s-maxage=10',
				'Vercel-CDN-Cache-Control': 'public, s-maxage=10',
				'X-Content-Type-Options': 'nosniff',
			}
		})
	} catch (e: any) {
		// Si hay error de conexión a la DB, usar datos de respaldo
		console.error("❌ Error al conectar con la base de datos, usando datos de respaldo:", e.message)
		const fallbackData = includeInactive ? FALLBACK_PERFUMES : FALLBACK_PERFUMES.filter(p => p.activo)
		
		// Normalizar los datos de respaldo
		const normalizedFallback = fallbackData.map(p => ({
			...p,
			imagenes: Array.isArray(p.imagenes) ? p.imagenes : [],
			notas: Array.isArray(p.notas) ? p.notas : [],
			sizes: Array.isArray(p.sizes) ? p.sizes : [],
			usoPorDefecto: p.usoPorDefecto ? String(p.usoPorDefecto).trim().toUpperCase() : null,
			fijarUso: p.fijarUso !== undefined ? Boolean(p.fijarUso) : false
		}))
		
		return NextResponse.json(normalizedFallback, {
			headers: {
				'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
				'X-Data-Source': 'fallback', // Indicador de que son datos de respaldo
			}
		})
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

		// Agregar usoPorDefecto si está presente
		if (data.usoPorDefecto) {
			perfumeData.usoPorDefecto = data.usoPorDefecto
		}

		// Agregar fijarUso (por defecto true para el catálogo público)
		if (data.fijarUso !== undefined) {
			perfumeData.fijarUso = !!data.fijarUso
		}

		// Agregar tipoLanzamiento si está presente
		if (data.tipoLanzamiento) {
			perfumeData.tipoLanzamiento = data.tipoLanzamiento
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
