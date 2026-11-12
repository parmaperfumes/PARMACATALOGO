import { NextRequest, NextResponse } from "next/server";

/**
 * Redirecciones defensivas para URLs mal copiadas/pegadas.
 * Ej: /perfumes]  -> /perfumes
 */
export function middleware(req: NextRequest) {
  // El catálogo viejo en Render (parmacatalogo.onrender.com) manda todo al sitio nuevo.
  const host = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "").toLowerCase();
  if (host.split(":")[0].endsWith(".onrender.com")) {
    return NextResponse.redirect("https://parmaperfume.com/perfumes", 301);
  }

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

