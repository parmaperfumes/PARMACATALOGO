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
		// Intentar leer con los nuevos campos primero
		let result: Array<any>
		try {
		result = await prisma.$queryRaw<Array<any>>`
			SELECT id, nombre, slug, descripcion, precio, "precioDescuento", "imagenPrincipal", 
			       imagenes, stock, destacado, activo, "categoriaId", "marcaId", genero, 
			       subtitulo, volumen, notas, sizes, "createdAt", "updatedAt",
			       "usoPorDefecto", "fijarUso", "tipoLanzamiento", precio30, precio50,
			       fijado, "ordenFijado", sku
			FROM "Perfume"
			WHERE id = ${id}
		`
		} catch (e: any) {
			// Si los campos nuevos no existen, leer sin ellos
			if (e.message?.includes("usoPorDefecto") || e.message?.includes("fijarUso") || e.message?.includes("column") || e.message?.includes("does not exist")) {
				result = await prisma.$queryRaw<Array<any>>`
					SELECT id, nombre, slug, descripcion, precio, "precioDescuento", "imagenPrincipal", 
					       imagenes, stock, destacado, activo, "categoriaId", "marcaId", genero, 
					       subtitulo, volumen, notas, sizes, "createdAt", "updatedAt"
					FROM "Perfume"
					WHERE id = ${id}
				`
			} else {
				throw e
			}
		}
		
		if (!result || result.length === 0) {
			return new NextResponse("No encontrado", { status: 404 })
		}
		
		const perfume = result[0]
		// Asegurar que los arrays estén en formato correcto
		if (perfume.imagenes && !Array.isArray(perfume.imagenes)) {
			perfume.imagenes = []
		}
		if (perfume.notas && !Array.isArray(perfume.notas)) {
			perfume.notas = []
		}
		if (perfume.sizes && !Array.isArray(perfume.sizes)) {
			perfume.sizes = []
		}
		// Valores por defecto si los campos no existen
		if (perfume.usoPorDefecto === undefined) perfume.usoPorDefecto = null
		if (perfume.fijarUso === undefined) perfume.fijarUso = false
		if (perfume.fijado === undefined) perfume.fijado = false
		if (perfume.ordenFijado === undefined) perfume.ordenFijado = 0
		if (perfume.sku === undefined) perfume.sku = null
		
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
		
		// Construir el objeto de datos base
		const updateData: any = {
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
		}
		
		// Agregar usoPorDefecto si está presente en los datos (ahora que la columna existe)
		if (data.usoPorDefecto !== undefined) {
			updateData.usoPorDefecto = data.usoPorDefecto ?? null
		}
		if (data.fijarUso !== undefined) {
			updateData.fijarUso = data.fijarUso ?? false
		}
		// Agregar tipoLanzamiento
		if (data.tipoLanzamiento !== undefined) {
			updateData.tipoLanzamiento = (data.tipoLanzamiento === "NINGUNO" || !data.tipoLanzamiento) ? null : data.tipoLanzamiento
		}
		// Agregar precios por tamaño
		if (data.precio30 !== undefined) {
			updateData.precio30 = data.precio30 || null
		}
		if (data.precio50 !== undefined) {
			updateData.precio50 = data.precio50 || null
		}
		// Agregar fijado y ordenFijado
		if (data.fijado !== undefined) {
			updateData.fijado = !!data.fijado
		}
		if (data.ordenFijado !== undefined) {
			updateData.ordenFijado = Number(data.ordenFijado) || 0
		}
		if (data.sku !== undefined) {
			updateData.sku = data.sku || null
		}
		
		// Intentar actualizar usando Prisma
		let perfume
		try {
			perfume = await prisma.perfume.update({
				where: { id },
				data: updateData,
			})
		} catch (e: any) {
			// Si falla por campos que no existen, usar SQL raw con todos los campos conocidos
			if (e.message?.includes("column") || e.message?.includes("does not exist") || e.message?.includes("Unknown arg")) {
				// Mapa de campos JS -> nombre de columna SQL con comillas correctas
				const fieldMap: Record<string, string> = {
					nombre: 'nombre',
					slug: 'slug',
					descripcion: 'descripcion',
					precio: 'precio',
					precioDescuento: '"precioDescuento"',
					imagenPrincipal: '"imagenPrincipal"',
					imagenes: 'imagenes',
					stock: 'stock',
					destacado: 'destacado',
					activo: 'activo',
					categoriaId: '"categoriaId"',
					marcaId: '"marcaId"',
					genero: 'genero',
					subtitulo: 'subtitulo',
					volumen: 'volumen',
					notas: 'notas',
					sizes: 'sizes',
					usoPorDefecto: '"usoPorDefecto"',
					fijarUso: '"fijarUso"',
					precio30: 'precio30',
					precio50: 'precio50',
					tipoLanzamiento: '"tipoLanzamiento"',
					fijado: 'fijado',
					ordenFijado: '"ordenFijado"',
					sku: 'sku',
				}

				const setParts: string[] = []
				const values: any[] = []
				let paramIndex = 1

				for (const [jsField, sqlColumn] of Object.entries(fieldMap)) {
					if (updateData[jsField] !== undefined) {
						setParts.push(`${sqlColumn} = $${paramIndex++}`)
						values.push(updateData[jsField])
					}
				}

				const idParamIndex = paramIndex
				values.push(id)
				await prisma.$executeRawUnsafe(
					`UPDATE "Perfume" SET ${setParts.join(", ")} WHERE id = $${idParamIndex}`,
					...values
				)
				const result = await prisma.$queryRawUnsafe<Array<any>>(
					`SELECT id FROM "Perfume" WHERE id = $1`,
					id
				)
				perfume = result[0] || { id }
			} else {
				throw e
			}
		}
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
