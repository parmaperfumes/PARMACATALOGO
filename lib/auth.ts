import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

const hasDB = !!process.env.DATABASE_URL

// Función para obtener Prisma de forma segura
const getPrisma = async () => {
	if (!hasDB) return undefined
	try {
		const prismaModule = await import("@/lib/prisma")
		return prismaModule.prisma
	} catch (error) {
		console.warn("Prisma no disponible:", error)
		return undefined
	}
}

type AppRole = "ADMIN" | "EDITOR" | "PUBLIC"

// No configurar adapter en el nivel superior para evitar errores
// Se configurará dinámicamente si es necesario

export const authOptions = {
  adapter: undefined, // No usar adapter si no hay DB configurada
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        const email = credentials?.email?.toString().toLowerCase()
        const password = (credentials?.password as string) || ""
        if (!email || !password) return null

        const prisma = await getPrisma()
        if (prisma) {
          try {
            const user: any = await prisma.user.findUnique({ where: { email } })
            if (user?.passwordHash) {
              const ok = await bcrypt.compare(password, String(user.passwordHash))
              if (ok) return { id: user.id, name: user.name, email: user.email, role: (user.role as AppRole) || "PUBLIC" }
            }
          } catch {}
        }

        // Autenticación con variables de entorno (para desarrollo sin DB)
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()?.trim()
        const adminPass = process.env.ADMIN_PASSWORD?.trim()
        const adminHash = process.env.ADMIN_PASSWORD_HASH?.trim()
        
        if (adminEmail && email === adminEmail) {
          if (adminHash) {
            // Si hay hash, comparar con bcrypt
            try {
              const passOk = await bcrypt.compare(password, adminHash)
              if (passOk) {
                return { id: "admin", name: "Admin", email: adminEmail, role: "ADMIN" as AppRole }
              }
            } catch (error) {
              console.error("Error comparando hash:", error)
            }
          } else if (adminPass && password === adminPass) {
            // Si no hay hash, comparar directamente
            return { id: "admin", name: "Admin", email: adminEmail, role: "ADMIN" as AppRole }
          }
        }
        return null
      },
    }),
    // EmailProvider requiere adapter, así que solo si hay DB configurada
    // (No incluirlo si no hay DB para evitar errores)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }),
        ]
      : []),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        try {
          const prisma = await getPrisma()
          if (prisma) {
            const dbUser = await prisma.user.findUnique({ where: { email: session.user.email! }, select: { role: true, id: true } })
            session.user.role = (dbUser?.role as any) || (token.role as any) || ("PUBLIC" as AppRole)
            session.user.id = (dbUser?.id as any) || (token.sub as any)
          } else {
            session.user.role = ((token as any).role as any) || ("PUBLIC" as AppRole)
            session.user.id = token.sub
          }
        } catch {
          session.user.role = ((token as any).role as any) || ("PUBLIC" as AppRole)
          session.user.id = token.sub
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role || token.role || ("PUBLIC" as AppRole)
      return token
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' as const },
  secret: process.env.NEXTAUTH_SECRET,
}

