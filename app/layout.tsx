import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { VisitTracker } from "@/components/VisitTracker"

const inter = Inter({ subsets: ["latin"] })
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Catálogo de Perfumes",
  description: "Descubre la mejor colección de perfumes",
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
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} ${poppins.variable}`} suppressHydrationWarning>
        <AuthProvider>
          <VisitTracker />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

