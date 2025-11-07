import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import EmailProvider from "next-auth/providers/email"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

const hasDB = !!process.env.DATABASE_URL
const getPrisma = async () => {
	if (!hasDB) return undefined
	try {
		return (await import("@/lib/prisma")).prisma
	} catch {
		// prisma client no generado; tratar como si no hubiera DB
		return undefined
	}
}

type AppRole = "ADMIN" | "EDITOR" | "PUBLIC"

export const authOptions: NextAuthOptions = {
  adapter: undefined,
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        const email = credentials?.email?.toString().toLowerCase()
        const password = credentials?.password || ""
        if (!email || !password) return null

        const prisma = await getPrisma()
        if (prisma) {
          try {
            const user: any = await prisma.user.findUnique({ where: { email } })
            if (user?.passwordHash) {
              const ok = await bcrypt.compare(password, user.passwordHash)
              if (ok) return { id: user.id, name: user.name, email: user.email, role: (user.role as AppRole) || "PUBLIC" }
            }
          } catch {}
        }

        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
        const adminPass = process.env.ADMIN_PASSWORD
        const adminHash = process.env.ADMIN_PASSWORD_HASH
        if (adminEmail && (adminPass || adminHash)) {
          const passOk = adminHash ? await bcrypt.compare(password, adminHash) : password === adminPass
          if (email === adminEmail && passOk) {
            return { id: "admin", name: "Admin", email: adminEmail, role: "ADMIN" as AppRole }
          }
        }
        return null
      },
    }),
    ...(process.env.SMTP_HOST && process.env.SMTP_PORT
      ? [
          EmailProvider({
            server: { host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT), auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } },
            from: process.env.SMTP_FROM,
          }),
        ]
      : []),
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
  session: { strategy: 'jwt' },
}

