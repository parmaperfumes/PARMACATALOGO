// Qué sello va sobre la foto de un perfume (brand/parma-manual.html, «Sello sobre
// la foto»). Uno solo y en este orden: «Quedan N» le gana a «Nuevo», y «Nuevo» a
// «Más vendido». Desde el 2026-09-23 «Re-stock» no se muestra y «Nuevo» ya no sale
// de la marca del admin: lo llevan solos los 3 perfumes agregados más recientes.

export type TonoSello = "quedan" | "nuevo" | "vendido"
export type Sello = { texto: string; tono: TonoSello }

export const NUEVOS_CUANTOS = 3
const QUEDAN_MAX = 3

// El número llega de afuera (inventario de Labs): sólo vale un entero de 1 a 3.
export const quedanValido = (x: unknown): number | null =>
	typeof x === "number" && Number.isInteger(x) && x >= 1 && x <= QUEDAN_MAX ? x : null

export function selloDe(p: {
	quedan?: number | null
	esNuevo?: boolean
	tipoLanzamiento?: string | null
}): Sello | null {
	const quedan = quedanValido(p.quedan)
	if (quedan !== null) return { texto: quedan === 1 ? "Queda 1" : `Quedan ${quedan}`, tono: "quedan" }
	if (p.esNuevo === true) return { texto: "Nuevo", tono: "nuevo" }
	// En la base, "NUEVO" es el valor que el admin muestra como «Más vendido».
	if (p.tipoLanzamiento === "NUEVO") return { texto: "Más vendido", tono: "vendido" }
	return null
}

// Los agregados más recientemente, entre los perfumes que se ven. Uno sin fecha
// no entra: no se sabe si es nuevo.
export function idsNuevos(
	perfumes: { id: string; createdAt?: Date | string | null }[],
	cuantos = NUEVOS_CUANTOS
): Set<string> {
	const conFecha = perfumes
		.map((p) => ({ id: p.id, t: p.createdAt ? new Date(p.createdAt).getTime() : NaN }))
		.filter((p) => Number.isFinite(p.t))
		.sort((a, b) => b.t - a.t)
	return new Set(conFecha.slice(0, cuantos).map((p) => p.id))
}
