import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { LogoutButton } from "@/components/LogoutButton"

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
					<h1 className="text-xl font-bold">Panel Administrativo</h1>
					<LogoutButton />
				</div>
			</nav>
			<main>{children}</main>
		</div>
	)
}

