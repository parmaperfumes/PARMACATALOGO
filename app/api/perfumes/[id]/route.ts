import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
	if (!process.env.DATABASE_URL) return new NextResponse("DB no configurada", { status: 501 })
	try {
		const perfume = await prisma.perfume.findUnique({ where: { id: params.id } })
		if (!perfume) return new NextResponse("No encontrado", { status: 404 })
		return NextResponse.json(perfume)
	} catch (e: any) {
		return new NextResponse(e?.message || "Error", { status: 500 })
	}
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
	if (!process.env.DATABASE_URL) return new NextResponse("DB no configurada", { status: 501 })
	try {
		const data = await req.json()
		const perfume = await prisma.perfume.update({
			where: { id: params.id },
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
				volumen: data.volumen ?? null,
				notas: data.notas ?? [],
			},
		})
		return NextResponse.json({ id: perfume.id })
	} catch (e: any) {
		return new NextResponse(e?.message || "Error", { status: 500 })
	}
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
	if (!process.env.DATABASE_URL) return new NextResponse("DB no configurada", { status: 501 })
	try {
		await prisma.perfume.delete({ where: { id: params.id } })
		return new NextResponse(null, { status: 204 })
	} catch (e: any) {
		return new NextResponse(e?.message || "Error", { status: 500 })
	}
}
