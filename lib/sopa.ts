// Sopa de letras: el admin da una lista de palabras y el sistema las esconde en
// una cuadrícula (8 direcciones) rellenando el resto con letras al azar.

export type Colocacion = {
	palabra: string
	fila: number // 1-based, primera letra
	columna: number // 1-based, primera letra
	df: number // paso en filas (-1, 0, 1)
	dc: number // paso en columnas (-1, 0, 1)
}

// Premio que el cliente puede elegir al ganar.
//  - etiqueta:  nombre del premio (lo principal que ve el cliente)
//  - descuento: % (0 si no aplica)
//  - detalle:   línea secundaria descriptiva
//  - valor:     texto a la derecha (ej. "1,550 RD", "Regalo", "0 RD")
//  - masPedido: badge "MÁS PEDIDO"
export type Premio = {
	etiqueta: string
	descuento: number
	detalle?: string
	valor?: string
	masPedido?: boolean
}

export type SopaConfig = {
	activa: boolean
	descuento: number
	filas: number
	columnas: number
	palabras: string[]
	letras: string[][] // cuadrícula generada
	colocaciones: Colocacion[] // dónde quedó cada palabra (respuestas)
	premios: Premio[] // opciones que el cliente elige al ganar
}

export const PREMIOS_SOPA_DEFAULT: Premio[] = [
	{ etiqueta: "2 Perfumes", descuento: 0, detalle: "30 ML cada uno · eliges los aromas", valor: "1,550 RD", masPedido: true },
	{ etiqueta: "1 Decant exclusivo", descuento: 0, detalle: "10 ML · en tu próxima compra", valor: "Regalo" },
	{ etiqueta: "Envío gratis", descuento: 0, detalle: "Distrito Nacional & Santiago", valor: "0 RD" },
]

export function normalizarPremios(raw: any): Premio[] {
	let arr = raw
	if (typeof arr === "string") {
		try {
			arr = JSON.parse(arr)
		} catch {
			arr = null
		}
	}
	if (!Array.isArray(arr)) return PREMIOS_SOPA_DEFAULT
	const out: Premio[] = []
	for (const p of arr) {
		const etiqueta = String(p?.etiqueta ?? "").trim()
		const descuento = Math.max(0, Math.min(100, Math.round(Number(p?.descuento)) || 0))
		if (!etiqueta) continue
		const premio: Premio = { etiqueta, descuento }
		const detalle = String(p?.detalle ?? "").trim()
		const valor = String(p?.valor ?? "").trim()
		if (detalle) premio.detalle = detalle
		if (valor) premio.valor = valor
		if (p?.masPedido) premio.masPedido = true
		out.push(premio)
	}
	return out.length > 0 ? out : PREMIOS_SOPA_DEFAULT
}

const ALFA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

const DIRECCIONES = [
	{ df: 0, dc: 1 }, // →
	{ df: 0, dc: -1 }, // ←
	{ df: 1, dc: 0 }, // ↓
	{ df: -1, dc: 0 }, // ↑
	{ df: 1, dc: 1 }, // ↘
	{ df: 1, dc: -1 }, // ↙
	{ df: -1, dc: 1 }, // ↗
	{ df: -1, dc: -1 }, // ↖
]

/** Quita acentos, pasa a mayúsculas y deja solo A-Z (Ñ→N). */
export function normalizarPalabra(s: string): string {
	return String(s || "")
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toUpperCase()
		.replace(/[^A-Z]/g, "")
}

export const SOPA_DEFAULT: SopaConfig = {
	activa: false,
	descuento: 10,
	filas: 12,
	columnas: 12,
	palabras: [],
	letras: [],
	colocaciones: [],
	premios: PREMIOS_SOPA_DEFAULT,
}

function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n))
}

