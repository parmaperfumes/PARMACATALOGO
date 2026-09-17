import nodemailer from "nodemailer"

// Configuracion de correo para enviar los codigos de la ruleta.
// Las credenciales se leen de variables de entorno (ver .env).

const host = process.env.SMTP_HOST
const port = Number(process.env.SMTP_PORT ?? 465)
const user = process.env.SMTP_USER
const pass = process.env.SMTP_PASS
const from = process.env.SMTP_FROM ?? user

// Numero de WhatsApp del negocio (formato internacional, sin +).
const WHATSAPP = process.env.WHATSAPP_NUMERO ?? "18494714762"

export const mailerConfigurado = Boolean(host && user && pass)

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
	if (!mailerConfigurado) return null
	if (!transporter) {
		transporter = nodemailer.createTransport({
			host,
			port,
			secure: port === 465, // 465 = SSL, 587 = STARTTLS
			auth: { user, pass },
		})
	}
	return transporter
}

/** Construye el HTML del correo del premio. Exportado para previsualizar/probar. */
export function plantillaCorreoDescuento(codigo: string, descuento: number): string {
	const msg = encodeURIComponent(
		`Hola 👋, jugué en la ruleta de Parma y gané un ${descuento}% de descuento. Mi código es ${codigo} ✅`
	)
	const waLink = `https://wa.me/${WHATSAPP}?text=${msg}`

	return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0; padding:0; background:#f2f2f4;">
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f4; padding:24px 12px;">
		<tr><td align="center">
			<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">

				<!-- Header marca -->
				<tr><td style="background-color:#16255c; padding:22px; text-align:center;">
					<span style="font-family:Georgia,'Times New Roman',serif; font-size:26px; letter-spacing:6px; color:#ffffff; font-weight:bold;">PARMA</span>
					<div style="font-family:Arial,sans-serif; font-size:10px; letter-spacing:3px; color:#8fa3d8; margin-top:4px;">PERFUMES</div>
				</td></tr>

				<!-- Cuerpo -->
				<tr><td style="padding:32px 28px 8px; text-align:center; font-family:Arial,sans-serif;">
					<div style="font-size:34px;">🎉</div>
					<h1 style="font-size:22px; color:#111; margin:8px 0 4px;">¡Felicidades, ganaste!</h1>
					<p style="font-size:14px; color:#6c6e78; margin:0 0 20px;">La suerte estuvo de tu lado 🍀</p>

					<!-- % gigante -->
					<div style="font-family:Arial,sans-serif; font-size:64px; font-weight:bold; color:#16255c; line-height:1;">${descuento}%</div>
					<div style="font-size:13px; letter-spacing:2px; color:#111; font-weight:bold; margin-top:2px;">DE DESCUENTO</div>

					<!-- Código -->
					<div style="background-color:#16255c; border-radius:12px; padding:18px; margin:24px 0 8px;">
						<div style="font-size:11px; letter-spacing:2px; color:#8fa3d8; margin-bottom:6px;">TU CÓDIGO</div>
						<div style="font-family:'Courier New',monospace; font-size:26px; font-weight:bold; letter-spacing:4px; color:#ffffff;">${codigo}</div>
					</div>

					<!-- Vigencia -->
					<div style="display:inline-block; background:#fdecec; color:#c0392b; font-size:12px; font-weight:bold; padding:6px 14px; border-radius:20px; margin-top:8px;">
						⏰ Válido SOLO por hoy
					</div>
				</td></tr>

				<!-- Botón WhatsApp -->
				<tr><td style="padding:20px 28px 8px; text-align:center;">
					<a href="${waLink}" style="display:inline-block; background:#25D366; color:#ffffff; font-family:Arial,sans-serif; font-size:16px; font-weight:bold; text-decoration:none; padding:15px 32px; border-radius:30px;">
						Pedir por WhatsApp →
					</a>
					<p style="font-family:Arial,sans-serif; font-size:11px; color:#9a9ba3; margin:10px 0 0;">Tu código ya va incluido en el mensaje.</p>
				</td></tr>

				<!-- Cómo usarlo -->
				<tr><td style="padding:16px 28px 8px; font-family:Arial,sans-serif;">
					<div style="border-top:1px solid #ececef; padding-top:20px;">
						<div style="font-size:13px; font-weight:bold; color:#111; margin-bottom:12px;">Cómo usar tu descuento:</div>
						<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
							<tr><td style="font-size:13px; color:#444; padding:4px 0;"><b style="color:#16255c;">1.</b>&nbsp; Elige tu perfume favorito en el catálogo.</td></tr>
							<tr><td style="font-size:13px; color:#444; padding:4px 0;"><b style="color:#16255c;">2.</b>&nbsp; Escríbenos por WhatsApp con el botón de arriba.</td></tr>
							<tr><td style="font-size:13px; color:#444; padding:4px 0;"><b style="color:#16255c;">3.</b>&nbsp; Menciona tu código y aplicamos el descuento. 🎁</td></tr>
						</table>
					</div>
				</td></tr>

				<!-- Footer -->
				<tr><td style="padding:22px 28px 28px; text-align:center; font-family:Arial,sans-serif;">
					<div style="border-top:1px solid #ececef; padding-top:18px;">
						<p style="font-size:12px; color:#9a9ba3; margin:0 0 6px;">Válido para un solo uso. No compartas tu código.</p>
						<p style="font-size:12px; color:#6c6e78; margin:0;"><b>Parma Perfumes</b> · WhatsApp: 849-471-4762</p>
					</div>
				</td></tr>

			</table>
		</td></tr>
	</table>
</body>
</html>`
}

/**
 * Envia el codigo de descuento ganado al correo del cliente.
 * Devuelve true si se envio, false si el mailer no esta configurado o fallo.
 */
export async function enviarCodigoDescuento(
	correo: string,
	codigo: string,
	descuento: number
): Promise<boolean> {
	const t = getTransporter()
	if (!t) {
		console.warn("[mailer] SMTP no configurado; no se envio el correo.")
		return false
	}

	try {
		await t.sendMail({
			from,
			to: correo,
			subject: `🎁 Ganaste ${descuento}% en Parma — tu código adentro (solo por hoy)`,
			html: plantillaCorreoDescuento(codigo, descuento),
		})
		return true
	} catch (e) {
		console.error("[mailer] Error al enviar correo:", e)
		return false
	}
}

/** Plantilla para un premio con etiqueta libre (ej. "Envío gratis"). */
export function plantillaCorreoPremio(codigo: string, etiqueta: string): string {
	const msg = encodeURIComponent(
		`Hola 👋, gané en el juego de Parma: ${etiqueta}. Mi código es ${codigo} ✅`
	)
	const waLink = `https://wa.me/${WHATSAPP}?text=${msg}`

	return `
<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f2f2f4;">
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f4;padding:24px 12px;">
		<tr><td align="center">
			<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
				<tr><td style="background-color:#16255c;padding:22px;text-align:center;">
					<span style="font-family:Georgia,'Times New Roman',serif;font-size:26px;letter-spacing:6px;color:#ffffff;font-weight:bold;">PARMA</span>
					<div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px;color:#8fa3d8;margin-top:4px;">PERFUMES</div>
				</td></tr>
				<tr><td style="padding:32px 28px 8px;text-align:center;font-family:Arial,sans-serif;">
					<div style="font-size:34px;">🎉</div>
					<h1 style="font-size:22px;color:#111;margin:8px 0 4px;">¡Felicidades, ganaste!</h1>
					<div style="font-family:Arial,sans-serif;font-size:26px;font-weight:bold;color:#16255c;line-height:1.2;margin:10px 0;">${etiqueta}</div>
					<div style="background-color:#16255c;border-radius:12px;padding:18px;margin:24px 0 8px;">
						<div style="font-size:11px;letter-spacing:2px;color:#8fa3d8;margin-bottom:6px;">TU CÓDIGO</div>
						<div style="font-family:'Courier New',monospace;font-size:26px;font-weight:bold;letter-spacing:4px;color:#ffffff;">${codigo}</div>
					</div>
				</td></tr>
				<tr><td style="padding:20px 28px 8px;text-align:center;">
					<a href="${waLink}" style="display:inline-block;background:#25D366;color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;text-decoration:none;padding:15px 32px;border-radius:30px;">Pedir por WhatsApp →</a>
					<p style="font-family:Arial,sans-serif;font-size:11px;color:#9a9ba3;margin:10px 0 0;">Tu código ya va incluido en el mensaje.</p>
				</td></tr>
				<tr><td style="padding:22px 28px 28px;text-align:center;font-family:Arial,sans-serif;">
					<div style="border-top:1px solid #ececef;padding-top:18px;">
						<p style="font-size:12px;color:#9a9ba3;margin:0 0 6px;">Válido para un solo uso. No compartas tu código.</p>
						<p style="font-size:12px;color:#6c6e78;margin:0;"><b>Parma Perfumes</b> · WhatsApp: 849-471-4762</p>
					</div>
				</td></tr>
			</table>
		</td></tr>
	</table>
</body></html>`
}

/** Envía un código con una etiqueta de premio libre. */
export async function enviarCodigoPremio(
	correo: string,
	codigo: string,
	etiqueta: string
): Promise<boolean> {
	const t = getTransporter()
	if (!t) {
		console.warn("[mailer] SMTP no configurado; no se envió el correo.")
		return false
	}
	try {
		await t.sendMail({
			from,
			to: correo,
			subject: `🎁 Ganaste: ${etiqueta} en Parma — tu código adentro`,
			html: plantillaCorreoPremio(codigo, etiqueta),
		})
		return true
	} catch (e) {
		console.error("[mailer] Error al enviar correo de premio:", e)
		return false
	}
}
