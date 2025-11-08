import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
	if (!process.env.DATABASE_URL) {
		return NextResponse.json([])
	}
	try {
		const perfumes = await prisma.perfume.findMany({
			where: {
				activo: true, // Solo mostrar perfumes activos
			},
			orderBy: { createdAt: "desc" },
		})
		return NextResponse.json(perfumes)
	} catch (e: any) {
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
		// Construir el objeto de datos base
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

		const perfume = await prisma.perfume.create({
			data: perfumeData,
		})
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
