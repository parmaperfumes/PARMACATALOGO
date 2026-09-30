import { redirect } from "next/navigation"
import { obtenerSesion } from "@/lib/session"
import { LogoutButton } from "@/components/LogoutButton"
import Link from "next/link"
import type { Metadata } from "next"

// Las pantallas de administración no van a ningún buscador.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	// Verificación de autenticación CRÍTICA (en localhost se salta; ver lib/session)
	const session = await obtenerSesion()
	
	console.log("🔒 AdminLayout - Verificando sesión:", {
		hasSession: !!session,
		user: session?.user?.email,
		timestamp: new Date().toISOString()
	})
	
	// BLOQUEO ABSOLUTO: Si no hay sesión, redirigir SIEMPRE
	if (!session || !session.user) {
		console.log("❌ AdminLayout - SIN SESIÓN - Redirigiendo a login")
		redirect("/login")
	}
	
	// Verificación adicional: el usuario debe tener rol ADMIN
	const userRole = (session.user as any)?.role
	if (!userRole || userRole === "PUBLIC") {
		console.log("❌ AdminLayout - USUARIO SIN PERMISOS - Redirigiendo a login")
		redirect("/login")
	}
	
	console.log("✅ AdminLayout - Sesión válida - Permitiendo acceso")
	
	return (
		<div className="min-h-screen bg-white">
			<nav className="bg-white border-b border-[#ececef]">
				{/* En el teléfono: título y Salir arriba, los enlaces en una fila debajo. */}
				<div className="px-4 md:px-8 py-3 md:py-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-2.5">
					<Link href="/admin" className="text-base font-bold text-black cursor-pointer">
						Panel Administrativo
					</Link>
					<div className="order-3 md:order-none w-full md:w-auto flex items-center justify-between md:justify-start gap-3 md:gap-[22px] overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
						<Link href="/estadisticas" className="text-[12.5px] font-semibold text-[#6c6e78] hover:text-black transition-colors">
							Estadísticas
						</Link>
						<Link href="/header" className="text-[12.5px] font-semibold text-[#6c6e78] hover:text-black transition-colors">
							Editar Header
						</Link>
						<Link href="/ajustes-catalogo" className="text-[12.5px] font-semibold text-[#6c6e78] hover:text-black transition-colors">
							Ajustes Catálogo
						</Link>
						<Link href="/juegos" className="text-[12.5px] font-semibold text-[#6c6e78] hover:text-black transition-colors">
							Juegos
						</Link>
					</div>
					<LogoutButton />
				</div>
			</nav>
			<main>{children}</main>
		</div>
	)
}

