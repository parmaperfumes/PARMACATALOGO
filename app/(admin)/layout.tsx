import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { LogoutButton } from "@/components/LogoutButton"
import Link from "next/link"

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	// Verificación de autenticación CRÍTICA
	const session = await auth()
	
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
				<div className="px-8 py-4 flex items-center justify-between">
					<Link href="/admin" className="text-base font-bold text-black cursor-pointer">
						Panel Administrativo
					</Link>
					<div className="flex items-center gap-[22px]">
						<Link href="/estadisticas" className="text-[12.5px] font-semibold text-[#6c6e78] hover:text-black transition-colors">
							Estadísticas
						</Link>
						<Link href="/header" className="text-[12.5px] font-semibold text-[#6c6e78] hover:text-black transition-colors">
							Editar Header
						</Link>
						<Link href="/ajustes-catalogo" className="text-[12.5px] font-semibold text-[#6c6e78] hover:text-black transition-colors">
							Ajustes Catálogo
						</Link>
					</div>
					<LogoutButton />
				</div>
			</nav>
			<main>{children}</main>
		</div>
	)
}

