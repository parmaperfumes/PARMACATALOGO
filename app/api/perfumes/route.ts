import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
	const data = await req.json()

	if (!process.env.DATABASE_URL) {
		return new NextResponse(
			"DATABASE_URL no configurada. Configura la base de datos para guardar perfumes.",
			{ status: 501 }
		)
	}

	try {
		const perfume = await prisma.perfume.create({
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
		return new NextResponse(e?.message || "Error al guardar", { status: 500 })
	}
}
