import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { promises as dns } from "dns"
import { prisma } from "@/lib/prisma"
import { enviarCodigoPremio, mailerConfigurado } from "@/lib/mailer"
import { normalizarPremios } from "@/lib/sopa"

const ALLOWLIST = new Set(
	["erick099037@gmail.com", ...(process.env.RULETA_ALLOWLIST ?? "").split(",")]
		.map((c) => c.trim().toLowerCase())
		.filter(Boolean)
)

const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

function generarCodigo(): string {
	let s = ""
	for (let i = 0; i < 6; i++) s += ALFABETO[crypto.randomInt(0, ALFABETO.length)]
	return `PARMA-${s}`
}

function correoValido(correo: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
}

async function dominioRecibeCorreo(correo: string): Promise<boolean> {
	const dominio = correo.split("@")[1]?.trim().toLowerCase()
	if (!dominio || dominio.includes("..") || dominio.startsWith(".") || dominio.endsWith(".")) return false
	try {
		const mx = await dns.resolveMx(dominio)
		return Array.isArray(mx) && mx.length > 0
	} catch (e: any) {
		if (e?.code === "ENOTFOUND" || e?.code === "ENODATA") return false
		return true
	}
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const correo = String(body.correo ?? "").trim().toLowerCase()
		const etiqueta = String(body.etiqueta ?? "").trim()

		if (!correoValido(correo)) {
			return NextResponse.json({ error: "Correo inválido" }, { status: 400 })
		}
		if (!(await dominioRecibeCorreo(correo))) {
			return NextResponse.json({ error: "Ese correo no parece válido. Revísalo e inténtalo de nuevo." }, { status: 400 })
		}

		// Config de la sopa: activa + premio elegido.
		let activa = true
		let premios: { etiqueta: string; descuento: number }[] = []
		try {
			const rows = await prisma.$queryRawUnsafe<Array<any>>(
				`SELECT "activa", "premios" FROM "SopaConfig" WHERE id = 'main' LIMIT 1`
			)
			activa = rows?.[0]?.activa !== false
			premios = normalizarPremios(rows?.[0]?.premios)
		} catch {
			return NextResponse.json({ error: "El juego no está disponible." }, { status: 503 })
		}
		if (!activa) {
			return NextResponse.json({ error: "El juego no está disponible en este momento." }, { status: 403 })
		}
		const premio = premios.find((p) => p.etiqueta === etiqueta) ?? premios[0]
		if (!premio) {
			return NextResponse.json({ error: "Premio no válido." }, { status: 400 })
		}

		const puedeRepetir = ALLOWLIST.has(correo)
		if (!puedeRepetir) {
			const existe = await prisma.$queryRawUnsafe<Array<{ correo: string }>>(
				`SELECT "correo" FROM "RuletaDescuento" WHERE "correo" = $1 LIMIT 1`,
				correo
			)
			if (existe.length > 0) {
				return NextResponse.json({ error: "Este correo ya participó.", yaParticipo: true }, { status: 409 })
			}
		}
		const correoGuardar = puedeRepetir
			? correo.replace("@", `+s${Date.now().toString(36)}@`)
			: correo

		// Código único.
		let codigo = ""
		for (let i = 0; i < 5; i++) {
			codigo = generarCodigo()
			const choca = await prisma.$queryRawUnsafe<Array<{ codigo: string }>>(
				`SELECT "codigo" FROM "RuletaDescuento" WHERE "codigo" = $1 LIMIT 1`,
				codigo
			)
			if (choca.length === 0) break
		}

		const id = crypto.randomUUID()
		try {
			await prisma.$executeRawUnsafe(
				`INSERT INTO "RuletaDescuento" ("id", "codigo", "correo", "descuento", "premio", "juego", "usado", "createdAt")
				 VALUES ($1, $2, $3, $4, $5, 'sopa', false, NOW())`,
				id,
				codigo,
				correoGuardar,
				premio.descuento,
				premio.etiqueta
			)
		} catch (e: any) {
			if (e.message?.includes("duplicate") || e.message?.includes("unique")) {
				return NextResponse.json({ error: "Este correo ya participó.", yaParticipo: true }, { status: 409 })
			}
			if (e.message?.includes("does not exist") || e.message?.includes("column") || e.message?.includes("relation")) {
				return NextResponse.json(
					{ error: "Falta correr las migraciones (premio/juego). Ejecuta scripts/agregar_premio_juego.sql en Supabase." },
					{ status: 500 }
				)
			}
			throw e
		}

		const enviado = await enviarCodigoPremio(correo, codigo, premio.etiqueta)
		return NextResponse.json({ codigo, correoEnviado: enviado, mailerConfigurado })
	} catch (e: any) {
		console.error("Error en /api/sopa/reclamar:", e)
		return NextResponse.json({ error: e?.message || "Error al reclamar" }, { status: 500 })
	}
}
