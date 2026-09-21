// Cómo se ESCRIBEN los datos del catálogo en pantalla (brand/parma-manual.html,
// secciones 04 y 07). Sólo presentación: la base y el mensaje de WhatsApp siguen
// con el texto original.

// Se quedan en minúscula salvo al principio: "Bleu de Chanel", "Acqua di Gio".
const PALABRAS_BAJAS = new Set(["de", "del", "di", "of", "by", "la", "y", "et", "pour", "in", "with", "the"])
// Siglas y nombres que la casa escribe en mayúsculas.
const SE_QUEDAN = new Set(["MYSLF", "EDP", "EDT", "VIP", "XS", "II", "III", "IV"])

const conMayuscula = (palabra: string): string => {
	// "d'hermès" -> "d'Hermès": el artículo apostrofado no es la inicial del nombre.
	const apostrofo = palabra.indexOf("'")
	if (apostrofo > 0 && apostrofo <= 2 && apostrofo < palabra.length - 1) {
		return palabra.slice(0, apostrofo + 1) + conMayuscula(palabra.slice(apostrofo + 1))
	}
	return palabra.charAt(0).toUpperCase() + palabra.slice(1)
}

export const nombreDePerfume = (crudo: string): string =>
	crudo
		.trim()
		.split(/\s+/)
		.map((palabra, i) => {
			if (SE_QUEDAN.has(palabra.toUpperCase())) return palabra.toUpperCase()
			const letras = palabra.replace(/[^\p{L}]/gu, "")
			const mayusculas = letras.replace(/[^\p{Lu}]/gu, "").length
			// "TriBeCa" y "NoMad" vienen bien escritos: mezcla con minoría de mayúsculas.
			const bienEscrita = mayusculas > 0 && mayusculas <= letras.length / 2 && palabra.charAt(0) !== palabra.charAt(0).toLowerCase()
			const baja = palabra.toLowerCase()
			if (i > 0 && PALABRAS_BAJAS.has(baja)) return baja
			if (bienEscrita) return palabra
			return conMayuscula(baja)
		})
		.join(" ")

// "1,350 RD" -> "RD$ 1,350". Si el texto no trae un número, se muestra tal cual.
export const precioRD = (crudo: string): string => {
	const numero = crudo.match(/\d[\d.,]*/)
	return numero ? `RD$ ${numero[0]}` : crudo
}

// El precio cuando la base no trae uno propio (28 de 79 perfumes el 2026-09-21).
// Lo leen la tarjeta y los datos para buscadores: si cada uno tuviera su copia,
// Google vería un precio y el cliente otro.
export const PRECIO_POR_DEFECTO: Record<30 | 50, string> = { 30: "850 RD", 50: "1,350 RD" }
