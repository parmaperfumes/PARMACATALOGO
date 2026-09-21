// La ficha del catálogo que leen las máquinas (Google, Bing, ChatGPT): un bloque
// JSON-LD de schema.org dentro de la página. El cliente no lo ve; dice lo MISMO que
// las tarjetas —nombre, foto, precio y si hay— porque marcar algo que la página no
// muestra es lo que los buscadores castigan.

import { z } from "zod"
import { nombreDePerfume, PRECIO_POR_DEFECTO } from "@/lib/formato"
import { DESCRIPCION_SITIO, NOMBRE_SITIO, URL_SITIO, WHATSAPP_SITIO } from "@/lib/sitio"

const perfumeParaBuscadores = z.object({
	nombre: z.string().trim().min(1),
	imagenPrincipal: z.string().url(),
	genero: z.string().nullish(),
	sku: z.string().nullish(),
	sizes: z.array(z.number()).default([]),
	precio30: z.string().nullish(),
	precio50: z.string().nullish(),
	agotado30: z.boolean().optional(),
	agotado50: z.boolean().optional(),
})

const PUBLICO: Record<string, string> = { HOMBRE: "Hombre", MUJER: "Mujer", UNISEX: "Unisex" }

// "1,350 RD" -> 1350. Pesos enteros, igual que el carrito de WhatsApp.
const precioANumero = (crudo: string): number | null => {
	const numero = parseInt(crudo.replace(/[^\d]/g, ""), 10)
	return Number.isFinite(numero) && numero > 0 ? numero : null
}

const ID_TIENDA = `${URL_SITIO}/#tienda`

const oferta = (ml: 30 | 50, precioCrudo: string | null | undefined, agotado: boolean | undefined) => {
	const precio = precioANumero(precioCrudo || PRECIO_POR_DEFECTO[ml])
	if (precio === null) return null
	return {
		"@type": "Offer",
		name: `${ml} ml`,
		price: precio,
		priceCurrency: "DOP",
		// Sin `url` ni `seller` por oferta: son los de la página, y repetidos 158 veces pesaban 17 KB.
		availability: agotado ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
	}
}

const producto = (crudo: unknown) => {
	const leido = perfumeParaBuscadores.safeParse(crudo)
	// Un perfume mal cargado no entra a la ficha; la tarjeta lo sigue mostrando.
	if (!leido.success) return null
	const p = leido.data

	const ofertas = ([30, 50] as const)
		.filter((ml) => p.sizes.includes(ml))
		.map((ml) => oferta(ml, ml === 30 ? p.precio30 : p.precio50, ml === 30 ? p.agotado30 : p.agotado50))
		.filter((o) => o !== null)
	if (ofertas.length === 0) return null

	const publico = p.genero ? PUBLICO[p.genero.trim().toUpperCase()] : undefined
	return {
		"@type": "Product",
		name: nombreDePerfume(p.nombre),
		image: p.imagenPrincipal,
		...(p.sku ? { sku: p.sku.trim() } : {}),
		// La marca es Parma: son extractos propios, no el perfume de la casa que los inspira.
		brand: { "@type": "Brand", name: NOMBRE_SITIO },
		category: publico ? `Perfumes · ${publico}` : "Perfumes",
		offers: ofertas,
	}
}

export const datosDelCatalogo = (perfumes: unknown[]) => {
	const productos = perfumes.map(producto).filter((p) => p !== null)
	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "OnlineStore",
				"@id": ID_TIENDA,
				name: NOMBRE_SITIO,
				url: URL_SITIO,
				logo: `${URL_SITIO}/parma-logo-noche.png`,
				description: DESCRIPCION_SITIO,
				areaServed: { "@type": "Country", name: "República Dominicana" },
				contactPoint: {
					"@type": "ContactPoint",
					contactType: "Ventas por WhatsApp",
					telephone: WHATSAPP_SITIO,
					availableLanguage: "es",
				},
			},
			{
				"@type": "ItemList",
				name: "Catálogo de Parma Perfumes",
				numberOfItems: productos.length,
				itemListElement: productos.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })),
			},
		],
	}
}

// `<` escapado: un nombre de perfume con "</script>" cerraría el bloque y el resto
// se leería como HTML.
export const jsonLdSeguro = (datos: unknown): string => JSON.stringify(datos).replace(/</g, "\\u003c")
