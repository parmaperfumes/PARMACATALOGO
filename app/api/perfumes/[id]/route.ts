import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const dbUrl = process.env.DATABASE_URL
	if (!dbUrl) {
		console.error("DATABASE_URL no está definida en process.env")
		return new NextResponse("DB no configurada. DATABASE_URL no encontrada en variables de entorno.", { status: 501 })
	}
	try {
		const { id } = await params
		const perfume = await prisma.perfume.findUnique({ where: { id } })
		if (!perfume) return new NextResponse("No encontrado", { status: 404 })
		return NextResponse.json(perfume)
	} catch (e: any) {
		console.error("Error al obtener perfume:", e)
		let errorMessage = "Error al obtener el perfume"
		if (e.message) {
			if (e.message.includes("Can't reach database") || e.message.includes("connection")) {
				errorMessage = "No se puede conectar a la base de datos. Verifica que el proyecto de Supabase esté activo."
			} else {
				errorMessage = `Error: ${e.message}`
			}
		}
		return new NextResponse(errorMessage, { status: 500 })
	}
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const dbUrl = process.env.DATABASE_URL
	if (!dbUrl) {
		console.error("PUT: DATABASE_URL no está definida en process.env")
		return new NextResponse("DB no configurada. DATABASE_URL no encontrada en variables de entorno.", { status: 501 })
	}
	try {
		const { id } = await params
		const data = await req.json()
		const perfume = await prisma.perfume.update({
			where: { id },
			data: {
				nombre: data.name,
				slug: data.slug,
				descripcion: data.description || "",
				precio: Number(data.precio),
				precioDescuento: data.precioDescuento ? Number(data.precioDescuento) : null,
				imagenPrincipal: data.imagenPrincipal,
				imagenes: data.imagenes ?? [],
				stock: data.stock ?? 0,
				destacado: !!data.destacado,
				activo: !!data.activo,
				categoriaId: data.categoriaId ?? undefined,
				marcaId: data.marcaId ?? undefined,
				genero: data.genero ?? null,
				subtitulo: data.subtitulo ?? null,
				volumen: data.volumen ?? null,
				notas: data.notas ?? [],
				sizes: data.sizes ?? [],
			},
		})
		return NextResponse.json({ id: perfume.id })
	} catch (e: any) {
		console.error("Error al actualizar perfume:", e)
		let errorMessage = "Error al actualizar el perfume"
		if (e.message) {
			if (e.message.includes("Can't reach database") || e.message.includes("connection")) {
				errorMessage = "No se puede conectar a la base de datos. Verifica que el proyecto de Supabase esté activo."
			} else if (e.message.includes("Record to update not found") || e.message.includes("not found")) {
				errorMessage = "Perfume no encontrado"
			} else {
				errorMessage = `Error: ${e.message}`
			}
		}
		return new NextResponse(errorMessage, { status: 500 })
	}
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const dbUrl = process.env.DATABASE_URL
	if (!dbUrl) {
		console.error("DELETE: DATABASE_URL no está definida en process.env")
		return new NextResponse("DB no configurada. DATABASE_URL no encontrada en variables de entorno.", { status: 501 })
	}
	try {
		const { id } = await params
		await prisma.perfume.delete({ where: { id } })
		return new NextResponse(null, { status: 204 })
	} catch (e: any) {
		console.error("Error al eliminar perfume:", e)
		return new NextResponse(e?.message || "Error", { status: 500 })
	}
}
