import { ImapFlow } from "imapflow"
import { promises as dns } from "dns"
import { prisma } from "@/lib/prisma"

// Lee la bandeja de correo (por IMAP) buscando rebotes de "destinatario no
// encontrado" (fallos PERMANENTES, código 5.x.x) y devuelve los correos que
// rebotaron. Usa las mismas credenciales que el envío (Gmail por defecto).

type ResultadoRebotes = { correosRebotados: string[]; revisados: number }

// Extrae los destinatarios de un mensaje de rebote SOLO si es un fallo permanente.
function extraerRebotesPermanentes(raw: string): string[] {
	// 5.x.x = fallo permanente (buzón inexistente). 4.x.x = temporal (no marcar).
	if (!/Status:\s*5\.\d+\.\d+/i.test(raw)) return []

	const out = new Set<string>()

	// Cabecera que muchos servidores incluyen.
	const xfr = raw.match(/^X-Failed-Recipients:\s*(.+)$/im)
	if (xfr) {
		for (const parte of xfr[1].split(",")) {
			const m = parte.match(/[^\s<>,;]+@[^\s<>,;]+/)
			if (m) out.add(m[0].toLowerCase())
		}
	}

	// Parte estándar message/delivery-status.
	const re = /Final-Recipient:\s*(?:rfc822;)?\s*([^\s<>;]+@[^\s<>;]+)/gi
	let m: RegExpExecArray | null
	while ((m = re.exec(raw))) out.add(m[1].toLowerCase())

	return [...out]
}

export async function revisarRebotes(dias = 30): Promise<ResultadoRebotes> {
	const user = process.env.SMTP_USER
	const pass = process.env.SMTP_PASS
	const host = process.env.IMAP_HOST || "imap.gmail.com"
	const port = Number(process.env.IMAP_PORT || 993)

	if (!user || !pass) {
		throw new Error("Faltan credenciales de correo (SMTP_USER / SMTP_PASS).")
	}

	const client = new ImapFlow({
		host,
		port,
		secure: true,
		auth: { user, pass },
		logger: false,
	})

	const correos = new Set<string>()
	let revisados = 0

	await client.connect()
	try {
		const lock = await client.getMailboxLock("INBOX")
		try {
			const since = new Date(Date.now() - dias * 24 * 60 * 60 * 1000)
			// Los rebotes de Gmail vienen de "Mail Delivery Subsystem" (mailer-daemon).
			const uids = (await client.search({ since, from: "mailer-daemon" }, { uid: true })) || []
			for (const uid of uids) {
				const msg = await client.fetchOne(String(uid), { source: true }, { uid: true })
				if (!msg || !msg.source) continue
				revisados++
				const raw = msg.source.toString("utf8")
				for (const email of extraerRebotesPermanentes(raw)) correos.add(email)
			}
		} finally {
			lock.release()
		}
	} finally {
		await client.logout().catch(() => {})
	}

	return { correosRebotados: [...correos], revisados }
}

/** Marca en la BD los códigos de esos correos como rebotados. Devuelve cuántos marcó. */
export async function marcarRebotados(correos: string[]): Promise<number> {
	if (correos.length === 0) return 0
	const ph = correos.map((_, i) => `$${i + 1}`).join(",")
	return await prisma.$executeRawUnsafe(
		`UPDATE "RuletaDescuento"
		 SET "rebotado" = true, "rebotadoEn" = NOW()
		 WHERE lower("correo") IN (${ph}) AND "rebotado" = false`,
		...correos
	)
}

// Verifica si un dominio puede recibir correo (tiene registros MX).
// true = válido | false = no existe / sin correo | null = no se pudo determinar.
async function dominioTieneMX(dominio: string): Promise<boolean | null> {
	if (!dominio || dominio.includes("..") || dominio.startsWith(".") || dominio.endsWith(".")) {
		return false
	}
	try {
		const mx = await dns.resolveMx(dominio)
		return Array.isArray(mx) && mx.length > 0
	} catch (e: any) {
		if (e?.code === "ENOTFOUND" || e?.code === "ENODATA") return false
		return null // error transitorio de red/DNS: no marcar
	}
}

// Re-valida los correos YA guardados: si su dominio no existe (typos como
// ".cov", "gmal.com", dominios inventados), los marca como no válidos para que
// dejen de contar y de mostrarse. Deja intactos los dudosos (error de red).
export async function revalidarDominios(limite = 2000): Promise<number> {
	const rows = await prisma.$queryRawUnsafe<Array<{ correo: string }>>(
		`SELECT DISTINCT "correo" FROM "RuletaDescuento" WHERE "rebotado" = false LIMIT ${limite}`
	)
	const cache = new Map<string, boolean | null>()
	const invalidos: string[] = []
	for (const { correo } of rows) {
		const dominio = correo.split("@")[1]?.trim().toLowerCase()
		if (!dominio) {
			invalidos.push(correo)
			continue
		}
		if (!cache.has(dominio)) cache.set(dominio, await dominioTieneMX(dominio))
		if (cache.get(dominio) === false) invalidos.push(correo)
	}
	return await marcarRebotados(invalidos)
}

// Revisión automática en segundo plano (sin botón): se dispara al cargar el
// listado, pero como máximo una vez cada INTERVALO. No bloquea la respuesta.
let ultimaRevision = 0
let enCurso = false
const INTERVALO_MS = 5 * 60 * 1000 // 5 minutos

export function revisarRebotesEnSegundoPlano(): void {
	const ahora = Date.now()
	if (enCurso || ahora - ultimaRevision < INTERVALO_MS) return
	enCurso = true
	ultimaRevision = ahora
	void (async () => {
		// 1) Dominios muertos (typos / inventados). No necesita SMTP, funciona siempre.
		try {
			await revalidarDominios()
		} catch (e: any) {
			console.warn("[rebotes] revalidar dominios:", e?.message)
		}
		// 2) Rebotes reales por IMAP (buzones inexistentes en dominios válidos).
		try {
			const { correosRebotados } = await revisarRebotes()
			await marcarRebotados(correosRebotados)
		} catch (e: any) {
			console.warn("[rebotes] revisión IMAP:", e?.message)
		}
		enCurso = false
	})()
}

