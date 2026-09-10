import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { estaVencido } from "@/lib/ruleta"

// Lista todos los descuentos generados por la ruleta (para el panel admin).
// Filtro opcional: ?filtro=usados | no-usados
export async function GET(req: NextRequest) {
	const session = await auth()
	if (!session?.user) {
		return NextResponse.json({ error: "No autorizado" }, { status: 401 })
	}

	const filtro = req.nextUrl.searchParams.get("filtro")

	try {
		let where = ""
		if (filtro === "usados") where = `WHERE "usado" = true`
		else if (filtro === "no-usados") where = `WHERE "usado" = false`

		const rows = await prisma.$queryRawUnsafe<Array<any>>(
			`SELECT "id", "codigo", "correo", "descuento", "usado", "telefono", "usadoEn", "createdAt"
			 FROM "RuletaDescuento" ${where}
			 ORDER BY "createdAt" DESC
			 LIMIT 1000`
		)

		const totales = await prisma.$queryRawUnsafe<Array<any>>(
			`SELECT
				COUNT(*)::int AS "total",
				COUNT(*) FILTER (WHERE "usado" = true)::int AS "usados",
				COUNT(*) FILTER (WHERE "descuento" = 5)::int AS "d5",
				COUNT(*) FILTER (WHERE "descuento" = 10)::int AS "d10",
				COUNT(*) FILTER (WHERE "descuento" = 15)::int AS "d15"
			 FROM "RuletaDescuento"`
		)

		const registros = rows.map((r) => ({ ...r, vencido: estaVencido(r.createdAt) }))
		return NextResponse.json({ registros, totales: totales[0] ?? {} })
	} catch (e: any) {
		if (e.message?.includes("does not exist") || e.message?.includes("relation")) {
			return NextResponse.json({ registros: [], totales: {}, sinTabla: true })
		}
		console.error("Error en /api/ruleta/listado:", e)
		return NextResponse.json({ error: e?.message || "Error" }, { status: 500 })
	}
}
