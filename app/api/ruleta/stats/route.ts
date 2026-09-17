import { NextResponse } from "next/server"
import { obtenerSesion } from "@/lib/session"
import { prisma } from "@/lib/prisma"

// Métricas de la ruleta para el dashboard:
// - disponibles: códigos aún válidos (no usados y dentro de las 24h)
// - total / usados
// - porDia: cuántos códigos entraron cada día (hora de RD), últimos 14 días.
export async function GET() {
	const session = await obtenerSesion()
	if (!session?.user) {
		return NextResponse.json({ error: "No autorizado" }, { status: 401 })
	}

	try {
		const totales = await prisma.$queryRawUnsafe<Array<any>>(
			`SELECT
				COUNT(*)::int AS "total",
				COUNT(*) FILTER (WHERE "usado" = true)::int AS "usados",
				COUNT(*) FILTER (WHERE "usado" = false AND "createdAt" > NOW() - INTERVAL '24 hours')::int AS "disponibles"
			 FROM "RuletaDescuento"`
		)

		// createdAt es TIMESTAMP sin zona, guardado en UTC (NOW() con sesión en UTC).
		// Lo interpretamos como UTC y lo pasamos a hora de RD para agrupar por día.
		const porDia = await prisma.$queryRawUnsafe<Array<any>>(
			`SELECT
				to_char((("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'America/Santo_Domingo')::date, 'YYYY-MM-DD') AS "dia",
				COUNT(*)::int AS "n"
			 FROM "RuletaDescuento"
			 GROUP BY 1
			 ORDER BY 1 DESC
			 LIMIT 14`
		)

		const t = totales[0] ?? {}
		return NextResponse.json({
			disponibles: t.disponibles ?? 0,
			total: t.total ?? 0,
			usados: t.usados ?? 0,
			porDia,
		})
	} catch (e: any) {
		if (e.message?.includes("does not exist") || e.message?.includes("relation")) {
			return NextResponse.json({ disponibles: 0, total: 0, usados: 0, porDia: [], sinTabla: true })
		}
		console.error("Error en /api/ruleta/stats:", e)
		return NextResponse.json({ error: e?.message || "Error" }, { status: 500 })
	}
}
