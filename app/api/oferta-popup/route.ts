import { NextRequest, NextResponse } from "next/server"
import { exigirSesion } from "@/lib/session"
import { prisma } from "@/lib/prisma"

// Popup de ofertas de /perfumes. Se configura en Ajustes del Catálogo.
// Tabla: scripts/agregar_oferta_popup.sql

const MENSAJE_OFERTA_DEFAULT = "Hola 👋, quiero pedir la oferta que vi en el catálogo."

const APAGADO = { activo: false, imagen: null, mensajeWhatsApp: MENSAJE_OFERTA_DEFAULT }

export async function GET() {
	if (!process.env.DATABASE_URL) return NextResponse.json(APAGADO)

	try {
		const filas = await prisma.$queryRawUnsafe<Array<any>>(
			`SELECT "activo", "imagen", "mensajeWhatsApp" FROM "OfertaPopupConfig" WHERE id = 'main' LIMIT 1`
		)
		const f = filas[0]
		if (!f) return NextResponse.json(APAGADO)
		return NextResponse.json({
			activo: f.activo === true,
			imagen: f.imagen || null,
			mensajeWhatsApp: f.mensajeWhatsApp || MENSAJE_OFERTA_DEFAULT,
		})
	} catch (e) {
		// Sin tabla (script sin ejecutar) o DB caída: el popup simplemente no sale.
		console.error("Error en GET /api/oferta-popup:", e)
		return NextResponse.json(APAGADO)
	}
}

export async function PUT(req: NextRequest) {
	const bloqueo = await exigirSesion()
	if (bloqueo) return bloqueo

	if (!process.env.DATABASE_URL) {
		return new NextResponse("DB no configurada", { status: 501 })
	}

	const data = await req.json()
	const activo = data.activo === true
	const imagen = typeof data.imagen === "string" && data.imagen.trim() ? data.imagen.trim() : null
	const mensajeWhatsApp =
		typeof data.mensajeWhatsApp === "string" && data.mensajeWhatsApp.trim()
			? data.mensajeWhatsApp.trim()
			: MENSAJE_OFERTA_DEFAULT

	if (activo && !imagen) {
		return new NextResponse("Sube la imagen de la oferta antes de activar el popup.", { status: 400 })
	}

	try {
		await prisma.$executeRawUnsafe(
			`INSERT INTO "OfertaPopupConfig" (id, "activo", "imagen", "mensajeWhatsApp", "updatedAt")
			 VALUES ('main', $1, $2, $3, NOW())
			 ON CONFLICT (id) DO UPDATE SET "activo" = $1, "imagen" = $2, "mensajeWhatsApp" = $3, "updatedAt" = NOW()`,
			activo,
			imagen,
			mensajeWhatsApp
		)
		return NextResponse.json({ success: true })
	} catch (e: any) {
		if (e.message?.includes("does not exist") || e.message?.includes("relation")) {
			return new NextResponse(
				"Falta la tabla 'OfertaPopupConfig'. Ejecuta scripts/agregar_oferta_popup.sql en Supabase.",
				{ status: 500 }
			)
		}
		console.error("Error en PUT /api/oferta-popup:", e)
		return new NextResponse(e?.message || "Error al guardar", { status: 500 })
	}
}
