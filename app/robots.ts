import type { MetadataRoute } from "next"
import { URL_SITIO } from "@/lib/sitio"

// Las pantallas de administración NO se listan acá: escribirlas en un archivo
// público es regalar el mapa. Se quedan fuera del índice con `noindex` en su layout.
export default function robots(): MetadataRoute.Robots {
	return {
		rules: { userAgent: "*", allow: "/", disallow: "/api/" },
		sitemap: `${URL_SITIO}/sitemap.xml`,
	}
}
