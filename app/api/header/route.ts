import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
	if (!process.env.DATABASE_URL) {
		// Retornar configuración por defecto si no hay BD
		return NextResponse.json({
			logoText: "parma",
			logoImage: null,
			navLinks: [
				{ label: "Catálogo", href: "/perfumes" },
				{ label: "Garantía", href: "/garantia" },
			],
		})
	}

	try {
		// Intentar leer la configuración del header
		let config: any
		try {
			config = await prisma.$queryRaw<Array<any>>`
				SELECT "logoText", "logoImage", "navLinks"
				FROM "HeaderConfig"
				WHERE id = 'main'
				LIMIT 1
			`
		} catch (e: any) {
			// Si la tabla no existe, retornar configuración por defecto
			if (e.message?.includes("does not exist") || e.message?.includes("relation")) {
				return NextResponse.json({
					logoText: "parma",
					logoImage: null,
					navLinks: [
						{ label: "Catálogo", href: "/perfumes" },
						{ label: "Garantía", href: "/garantia" },
					],
				})
			}
			throw e
		}

		if (!config || config.length === 0) {
			return NextResponse.json({
				logoText: "parma",
				logoImage: null,
				navLinks: [
					{ label: "Catálogo", href: "/perfumes" },
					{ label: "Garantía", href: "/garantia" },
				],
			})
		}

		const headerConfig = config[0]
		return NextResponse.json({
			logoText: headerConfig.logoText || "parma",
			logoImage: headerConfig.logoImage || null,
			navLinks: Array.isArray(headerConfig.navLinks) ? headerConfig.navLinks : [
				{ label: "Catálogo", href: "/perfumes" },
				{ label: "Garantía", href: "/garantia" },
			],
		})
	} catch (e: any) {
		console.error("Error al cargar configuración del header:", e)
		return NextResponse.json({
			logoText: "parma",
			logoImage: null,
			navLinks: [
				{ label: "Catálogo", href: "/perfumes" },
				{ label: "Garantía", href: "/garantia" },
			],
		})
	}
}

export async function PUT(req: NextRequest) {
	if (!process.env.DATABASE_URL) {
		return new NextResponse("DB no configurada", { status: 501 })
	}

	try {
		const data = await req.json()

		// Convertir navLinks a JSONB
		const navLinksJson = JSON.stringify(data.navLinks || [])

		// Intentar actualizar o crear la configuración
		try {
			// Intentar actualizar usando casting explícito a JSONB
			await prisma.$executeRawUnsafe(
				`UPDATE "HeaderConfig" SET "logoText" = $1, "logoImage" = $2, "navLinks" = $3::jsonb, "updatedAt" = NOW() WHERE id = 'main'`,
				data.logoText || "parma",
				data.logoImage || null,
				navLinksJson
			)
		} catch (e: any) {
			// Si no existe, crear
			if (e.message?.includes("does not exist") || e.message?.includes("relation")) {
				// La tabla no existe, retornar error para que el usuario la cree
				return new NextResponse(
					"La tabla 'HeaderConfig' no existe. Ejecuta el script SQL 'crear_tabla_header_config.sql' en Supabase.",
					{ status: 500 }
				)
			}
			// Si no hay filas actualizadas, crear una nueva
			try {
				await prisma.$executeRawUnsafe(
					`INSERT INTO "HeaderConfig" (id, "logoText", "logoImage", "navLinks", "createdAt", "updatedAt") 
					VALUES ('main', $1, $2, $3::jsonb, NOW(), NOW())`,
					data.logoText || "parma",
					data.logoImage || null,
					navLinksJson
				)
			} catch (insertError: any) {
				if (insertError.message?.includes("does not exist") || insertError.message?.includes("relation")) {
					return new NextResponse(
						"La tabla 'HeaderConfig' no existe. Ejecuta el script SQL 'crear_tabla_header_config.sql' en Supabase.",
						{ status: 500 }
					)
				}
				throw insertError
			}
		}

		return NextResponse.json({ success: true })
	} catch (e: any) {
		console.error("Error al guardar configuración del header:", e)
		return new NextResponse(e?.message || "Error al guardar", { status: 500 })
	}
}

