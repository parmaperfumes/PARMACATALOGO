// Qué sello va sobre la foto de un perfume (brand/parma-manual.html, «Sello sobre
// la foto»). Uno solo y en este orden: «Quedan N», «Nuevo», «Re-stock», «Más vendido».
// «Nuevo» lo llevan los 3 agregados más recientes y «Más vendido» el top 5 de ventas
// que calcula Labs (el del Dashboard). «Re-stock» sale de la Etiqueta del admin
// (vuelve desde el 2026-10-03; entre el 23-09 y esa fecha no se mostraba).

export type TonoSello = "quedan" | "nuevo" | "restock" | "vendido"
export type Sello = { texto: string; tono: TonoSello }

export const NUEVOS_CUANTOS = 3
const QUEDAN_MAX = 3

// El número llega de afuera (inventario de Labs): sólo vale un entero de 1 a 3.
export const quedanValido = (x: unknown): number | null =>
	typeof x === "number" && Number.isInteger(x) && x >= 1 && x <= QUEDAN_MAX ? x : null

export function selloDe(p: {
	quedan?: number | null
	esNuevo?: boolean
	esRestock?: boolean
	masVendido?: boolean
}): Sello | null {
	const quedan = quedanValido(p.quedan)
	if (quedan !== null) return { texto: quedan === 1 ? "Queda 1" : `Quedan ${quedan}`, tono: "quedan" }
	if (p.esNuevo === true) return { texto: "Nuevo", tono: "nuevo" }
	if (p.esRestock === true) return { texto: "Re-stock", tono: "restock" }
	if (p.masVendido === true) return { texto: "Más vendido", tono: "vendido" }
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
