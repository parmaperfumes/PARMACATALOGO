// Premios de la ruleta: valor de descuento (%) y su peso (probabilidad relativa).
// Helpers puros (sin dependencias de servidor) para usar en cliente y servidor.

export type Premio = { valor: number; peso: number }

export const PREMIOS_DEFAULT: Premio[] = [
	{ valor: 5, peso: 51 },
	{ valor: 10, peso: 48 },
	{ valor: 15, peso: 1 },
]

/** Limpia/valida lo que venga de la BD o del formulario. Siempre devuelve algo usable. */
export function normalizarPremios(raw: any): Premio[] {
	let arr = raw
	if (typeof arr === "string") {
		try {
			arr = JSON.parse(arr)
		} catch {
			arr = null
		}
	}
	if (!Array.isArray(arr)) return PREMIOS_DEFAULT

	const out: Premio[] = []
	for (const p of arr) {
		const valor = Math.round(Number(p?.valor))
		const peso = Number(p?.peso)
		if (Number.isFinite(valor) && valor > 0 && valor <= 100) {
			out.push({ valor, peso: Number.isFinite(peso) && peso > 0 ? peso : 0 })
		}
	}
	return out.length > 0 ? out : PREMIOS_DEFAULT
}

/** Construye los gajos visibles de la rueda a partir de los premios. */
export function construirGajos(premios: Premio[]): number[] {
	const valores = premios.map((p) => p.valor)
	if (valores.length === 0) return [5, 10, 15]
	if (valores.length >= 6) return valores
	const gajos: number[] = []
	let i = 0
	while (gajos.length < 8) gajos.push(valores[i++ % valores.length])
	return gajos
}
