import type { Metadata } from "next"
import { Cormorant_Garamond, Inter, Poppins } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { VisitTracker } from "@/components/VisitTracker"
import { DESCRIPCION_SITIO, NOMBRE_SITIO, TITULO_SITIO, URL_SITIO } from "@/lib/sitio"

const inter = Inter({ subsets: ["latin"] })
// Letra de titulos y nombres de perfume (brand/parma-manual.html, seccion 04).
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cormorant",
})
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITIO),
  title: { default: TITULO_SITIO, template: `%s · ${NOMBRE_SITIO}` },
  description: DESCRIPCION_SITIO,
  applicationName: NOMBRE_SITIO,
  openGraph: {
    type: "website",
    siteName: NOMBRE_SITIO,
    title: TITULO_SITIO,
    description: DESCRIPCION_SITIO,
    url: "/perfumes",
    locale: "es_DO",
    images: ["/parma-logo-noche.png"],
  },
  manifest: "/manifest.json",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es-DO" suppressHydrationWarning>
      <body className={`${inter.className} ${poppins.variable} ${cormorant.variable}`} suppressHydrationWarning>
        <AuthProvider>
          <VisitTracker />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

