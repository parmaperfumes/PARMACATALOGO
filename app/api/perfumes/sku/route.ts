import { NextRequest, NextResponse } from "next/server"
import { exigirSesion } from "@/lib/session"
import { prisma } from "@/lib/prisma"

// ¿Está libre este SKU? Lo usan los formularios de crear y editar perfume para
// avisar en pantalla antes de guardar. `excluir` es el id del perfume que se
// está editando, para que su propio SKU no cuente como repetido.
export async function GET(req: NextRequest) {
	const bloqueo = await exigirSesion()
	if (bloqueo) return bloqueo

	const sku = (req.nextUrl.searchParams.get("sku") ?? "").trim()
	const excluir = req.nextUrl.searchParams.get("excluir") ?? ""
	if (!sku) return NextResponse.json({ disponible: false, usadoPor: null })

	const filas = await prisma.$queryRawUnsafe<Array<{ nombre: string }>>(
		`SELECT nombre FROM "Perfume" WHERE upper(trim(sku)) = upper($1) AND id <> $2 LIMIT 1`,
		sku,
		excluir
	)
	return NextResponse.json({ disponible: filas.length === 0, usadoPor: filas[0]?.nombre ?? null })
}
