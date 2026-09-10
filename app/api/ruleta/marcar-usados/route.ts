import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { estaVencido } from "@/lib/ruleta"

// Marca VARIOS códigos como usados de una sola vez.
// Salta los que ya estaban usados o están vencidos (informa cuáles).
export async function POST(req: NextRequest) {
	const session = await auth()
	if (!session?.user) {
		return NextResponse.json({ error: "No autorizado" }, { status: 401 })
	}

	try {
		const body = await req.json()
		const codigos: string[] = Array.isArray(body.codigos)
			? body.codigos.map((c: any) => String(c).trim().toUpperCase()).filter(Boolean)
			: []

		if (codigos.length === 0) {
			return NextResponse.json({ error: "No se enviaron códigos." }, { status: 400 })
		}

		// Trae el estado actual de cada código.
		const ph = codigos.map((_, i) => `$${i + 1}`).join(",")
		const rows = await prisma.$queryRawUnsafe<Array<any>>(
			`SELECT "codigo", "usado", "createdAt" FROM "RuletaDescuento" WHERE "codigo" IN (${ph})`,
			...codigos
		)

		const yaUsados: string[] = []
		const vencidos: string[] = []
		const elegibles: string[] = []

		for (const r of rows) {
			if (r.usado) yaUsados.push(r.codigo)
			else if (estaVencido(r.createdAt)) vencidos.push(r.codigo)
			else elegibles.push(r.codigo)
		}

		let actualizados = 0
		if (elegibles.length > 0) {
			const ph2 = elegibles.map((_, i) => `$${i + 1}`).join(",")
			actualizados = await prisma.$executeRawUnsafe(
				`UPDATE "RuletaDescuento" SET "usado" = true, "usadoEn" = NOW() WHERE "codigo" IN (${ph2})`,
				...elegibles
			)
		}

		return NextResponse.json({
			actualizados,
			yaUsados: yaUsados.length,
			vencidos: vencidos.length,
		})
	} catch (e: any) {
		console.error("Error en /api/ruleta/marcar-usados:", e)
		return NextResponse.json({ error: e?.message || "Error" }, { status: 500 })
	}
}
