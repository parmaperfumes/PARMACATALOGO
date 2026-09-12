import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// Estado del juego "Juega y Gana" (visible/oculto en el sitio).
// Por defecto está VISIBLE (activa = true).

function faltaTabla(e: any): boolean {
	const m = e?.message || ""
	return m.includes("does not exist") || m.includes("relation") || m.includes("column")
}

// GET público: lo usa el botón del sitio para saber si mostrarse.
export async function GET() {
	if (!process.env.DATABASE_URL) return NextResponse.json({ activa: true })
	try {
		const rows = await prisma.$queryRawUnsafe<Array<any>>(
			`SELECT "activa" FROM "RuletaConfig" WHERE id = 'main' LIMIT 1`
		)
		const activa = rows?.[0]?.activa
		return NextResponse.json({ activa: activa !== false }) // ausente/true => visible
	} catch (e: any) {
		if (faltaTabla(e)) return NextResponse.json({ activa: true })
		console.error("Error en GET /api/ruleta/config:", e)
		return NextResponse.json({ activa: true })
	}
}

// PUT admin: prende o apaga el juego.
export async function PUT(req: NextRequest) {
	const session = await auth()
	if (!session?.user) {
		return NextResponse.json({ error: "No autorizado" }, { status: 401 })
	}

	try {
		const body = await req.json()
		const activa = Boolean(body.activa)
		try {
			await prisma.$executeRawUnsafe(
				`INSERT INTO "RuletaConfig" (id, "activa", "updatedAt")
				 VALUES ('main', $1, NOW())
				 ON CONFLICT (id) DO UPDATE SET "activa" = $1, "updatedAt" = NOW()`,
				activa
			)
		} catch (e: any) {
			if (faltaTabla(e)) {
				return NextResponse.json(
					{ error: "Falta la tabla 'RuletaConfig'. Ejecuta scripts/agregar_ruleta_config.sql en Supabase." },
					{ status: 500 }
				)
			}
			throw e
		}
		return NextResponse.json({ success: true, activa })
	} catch (e: any) {
		console.error("Error en PUT /api/ruleta/config:", e)
		return NextResponse.json({ error: e?.message || "Error al guardar" }, { status: 500 })
	}
}
