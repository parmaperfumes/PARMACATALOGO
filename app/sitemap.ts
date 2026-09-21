import type { MetadataRoute } from "next"
import { URL_SITIO } from "@/lib/sitio"

// Sólo el catálogo. `/` redirige a `/perfumes` y `/garantia` todavía no tiene texto:
// mandar a un buscador a una página vacía resta en vez de sumar.
export default function sitemap(): MetadataRoute.Sitemap {
	return [{ url: `${URL_SITIO}/perfumes`, changeFrequency: "daily", priority: 1 }]
}
