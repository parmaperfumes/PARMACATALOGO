import { NextRequest, NextResponse } from "next/server"
import { obtenerSesion } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { estaVencido } from "@/lib/ruleta"
import { revisarRebotesEnSegundoPlano } from "@/lib/rebotes"

// Lista todos los descuentos generados por la ruleta (para el panel admin).
// Filtro opcional: ?filtro=usados | no-usados
export async function GET(req: NextRequest) {
	const session = await obtenerSesion()
	if (!session?.user) {
		return NextResponse.json({ error: "No autorizado" }, { status: 401 })
	}

	const filtro = req.nextUrl.searchParams.get("filtro")

	// Dispara (como máximo cada 5 min) la revisión de rebotes en segundo plano.
	// No se espera: no retrasa la carga del listado.
	revisarRebotesEnSegundoPlano()

	// Corre las dos consultas. Si `conRebotado` es true excluye los correos que
	// rebotaron (no legítimos). Devuelve null si la columna aún no existe.
	async function consultar(conRebotado: boolean) {
		const cond: string[] = []
		if (conRebotado) cond.push(`"rebotado" = false`)
		if (filtro === "usados") cond.push(`"usado" = true`)
		else if (filtro === "no-usados") cond.push(`"usado" = false`)
		const where = cond.length ? `WHERE ${cond.join(" AND ")}` : ""
		const baseTot = conRebotado ? `WHERE "rebotado" = false` : ""

		const rows = await prisma.$queryRawUnsafe<Array<any>>(
			`SELECT "id", "codigo", "correo", "descuento", "usado", "usadoEn", "createdAt"
			 FROM "RuletaDescuento" ${where}
			 ORDER BY "createdAt" DESC
			 LIMIT 1000`
		)
		const totales = await prisma.$queryRawUnsafe<Array<any>>(
			`SELECT
				COUNT(*)::int AS "total",
				COUNT(*) FILTER (WHERE "usado" = true)::int AS "usados",
				COUNT(*) FILTER (WHERE "usado" = false AND "createdAt" > NOW() - INTERVAL '24 hours')::int AS "disponibles",
				COUNT(*) FILTER (WHERE "descuento" = 5)::int AS "d5",
				COUNT(*) FILTER (WHERE "descuento" = 10)::int AS "d10",
				COUNT(*) FILTER (WHERE "descuento" = 15)::int AS "d15"
			 FROM "RuletaDescuento" ${baseTot}`
		)
		return { rows, totales }
	}

	try {
		let res
		try {
			res = await consultar(true) // excluye rebotados
		} catch (e: any) {
			// La columna "rebotado" aún no existe: caemos a la consulta sin ese filtro.
			if (e.message?.includes("rebotado") || e.message?.includes("does not exist")) {
				res = await consultar(false)
			} else {
				throw e
			}
		}

		const registros = res.rows.map((r) => ({ ...r, vencido: estaVencido(r.createdAt) }))
		return NextResponse.json({ registros, totales: res.totales[0] ?? {} })
	} catch (e: any) {
		if (e.message?.includes("does not exist") || e.message?.includes("relation")) {
			return NextResponse.json({ registros: [], totales: {}, sinTabla: true })
		}
		console.error("Error en /api/ruleta/listado:", e)
		return NextResponse.json({ error: e?.message || "Error" }, { status: 500 })
	}
}
