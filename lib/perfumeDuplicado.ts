import { prisma } from "@/lib/prisma"

// Traduce un choque de unicidad (SKU o slug repetido) a un mensaje que diga qué
// perfume ya los usa. Devuelve null si el error es de otro tipo.
//
// Antes caía en el mensaje genérico «Error de validación… la tabla 'Perfume'
// puede no existir», porque todo error de Prisma empieza con «Invalid …».
export async function mensajePerfumeDuplicado(
	e: any,
	datos: { sku?: string | null; slug?: string | null },
	idPropio?: string
): Promise<string | null> {
	const msg = String(e?.message ?? "")
	const esUnico =
		e?.code === "P2002" || msg.includes("Unique constraint failed") || msg.includes("duplicate key value")
	if (!esUnico) return null

	const target = String(e?.meta?.target ?? msg)
	const campo = target.includes("sku") ? "sku" : target.includes("slug") ? "slug" : null
	const valor = campo ? datos[campo] : null

	let dueño: string | null = null
	if (campo && valor) {
		try {
			const filas = await prisma.$queryRawUnsafe<Array<{ nombre: string }>>(
				`SELECT nombre FROM "Perfume" WHERE "${campo}" = $1 AND id <> $2 LIMIT 1`,
				valor,
				idPropio ?? ""
			)
			dueño = filas[0]?.nombre ?? null
		} catch {}
	}

	const deQuien = dueño ? ` por «${dueño}»` : ""
	if (campo === "sku") return `El SKU ${valor} ya está en uso${deQuien}. Usa otro SKU.`
	if (campo === "slug") return `Ya existe un perfume con ese nombre${deQuien}. Cambia el nombre para distinguirlo.`
	return "Ya existe un perfume con esos datos (SKU o nombre repetido)."
}
