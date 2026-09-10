// Un código de la ruleta es válido SOLO el día en que se generó
// (zona horaria de República Dominicana).
const TZ = "America/Santo_Domingo"

function diaLocal(fecha: Date | string): string {
	const fmt = new Intl.DateTimeFormat("en-CA", {
		timeZone: TZ,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	})
	return fmt.format(new Date(fecha)) // YYYY-MM-DD
}

/** true si el código ya no es de hoy (vencido). */
export function estaVencido(createdAt: Date | string): boolean {
	return diaLocal(createdAt) !== diaLocal(new Date())
}
