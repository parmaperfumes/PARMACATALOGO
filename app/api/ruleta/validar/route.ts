import { NextRequest, NextResponse } from "next/server"
import { obtenerSesion } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { estaVencido } from "@/lib/ruleta"

// Valida un codigo para el vendedor: dice si es real, el %, y si ya se uso.
export async function GET(req: NextRequest) {
	const session = await obtenerSesion()
	if (!session?.user) {
		return NextResponse.json({ error: "No autorizado" }, { status: 401 })
	}

	const codigo = (req.nextUrl.searchParams.get("codigo") ?? "").trim().toUpperCase()
	if (!codigo) {
		return NextResponse.json({ error: "Falta el código" }, { status: 400 })
	}

	try {
		const rows = await prisma.$queryRawUnsafe<Array<any>>(
			`SELECT "codigo", "correo", "descuento", "usado", "telefono", "usadoEn", "createdAt"
			 FROM "RuletaDescuento" WHERE "codigo" = $1 LIMIT 1`,
			codigo
		)

		if (rows.length === 0) {
			return NextResponse.json({ existe: false })
		}

		const r = rows[0]
		return NextResponse.json({
			existe: true,
			codigo: r.codigo,
			correo: r.correo,
			descuento: r.descuento,
			usado: r.usado,
			vencido: estaVencido(r.createdAt),
			telefono: r.telefono,
			usadoEn: r.usadoEn,
			createdAt: r.createdAt,
		})
	} catch (e: any) {
		console.error("Error en /api/ruleta/validar:", e)
		return NextResponse.json({ error: e?.message || "Error" }, { status: 500 })
	}
}
