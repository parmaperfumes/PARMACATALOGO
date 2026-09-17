import { NextRequest, NextResponse } from "next/server"
import { obtenerSesion } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { normalizarSopa, SOPA_DEFAULT } from "@/lib/sopa"

function faltaTabla(e: any): boolean {
	const m = e?.message || ""
	return m.includes("does not exist") || m.includes("relation") || m.includes("column")
}

async function leerConfig() {
	const rows = await prisma.$queryRawUnsafe<Array<any>>(
		`SELECT "activa", "descuento", "filas", "columnas", "palabras", "letras", "colocaciones", "premios"
		 FROM "SopaConfig" WHERE id = 'main' LIMIT 1`
	)
	const row = rows?.[0]
	if (!row) return SOPA_DEFAULT
	return normalizarSopa(row)
}

// GET público: lo usa la vista previa y (más adelante) el juego del sitio.
export async function GET() {
	if (!process.env.DATABASE_URL) return NextResponse.json(SOPA_DEFAULT)
	try {
		return NextResponse.json(await leerConfig())
	} catch (e: any) {
		if (faltaTabla(e)) return NextResponse.json(SOPA_DEFAULT)
		console.error("Error en GET /api/sopa/config:", e)
		return NextResponse.json(SOPA_DEFAULT)
	}
}

// PUT admin: guarda toda la configuración de la sopa.
export async function PUT(req: NextRequest) {
	const session = await obtenerSesion()
	if (!session?.user) {
		return NextResponse.json({ error: "No autorizado" }, { status: 401 })
	}

	try {
		const cfg = normalizarSopa(await req.json())
		try {
			await prisma.$executeRawUnsafe(
				`INSERT INTO "SopaConfig" (id, "activa", "descuento", "filas", "columnas", "palabras", "letras", "colocaciones", "premios", "updatedAt")
				 VALUES ('main', $1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8::jsonb, NOW())
				 ON CONFLICT (id) DO UPDATE SET
				   "activa" = $1, "descuento" = $2, "filas" = $3, "columnas" = $4,
				   "palabras" = $5::jsonb, "letras" = $6::jsonb, "colocaciones" = $7::jsonb, "premios" = $8::jsonb, "updatedAt" = NOW()`,
				cfg.activa,
				cfg.descuento,
				cfg.filas,
				cfg.columnas,
				JSON.stringify(cfg.palabras),
				JSON.stringify(cfg.letras),
				JSON.stringify(cfg.colocaciones),
				JSON.stringify(cfg.premios)
			)
		} catch (e: any) {
			if (faltaTabla(e)) {
				return NextResponse.json(
					{ error: "Falta la tabla 'SopaConfig'. Ejecuta scripts/agregar_sopa_config.sql en Supabase." },
					{ status: 500 }
				)
			}
			throw e
		}
		return NextResponse.json({ success: true, ...cfg })
	} catch (e: any) {
		console.error("Error en PUT /api/sopa/config:", e)
		return NextResponse.json({ error: e?.message || "Error al guardar" }, { status: 500 })
	}
}
