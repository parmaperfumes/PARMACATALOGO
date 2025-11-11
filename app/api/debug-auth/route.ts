import { NextResponse } from "next/server"

export async function GET() {
  // Este endpoint solo debe estar disponible en desarrollo
  // NUNCA en producción con datos sensibles
  
  const envCheck = {
    hasDatabase: !!process.env.DATABASE_URL,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    hasAdminEmail: !!process.env.ADMIN_EMAIL,
    hasAdminPassword: !!process.env.ADMIN_PASSWORD,
    adminEmail: process.env.ADMIN_EMAIL, // Solo en debug
    nodeEnv: process.env.NODE_ENV,
  }
  
  return NextResponse.json(envCheck)
}

