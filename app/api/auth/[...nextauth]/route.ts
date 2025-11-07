import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Configuración para Next.js 13+ App Router
export const runtime = "nodejs"

