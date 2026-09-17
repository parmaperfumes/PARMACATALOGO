import { NextRequest, NextResponse } from "next/server"
import { obtenerSesion } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { normalizarPremios, PREMIOS_DEFAULT } from "@/lib/ruleta-premios"

// Config del juego "Juega y Gana": visible/oculto + premios (valores y probabilidad).
// Por defecto está VISIBLE con los premios por defecto.

function faltaTabla(e: any): boolean {
	const m = e?.message || ""
	return m.includes("does not exist") || m.includes("relation") || m.includes("column")
}

async function leerConfig() {
	const rows = await prisma.$queryRawUnsafe<Array<any>>(
		`SELECT "activa", "premios" FROM "RuletaConfig" WHERE id = 'main' LIMIT 1`
	)
	const row = rows?.[0]
	return {
		activa: row?.activa !== false, // ausente/true => visible
		premios: normalizarPremios(row?.premios),
	}
}

// GET público: lo usa el botón/rueda del sitio.
export async function GET() {
	if (!process.env.DATABASE_URL) {
		return NextResponse.json({ activa: true, premios: PREMIOS_DEFAULT })
	}
	try {
		return NextResponse.json(await leerConfig())
	} catch (e: any) {
		if (faltaTabla(e)) return NextResponse.json({ activa: true, premios: PREMIOS_DEFAULT })
		console.error("Error en GET /api/ruleta/config:", e)
		return NextResponse.json({ activa: true, premios: PREMIOS_DEFAULT })
	}
}

// PUT admin: actualiza lo que se envíe (activa y/o premios); lo demás se conserva.
export async function PUT(req: NextRequest) {
	const session = await obtenerSesion()
	if (!session?.user) {
		return NextResponse.json({ error: "No autorizado" }, { status: 401 })
	}

	try {
		const body = await req.json()

		// Estado actual (para fusionar campos no enviados).
		let actual = { activa: true, premios: PREMIOS_DEFAULT as any }
		try {
			actual = await leerConfig()
		} catch (e: any) {
			if (!faltaTabla(e)) throw e
		}

		const activa = typeof body.activa === "boolean" ? body.activa : actual.activa
		const premios =
			body.premios !== undefined ? normalizarPremios(body.premios) : actual.premios

		try {
			await prisma.$executeRawUnsafe(
				`INSERT INTO "RuletaConfig" (id, "activa", "premios", "updatedAt")
				 VALUES ('main', $1, $2::jsonb, NOW())
				 ON CONFLICT (id) DO UPDATE SET "activa" = $1, "premios" = $2::jsonb, "updatedAt" = NOW()`,
				activa,
				JSON.stringify(premios)
			)
		} catch (e: any) {
			if (faltaTabla(e)) {
				return NextResponse.json(
					{ error: "Falta la tabla/columna de RuletaConfig. Ejecuta scripts/agregar_ruleta_config.sql en Supabase." },
					{ status: 500 }
				)
			}
			throw e
		}

		return NextResponse.json({ success: true, activa, premios })
	} catch (e: any) {
		console.error("Error en PUT /api/ruleta/config:", e)
		return NextResponse.json({ error: e?.message || "Error al guardar" }, { status: 500 })
	}
}
