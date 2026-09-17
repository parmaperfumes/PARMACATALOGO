import { NextRequest, NextResponse } from "next/server"
import { obtenerSesion } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { normalizarCrucigrama, CRUCIGRAMA_DEFAULT } from "@/lib/crucigrama"

function faltaTabla(e: any): boolean {
	const m = e?.message || ""
	return m.includes("does not exist") || m.includes("relation") || m.includes("column")
}

async function leerConfig() {
	const rows = await prisma.$queryRawUnsafe<Array<any>>(
		`SELECT "activa", "descuento", "filas", "columnas", "entradas"
		 FROM "CrucigramaConfig" WHERE id = 'main' LIMIT 1`
	)
	const row = rows?.[0]
	if (!row) return CRUCIGRAMA_DEFAULT
	return normalizarCrucigrama({
		activa: row.activa,
		descuento: row.descuento,
		filas: row.filas,
		columnas: row.columnas,
		entradas: row.entradas,
	})
}

// GET público: lo usa la vista previa y (más adelante) el juego del sitio.
export async function GET() {
	if (!process.env.DATABASE_URL) return NextResponse.json(CRUCIGRAMA_DEFAULT)
	try {
		return NextResponse.json(await leerConfig())
	} catch (e: any) {
		if (faltaTabla(e)) return NextResponse.json(CRUCIGRAMA_DEFAULT)
		console.error("Error en GET /api/crucigrama/config:", e)
		return NextResponse.json(CRUCIGRAMA_DEFAULT)
	}
}

// PUT admin: guarda toda la configuración del crucigrama.
export async function PUT(req: NextRequest) {
	const session = await obtenerSesion()
	if (!session?.user) {
		return NextResponse.json({ error: "No autorizado" }, { status: 401 })
	}

	try {
		const cfg = normalizarCrucigrama(await req.json())
		try {
			await prisma.$executeRawUnsafe(
				`INSERT INTO "CrucigramaConfig" (id, "activa", "descuento", "filas", "columnas", "entradas", "updatedAt")
				 VALUES ('main', $1, $2, $3, $4, $5::jsonb, NOW())
				 ON CONFLICT (id) DO UPDATE SET
				   "activa" = $1, "descuento" = $2, "filas" = $3, "columnas" = $4, "entradas" = $5::jsonb, "updatedAt" = NOW()`,
				cfg.activa,
				cfg.descuento,
				cfg.filas,
				cfg.columnas,
				JSON.stringify(cfg.entradas)
			)
		} catch (e: any) {
			if (faltaTabla(e)) {
				return NextResponse.json(
					{ error: "Falta la tabla 'CrucigramaConfig'. Ejecuta scripts/agregar_crucigrama_config.sql en Supabase." },
					{ status: 500 }
				)
			}
			throw e
		}
		return NextResponse.json({ success: true, ...cfg })
	} catch (e: any) {
		console.error("Error en PUT /api/crucigrama/config:", e)
		return NextResponse.json({ error: e?.message || "Error al guardar" }, { status: 500 })
	}
}
