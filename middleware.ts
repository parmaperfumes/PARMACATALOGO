import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  
  // Rutas protegidas que requieren autenticación
  const protectedRoutes = [
    '/admin',
    '/dashboard',
    '/perfumes/new',
    '/perfumes/:id/edit',
    '/header',
    '/diagnostico'
  ]
  
  // Verificar si la ruta actual es protegida
  const isProtectedRoute = protectedRoutes.some(route => {
    if (route.includes(':id')) {
      // Para rutas dinámicas como /perfumes/:id/edit
      const pattern = route.replace(':id', '[^/]+')
      return new RegExp(`^${pattern}$`).test(pathname)
    }
    return pathname.startsWith(route)
  })
  
  // Si es una ruta protegida y NO está logueado, redirigir a login
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Si está logueado y trata de ir a /login, redirigir a /admin
  if (pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }
  
  return NextResponse.next()
})

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