/** Genera la cuadrícula colocando las palabras y rellenando lo vacío. */
export function generarSopa(
	palabrasRaw: string[],
	filas: number,
	columnas: number
): { letras: string[][]; colocaciones: Colocacion[]; noColocadas: string[]; palabras: string[] } {
	const F = clamp(Math.round(filas) || 12, 5, 20)
	const C = clamp(Math.round(columnas) || 12, 5, 20)

	// Palabras únicas, normalizadas, que quepan en la cuadrícula.
	const palabras = [...new Set(palabrasRaw.map(normalizarPalabra).filter((w) => w.length >= 2))].filter(
		(w) => w.length <= Math.max(F, C)
	)

	const grid: string[][] = Array.from({ length: F }, () => Array<string>(C).fill(""))
	const colocaciones: Colocacion[] = []
	const noColocadas: string[] = []

	for (const palabra of palabras) {
		let colocada = false
		for (let intento = 0; intento < 300 && !colocada; intento++) {
			const dir = DIRECCIONES[Math.floor(Math.random() * DIRECCIONES.length)]
			const f0 = Math.floor(Math.random() * F)
			const c0 = Math.floor(Math.random() * C)
			const fEnd = f0 + dir.df * (palabra.length - 1)
			const cEnd = c0 + dir.dc * (palabra.length - 1)
			if (fEnd < 0 || fEnd >= F || cEnd < 0 || cEnd >= C) continue

			let ok = true
			for (let k = 0; k < palabra.length; k++) {
				const cell = grid[f0 + dir.df * k][c0 + dir.dc * k]
				if (cell !== "" && cell !== palabra[k]) {
					ok = false
					break
				}
			}
			if (!ok) continue

			for (let k = 0; k < palabra.length; k++) {
				grid[f0 + dir.df * k][c0 + dir.dc * k] = palabra[k]
			}
			colocaciones.push({ palabra, fila: f0 + 1, columna: c0 + 1, df: dir.df, dc: dir.dc })
			colocada = true
		}
		if (!colocada) noColocadas.push(palabra)
	}

	// Rellena las celdas vacías con letras al azar.
	for (let f = 0; f < F; f++) {
		for (let c = 0; c < C; c++) {
			if (grid[f][c] === "") grid[f][c] = ALFA[Math.floor(Math.random() * ALFA.length)]
		}
	}

	return { letras: grid, colocaciones, noColocadas, palabras }
}

/** Conjunto de celdas "clave" (que forman parte de una palabra), para resaltar. */
export function celdasRespuesta(colocaciones: Colocacion[]): Set<string> {
	const s = new Set<string>()
	for (const co of colocaciones) {
		for (let k = 0; k < co.palabra.length; k++) {
			s.add(`${co.fila - 1 + co.df * k},${co.columna - 1 + co.dc * k}`)
		}
	}
	return s
}

/** Limpia/valida lo que venga de la BD. */
export function normalizarSopa(raw: any): SopaConfig {
	let obj = raw
	if (typeof obj === "string") {
		try {
			obj = JSON.parse(obj)
		} catch {
			obj = null
		}
	}
	if (!obj || typeof obj !== "object") return SOPA_DEFAULT

	const filas = clamp(Math.round(Number(obj.filas)) || 12, 5, 20)
	const columnas = clamp(Math.round(Number(obj.columnas)) || 12, 5, 20)
	const palabras = Array.isArray(obj.palabras)
		? [...new Set(obj.palabras.map(normalizarPalabra).filter((w: string) => w.length >= 2))]
		: []
	const letras = Array.isArray(obj.letras)
		? obj.letras.map((fila: any) => (Array.isArray(fila) ? fila.map((x: any) => String(x || "").toUpperCase().slice(0, 1)) : []))
		: []
	const colocaciones: Colocacion[] = Array.isArray(obj.colocaciones)
		? obj.colocaciones
				.map((c: any) => ({
					palabra: normalizarPalabra(c?.palabra),
					fila: Math.round(Number(c?.fila)) || 1,
					columna: Math.round(Number(c?.columna)) || 1,
					df: Math.sign(Number(c?.df) || 0),
					dc: Math.sign(Number(c?.dc) || 0),
				}))
				.filter((c: Colocacion) => c.palabra.length >= 2)
		: []

	return {
		activa: Boolean(obj.activa),
		descuento: clamp(Math.round(Number(obj.descuento)) || 10, 1, 100),
		filas,
		columnas,
		palabras: palabras as string[],
		letras,
		colocaciones,
		premios: normalizarPremios(obj.premios),
	}
}
