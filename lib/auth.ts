import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import EmailProvider from "next-auth/providers/email"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  adapter: process.env.DATABASE_URL ? PrismaAdapter(prisma) as any : undefined,
  trustHost: true,
  providers: [
    ...(process.env.SMTP_HOST && process.env.SMTP_PORT
      ? [
          EmailProvider({
            server: {
              host: process.env.SMTP_HOST,
              port: Number(process.env.SMTP_PORT),
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
              },
            },
            from: process.env.SMTP_FROM,
          }),
        ]
      : []),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        try {
          if (process.env.DATABASE_URL) {
            const dbUser = await prisma.user.findUnique({
              where: { email: session.user.email! },
              select: { role: true, id: true },
            })
            session.user.role = dbUser?.role || Role.PUBLIC
            session.user.id = dbUser?.id
          } else {
            // Si no hay base de datos, usar valores por defecto
            session.user.role = Role.PUBLIC
            session.user.id = token.sub
          }
        } catch (error) {
          // Si hay error con la base de datos, usar valores por defecto
          session.user.role = Role.PUBLIC
          session.user.id = token.sub
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || Role.PUBLIC
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
}

