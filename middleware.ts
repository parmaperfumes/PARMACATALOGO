import { NextRequest, NextResponse } from "next/server";

/**
 * Redirecciones defensivas para URLs mal copiadas/pegadas.
 * Ej: /perfumes]  -> /perfumes
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Si alguien llega con un corchete de cierre al final, lo normalizamos.
  if (pathname === "/perfumes]" || pathname === "/perfumes%5D") {
    url.pathname = "/perfumes";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  // Ejecutar middleware sólo en rutas "normales", evitando assets de Next.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

