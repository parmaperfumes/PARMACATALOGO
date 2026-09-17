// Crucigrama de cuadrícula manual: el admin coloca cada palabra (posición +
// dirección). Helpers puros para construir la grilla (preview y público).

export type Direccion = "H" | "V" // H = horizontal, V = vertical

export type Entrada = {
	palabra: string
	pista: string
	fila: number // 1-based
	columna: number // 1-based
	direccion: Direccion
}

export type CrucigramaConfig = {
	activa: boolean
	descuento: number // % que gana el cliente al resolverlo
	filas: number
	columnas: number
	entradas: Entrada[]
}

export const CRUCIGRAMA_DEFAULT: CrucigramaConfig = {
	activa: false,
	descuento: 10,
	filas: 8,
	columnas: 8,
	entradas: [],
}

function soloLetras(s: string): string {
	return String(s || "")
		.toUpperCase()
		.replace(/[^A-ZÁÉÍÓÚÜÑ]/gi, "")
}

export function normalizarCrucigrama(raw: any): CrucigramaConfig {
	let obj = raw
	if (typeof obj === "string") {
		try {
			obj = JSON.parse(obj)
		} catch {
			obj = null
		}
	}
	if (!obj || typeof obj !== "object") return CRUCIGRAMA_DEFAULT

	const filas = clamp(Math.round(Number(obj.filas)) || 8, 3, 20)
	const columnas = clamp(Math.round(Number(obj.columnas)) || 8, 3, 20)
	const entradas: Entrada[] = Array.isArray(obj.entradas)
		? obj.entradas
				.map((e: any) => ({
					palabra: soloLetras(e?.palabra),
					pista: String(e?.pista ?? "").trim(),
					fila: clamp(Math.round(Number(e?.fila)) || 1, 1, filas),
					columna: clamp(Math.round(Number(e?.columna)) || 1, 1, columnas),
					direccion: e?.direccion === "V" ? "V" : "H",
				}))
				.filter((e: Entrada) => e.palabra.length > 0)
		: []

	return {
		activa: obj.activa !== false ? Boolean(obj.activa) : false,
		descuento: clamp(Math.round(Number(obj.descuento)) || 10, 1, 100),
		filas,
		columnas,
		entradas,
	}
}

function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n))
}

export type Celda = { letra: string; numero?: number; activa: boolean }
export type Pista = { numero: number; direccion: Direccion; pista: string; palabra: string }

/** Construye la grilla renderizable + las listas de pistas numeradas. */
export function construirGrilla(cfg: CrucigramaConfig): {
	celdas: Celda[][]
	horizontales: Pista[]
	verticales: Pista[]
} {
	const { filas, columnas, entradas } = cfg
	const celdas: Celda[][] = Array.from({ length: filas }, () =>
		Array.from({ length: columnas }, () => ({ letra: "", activa: false }))
	)

	const inicios: Array<{ r: number; c: number }> = []
	const marcarInicio = (r: number, c: number) => {
		if (!inicios.some((p) => p.r === r && p.c === c)) inicios.push({ r, c })
	}

	for (const e of entradas) {
		const r0 = e.fila - 1
		const c0 = e.columna - 1
		if (r0 < 0 || c0 < 0 || r0 >= filas || c0 >= columnas) continue
		marcarInicio(r0, c0)
		for (let k = 0; k < e.palabra.length; k++) {
			const r = e.direccion === "V" ? r0 + k : r0
			const c = e.direccion === "H" ? c0 + k : c0
			if (r >= filas || c >= columnas) break
			celdas[r][c] = { ...celdas[r][c], letra: e.palabra[k], activa: true }
		}
	}

	// Numeración en orden de lectura (arriba->abajo, izq->der).
	const numeroDe = new Map<string, number>()
	let n = 0
	for (let r = 0; r < filas; r++) {
		for (let c = 0; c < columnas; c++) {
			if (inicios.some((p) => p.r === r && p.c === c)) {
				n++
				numeroDe.set(`${r},${c}`, n)
				celdas[r][c].numero = n
			}
		}
	}

	const horizontales: Pista[] = []
	const verticales: Pista[] = []
	for (const e of entradas) {
		const r0 = e.fila - 1
		const c0 = e.columna - 1
		const numero = numeroDe.get(`${r0},${c0}`) ?? 0
		const pista: Pista = { numero, direccion: e.direccion, pista: e.pista, palabra: e.palabra }
		;(e.direccion === "H" ? horizontales : verticales).push(pista)
	}
	horizontales.sort((a, b) => a.numero - b.numero)
	verticales.sort((a, b) => a.numero - b.numero)

	return { celdas, horizontales, verticales }
}
