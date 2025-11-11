import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/auth"

// Rutas que requieren autenticación
const protectedPaths = [
  '/admin',
  '/dashboard',
  '/perfumes/new',
  '/perfumes/edit',
  '/header',
  '/diagnostico'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Verificar si es una ruta protegida
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path))
  
  if (isProtectedRoute) {
    // Obtener la sesión
    const session = await auth()
    
    // Si no hay sesión, redirigir a login
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  return NextResponse.next()
}

// Configurar qué rutas debe procesar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

