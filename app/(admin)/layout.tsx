import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const session = await getServerSession(authOptions)
	if (!session) {
		redirect("/login")
	}
	return (
		<div className="min-h-screen">
			<nav className="border-b bg-card">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<h1 className="text-xl font-bold">Panel Administrativo</h1>
					<form action="/api/auth/signout" method="post">
						<button className="text-sm underline" formAction={"/api/auth/signout?callbackUrl=/"}>Salir</button>
					</form>
				</div>
			</nav>
			<main>{children}</main>
		</div>
	)
}

