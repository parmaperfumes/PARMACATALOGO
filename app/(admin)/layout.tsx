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
		<div className="min-h-screen">
			<nav className="border-b bg-card">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link href="/admin" className="text-xl font-bold hover:underline cursor-pointer">
							Panel Administrativo
						</Link>
						<Link href="/estadisticas" className="text-sm text-gray-600 hover:text-gray-900 underline">
							Estadísticas
						</Link>
						<Link href="/header" className="text-sm text-gray-600 hover:text-gray-900 underline">
							Editar Header
						</Link>
						<Link href="/ajustes-catalogo" className="text-sm text-gray-600 hover:text-gray-900 underline">
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

