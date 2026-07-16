import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const DEFAULT_NAV = [
	{ label: "Catálogo", href: "/perfumes" },
	{ label: "Garantía", href: "/garantia" },
]

const DEFAULT_ANNOUNCEMENTS = [
	{ emoji: "🚚", text: "ENVÍO GRATIS (ZONA METROPOLITANA)" },
	{ emoji: "💵", text: "PAGO CONTRA ENTREGA" },
]

const DEFAULT_CONFIG = {
	logoText: "parma",
	logoImage: null,
	navLinks: DEFAULT_NAV,
	announcements: DEFAULT_ANNOUNCEMENTS,
}

export async function GET() {
	if (!process.env.DATABASE_URL) {
		return NextResponse.json(DEFAULT_CONFIG)
	}

	try {
		// Intentar leer la configuración del header
		let config: any
		try {
			config = await prisma.$queryRaw<Array<any>>`
				SELECT "logoText", "logoImage", "navLinks", "announcements"
				FROM "HeaderConfig"
				WHERE id = 'main'
				LIMIT 1
			`
		} catch (e: any) {
			// Si la tabla/columna no existe, retornar configuración por defecto
			if (e.message?.includes("does not exist") || e.message?.includes("relation") || e.message?.includes("column")) {
				return NextResponse.json(DEFAULT_CONFIG)
			}
			throw e
		}

		if (!config || config.length === 0) {
			return NextResponse.json(DEFAULT_CONFIG)
		}

		const headerConfig = config[0]
		const announcements = Array.isArray(headerConfig.announcements) && headerConfig.announcements.length > 0
			? headerConfig.announcements
			: DEFAULT_ANNOUNCEMENTS
		return NextResponse.json({
			logoText: headerConfig.logoText || "parma",
			logoImage: headerConfig.logoImage || null,
			navLinks: Array.isArray(headerConfig.navLinks) ? headerConfig.navLinks : DEFAULT_NAV,
			announcements,
		})
	} catch (e: any) {
		console.error("Error al cargar configuración del header:", e)
		return NextResponse.json(DEFAULT_CONFIG)
	}
}

export async function PUT(req: NextRequest) {
	if (!process.env.DATABASE_URL) {
		return new NextResponse("DB no configurada", { status: 501 })
	}

	try {
		const data = await req.json()

		// Convertir a JSONB
		const navLinksJson = JSON.stringify(data.navLinks || [])
		// Normalizar anuncios: solo los que tengan texto o emoji
		const announcementsArr = Array.isArray(data.announcements)
			? data.announcements
				.map((a: any) => ({ emoji: String(a?.emoji || ""), text: String(a?.text || "") }))
				.filter((a: any) => a.emoji.trim() !== "" || a.text.trim() !== "")
			: []
		const announcementsJson = JSON.stringify(announcementsArr)

		const notFound = (msg?: string) =>
			msg?.includes("does not exist") || msg?.includes("relation")

		try {
			// Intentar actualizar usando casting explícito a JSONB
			await prisma.$executeRawUnsafe(
				`UPDATE "HeaderConfig" SET "logoText" = $1, "logoImage" = $2, "navLinks" = $3::jsonb, "announcements" = $4::jsonb, "updatedAt" = NOW() WHERE id = 'main'`,
				data.logoText || "parma",
				data.logoImage || null,
				navLinksJson,
				announcementsJson
			)
			// Asegurar que exista la fila (si no había ninguna, la crea)
			await prisma.$executeRawUnsafe(
				`INSERT INTO "HeaderConfig" (id, "logoText", "logoImage", "navLinks", "announcements", "createdAt", "updatedAt")
				 VALUES ('main', $1, $2, $3::jsonb, $4::jsonb, NOW(), NOW())
				 ON CONFLICT (id) DO UPDATE SET "logoText" = $1, "logoImage" = $2, "navLinks" = $3::jsonb, "announcements" = $4::jsonb, "updatedAt" = NOW()`,
				data.logoText || "parma",
				data.logoImage || null,
				navLinksJson,
				announcementsJson
			)
		} catch (e: any) {
			if (notFound(e.message)) {
				return new NextResponse(
					"La tabla 'HeaderConfig' no existe o le falta la columna 'announcements'. Ejecuta la migración (prisma db push).",
					{ status: 500 }
				)
			}
			throw e
		}

		return NextResponse.json({ success: true })
	} catch (e: any) {
		console.error("Error al guardar configuración del header:", e)
		return new NextResponse(e?.message || "Error al guardar", { status: 500 })
	}
}
