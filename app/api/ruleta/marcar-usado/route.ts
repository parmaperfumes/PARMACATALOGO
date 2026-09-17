import { NextRequest, NextResponse } from "next/server"
import { obtenerSesion } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { estaVencido } from "@/lib/ruleta"

// Marca un codigo como USADO (lo "quema"). Opcionalmente guarda el telefono
// del cliente que lo canjeo. Solo funciona si el codigo existe y no esta usado.
export async function POST(req: NextRequest) {
	const session = await obtenerSesion()
	if (!session?.user) {
		return NextResponse.json({ error: "No autorizado" }, { status: 401 })
	}

	try {
		const body = await req.json()
		const codigo = String(body.codigo ?? "").trim().toUpperCase()
		const telefono = body.telefono ? String(body.telefono).trim() : null

		if (!codigo) {
			return NextResponse.json({ error: "Falta el código" }, { status: 400 })
		}

		const rows = await prisma.$queryRawUnsafe<Array<any>>(
			`SELECT "usado", "createdAt" FROM "RuletaDescuento" WHERE "codigo" = $1 LIMIT 1`,
			codigo
		)
		if (rows.length === 0) {
			return NextResponse.json({ error: "El código no existe." }, { status: 404 })
		}
		if (rows[0].usado) {
			return NextResponse.json({ error: "Este código ya fue usado." }, { status: 409 })
		}
		if (estaVencido(rows[0].createdAt)) {
			return NextResponse.json({ error: "Este código está vencido (solo era válido el día que se generó)." }, { status: 409 })
		}

		await prisma.$executeRawUnsafe(
			`UPDATE "RuletaDescuento"
			 SET "usado" = true, "usadoEn" = NOW(), "telefono" = COALESCE($2, "telefono")
			 WHERE "codigo" = $1`,
			codigo,
			telefono
		)

		return NextResponse.json({ success: true })
	} catch (e: any) {
		console.error("Error en /api/ruleta/marcar-usado:", e)
		return NextResponse.json({ error: e?.message || "Error" }, { status: 500 })
	}
}
