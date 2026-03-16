import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const DEFAULTS = {
	mensajeTitulo: "¿Necesitas ayuda personalizada?",
	mensajeTexto: "Te ayudamos a encontrar el perfume ideal para ti. ¿Hablamos por WhatsApp?",
	mensajeWhatsApp: "Hola 👋, necesito ayuda personalizada para elegir mi perfume.",
}

export async function GET() {
	if (!process.env.DATABASE_URL) {
		return NextResponse.json(DEFAULTS)
	}

	try {
		const config = await prisma.$queryRawUnsafe<Array<any>>(
			`SELECT "mensajeTitulo", "mensajeTexto", "mensajeWhatsApp"
			 FROM "CatalogPopupConfig"
			 WHERE id = 'main'
			 LIMIT 1`
		)
		if (!config || config.length === 0) {
			return NextResponse.json(DEFAULTS)
		}
		const row = config[0]
		return NextResponse.json({
			mensajeTitulo: row.mensajeTitulo ?? DEFAULTS.mensajeTitulo,
			mensajeTexto: row.mensajeTexto ?? DEFAULTS.mensajeTexto,
			mensajeWhatsApp: row.mensajeWhatsApp ?? DEFAULTS.mensajeWhatsApp,
		})
	} catch (e: any) {
		if (e.message?.includes("does not exist") || e.message?.includes("relation") || e.message?.includes("column")) {
			return NextResponse.json(DEFAULTS)
		}
		console.error("Error al cargar config popup:", e)
		return NextResponse.json(DEFAULTS)
	}
}

export async function PUT(req: NextRequest) {
	if (!process.env.DATABASE_URL) {
		return new NextResponse("DB no configurada", { status: 501 })
	}

	try {
		const data = await req.json()
		const mensajeTitulo = data.mensajeTitulo ?? DEFAULTS.mensajeTitulo
		const mensajeTexto = data.mensajeTexto ?? DEFAULTS.mensajeTexto
		const mensajeWhatsApp = data.mensajeWhatsApp ?? DEFAULTS.mensajeWhatsApp

		try {
			await prisma.$executeRawUnsafe(
				`UPDATE "CatalogPopupConfig" SET "mensajeTitulo" = $1, "mensajeTexto" = $2, "mensajeWhatsApp" = $3, "updatedAt" = NOW() WHERE id = 'main'`,
				mensajeTitulo,
				mensajeTexto,
				mensajeWhatsApp
			)
			// Si no hubo filas afectadas, insertar
			await prisma.$executeRawUnsafe(
				`INSERT INTO "CatalogPopupConfig" (id, "mensajeTitulo", "mensajeTexto", "mensajeWhatsApp", "createdAt", "updatedAt")
				 VALUES ('main', $1, $2, $3, NOW(), NOW())
				 ON CONFLICT (id) DO UPDATE SET "mensajeTitulo" = $1, "mensajeTexto" = $2, "mensajeWhatsApp" = $3, "updatedAt" = NOW()`,
				mensajeTitulo,
				mensajeTexto,
				mensajeWhatsApp
			)
		} catch (sqlError: any) {
			if (sqlError.message?.includes("does not exist") || sqlError.message?.includes("relation")) {
				return new NextResponse(
					"La tabla 'CatalogPopupConfig' no existe. Ejecuta el script SQL 'scripts/agregar_catalog_popup_config.sql' en Supabase.",
					{ status: 500 }
				)
			}
			throw sqlError
		}

		return NextResponse.json({ success: true })
	} catch (e: any) {
		console.error("Error al guardar config popup:", e)
		return new NextResponse(e?.message || "Error al guardar", { status: 500 })
	}
}
