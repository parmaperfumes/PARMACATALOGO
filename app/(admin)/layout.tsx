import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { LogoutButton } from "@/components/LogoutButton"
import Link from "next/link"

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const session = await auth()
	if (!session) {
		redirect("/login")
	}
	return (
		<div className="min-h-screen">
			<nav className="border-b bg-card">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link href="/admin" className="text-xl font-bold hover:underline cursor-pointer">
							Panel Administrativo
						</Link>
						<Link href="/header" className="text-sm text-gray-600 hover:text-gray-900 underline">
							Editar Header
						</Link>
					</div>
					<LogoutButton />
				</div>
			</nav>
			<main>{children}</main>
		</div>
	)
}

