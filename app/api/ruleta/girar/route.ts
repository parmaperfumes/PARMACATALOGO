import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { promises as dns } from "dns"
import { prisma } from "@/lib/prisma"
import { enviarCodigoDescuento, mailerConfigurado } from "@/lib/mailer"
import { normalizarPremios, PREMIOS_DEFAULT, type Premio } from "@/lib/ruleta-premios"

// Correos que SIEMPRE pueden participar (pruebas). Configurable por env
// RULETA_ALLOWLIST (separados por coma). Incluye por defecto el del dueño.
const ALLOWLIST = new Set(
	[
		"erick099037@gmail.com",
		...(process.env.RULETA_ALLOWLIST ?? "").split(","),
	]
		.map((c) => c.trim().toLowerCase())
		.filter(Boolean)
)

// Alfabeto sin caracteres confusos (fuera 0/O, 1/I/L).
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

function generarCodigo(): string {
	let s = ""
	for (let i = 0; i < 6; i++) {
		s += ALFABETO[crypto.randomInt(0, ALFABETO.length)]
	}
	return `PARMA-${s}`
}

// Sorteo del lado del SERVIDOR (el navegador nunca decide el premio).
// Elige un premio según su peso (probabilidad relativa). Configurable desde el admin.
function sortearDescuento(premios: Premio[]): number {
	const pesos = premios.map((p) => Math.max(0, Math.round(p.peso)))
	const total = pesos.reduce((a, b) => a + b, 0)
	if (total <= 0) return premios[0]?.valor ?? 5
	let n = crypto.randomInt(0, total)
	for (let i = 0; i < premios.length; i++) {
		if (n < pesos[i]) return premios[i].valor
		n -= pesos[i]
	}
	return premios[premios.length - 1].valor
}

// Lee la config de la ruleta (si el juego está activo y sus premios).
async function leerConfigRuleta(): Promise<{ activa: boolean; premios: Premio[] }> {
	try {
		const rows = await prisma.$queryRawUnsafe<Array<any>>(
			`SELECT "activa", "premios" FROM "RuletaConfig" WHERE id = 'main' LIMIT 1`
		)
		const row = rows?.[0]
		return { activa: row?.activa !== false, premios: normalizarPremios(row?.premios) }
	} catch {
		return { activa: true, premios: PREMIOS_DEFAULT }
	}
}

function correoValido(correo: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
}

// Comprueba que el DOMINIO del correo realmente pueda recibir emails (tiene MX).
// Atrapa dominios mal escritos o inventados (gmal.com, dominio-que-no-existe.com).
// No puede saber si el buzón exacto existe, pero descarta la mayoría de la basura.
// Ante un error de red/DNS transitorio NO bloquea al cliente (fail-open).
async function dominioRecibeCorreo(correo: string): Promise<boolean> {
	const dominio = correo.split("@")[1]?.trim().toLowerCase()
	if (!dominio || dominio.includes("..") || dominio.startsWith(".") || dominio.endsWith(".")) {
		return false
	}
	try {
		const mx = await dns.resolveMx(dominio)
		return Array.isArray(mx) && mx.length > 0
	} catch (e: any) {
		// Dominio inexistente o sin correo => inválido. Otros errores => no bloquear.
		if (e?.code === "ENOTFOUND" || e?.code === "ENODATA") return false
		return true
	}
}

export async function POST(req: NextRequest) {
	try {
		const { correo: correoRaw } = await req.json()
		const correo = String(correoRaw ?? "").trim().toLowerCase()

		if (!correoValido(correo)) {
			return NextResponse.json(
				{ error: "Correo inválido" },
				{ status: 400 }
			)
		}

		// Config de la ruleta: si el juego está apagado, no se puede jugar.
		const { activa, premios } = await leerConfigRuleta()
		if (!activa) {
			return NextResponse.json(
				{ error: "El juego no está disponible en este momento." },
				{ status: 403 }
			)
		}

		// El dominio debe poder recibir correos (descarta typos y dominios inventados).
		if (!(await dominioRecibeCorreo(correo))) {
			return NextResponse.json(
				{ error: "Ese correo no parece válido. Revísalo e inténtalo de nuevo." },
				{ status: 400 }
			)
		}

		const puedeRepetir = ALLOWLIST.has(correo)

		// ¿Este correo ya jugó? (un correo = un giro). Los de la lista blanca se saltan el candado.
		if (!puedeRepetir) {
			const existente = await prisma.$queryRawUnsafe<Array<{ descuento: number }>>(
				`SELECT "descuento" FROM "RuletaDescuento" WHERE "correo" = $1 LIMIT 1`,
				correo
			)
			if (existente.length > 0) {
				return NextResponse.json(
					{ error: "Este correo ya participó.", yaParticipo: true },
					{ status: 409 }
				)
			}
		}

		// Para los de lista blanca guardamos una etiqueta única (Gmail la ignora
		// y entrega al mismo buzón) para no violar el UNIQUE de "correo".
		const correoGuardar = puedeRepetir
			? correo.replace("@", `+r${Date.now().toString(36)}@`)
			: correo

		const descuento = sortearDescuento(premios)

		// Genera un código único; reintenta si (muy raro) colisiona.
		let codigo = ""
		for (let intento = 0; intento < 5; intento++) {
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
				`INSERT INTO "RuletaDescuento" ("id", "codigo", "correo", "descuento", "usado", "createdAt")
				 VALUES ($1, $2, $3, $4, false, NOW())`,
				id,
				codigo,
				correoGuardar,
				descuento
			)
		} catch (e: any) {
			// Carrera: dos giros del mismo correo casi al mismo tiempo.
			if (e.message?.includes("duplicate") || e.message?.includes("unique")) {
				return NextResponse.json(
					{ error: "Este correo ya participó.", yaParticipo: true },
					{ status: 409 }
				)
			}
			if (e.message?.includes("does not exist") || e.message?.includes("relation")) {
				return NextResponse.json(
					{ error: "La tabla 'RuletaDescuento' no existe. Ejecuta scripts/crear_tabla_ruleta.sql en Supabase." },
					{ status: 500 }
				)
			}
			throw e
		}

		// Envia el codigo por correo (si el SMTP esta configurado).
		const enviado = await enviarCodigoDescuento(correo, codigo, descuento)

		return NextResponse.json({
			descuento,
			codigo,
			correoEnviado: enviado,
			mailerConfigurado,
		})
	} catch (e: any) {
		console.error("Error en /api/ruleta/girar:", e)
		return NextResponse.json(
			{ error: e?.message || "Error al girar" },
			{ status: 500 }
		)
	}
}
