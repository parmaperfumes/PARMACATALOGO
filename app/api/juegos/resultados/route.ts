import { NextRequest, NextResponse } from "next/server"
import { obtenerSesion } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { estaVencido } from "@/lib/ruleta"

// Lista todos los códigos ganados en los juegos (correo, juego, premio),
// para que el vendedor los verifique y marque como usados.
export async function GET(req: NextRequest) {
	const session = await obtenerSesion()
	if (!session?.user) {
		return NextResponse.json({ error: "No autorizado" }, { status: 401 })
	}

	const juego = (req.nextUrl.searchParams.get("juego") || "").trim().toLowerCase()
	const filtro = req.nextUrl.searchParams.get("filtro") // usados | no-usados

	try {
		const cond: string[] = [`("rebotado" IS NOT TRUE)`]
		const params: any[] = []
		if (juego && juego !== "todos") {
			params.push(juego)
			cond.push(`lower(COALESCE("juego", 'ruleta')) = $${params.length}`)
		}
		if (filtro === "usados") cond.push(`"usado" = true`)
		else if (filtro === "no-usados") cond.push(`"usado" = false`)
		const where = `WHERE ${cond.join(" AND ")}`

		const rows = await prisma.$queryRawUnsafe<Array<any>>(
			`SELECT "id", "codigo", "correo", "descuento", "premio", COALESCE("juego", 'ruleta') AS "juego",
			        "usado", "usadoEn", "createdAt"
			 FROM "RuletaDescuento"
			 ${where}
			 ORDER BY "createdAt" DESC
			 LIMIT 1000`,
			...params
		)

		const registros = rows.map((r) => ({ ...r, vencido: estaVencido(r.createdAt) }))
		return NextResponse.json({ registros })
	} catch (e: any) {
		if (e.message?.includes("does not exist") || e.message?.includes("relation") || e.message?.includes("column")) {
			return NextResponse.json({ registros: [], faltaMigracion: true })
		}
		console.error("Error en /api/juegos/resultados:", e)
		return NextResponse.json({ error: e?.message || "Error" }, { status: 500 })
	}
}
