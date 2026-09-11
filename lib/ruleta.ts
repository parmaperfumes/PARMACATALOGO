// Un código de la ruleta es válido durante 24 horas desde que se generó.
// Pasadas las 24h, el código queda "Finalizado" (vencido) y ya no se puede usar.

export const HORAS_VALIDEZ = 24
const MS_VALIDEZ = HORAS_VALIDEZ * 60 * 60 * 1000

/** Momento exacto en que el código vence (creación + 24h). */
export function venceEn(createdAt: Date | string): Date {
	return new Date(new Date(createdAt).getTime() + MS_VALIDEZ)
}

/** Milisegundos que faltan para vencer (0 o negativo si ya venció). */
export function msRestantes(createdAt: Date | string): number {
	return venceEn(createdAt).getTime() - Date.now()
}

/** true si ya pasaron 24h desde que se generó (vencido / finalizado). */
export function estaVencido(createdAt: Date | string): boolean {
	return msRestantes(createdAt) <= 0
}
