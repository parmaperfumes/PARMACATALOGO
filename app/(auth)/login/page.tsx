"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LoginPage() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		setLoading(true)
		const res = await signIn("credentials", {
			redirect: false,
			email,
			password,
		})
		setLoading(false)
		if (res?.error) setError("Credenciales inválidas")
		if (res?.ok && !res.error) window.location.href = "/admin" // redirige a admin raíz
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold">Iniciar Sesión</h1>
					<p className="text-muted-foreground mt-2">Accede al panel administrativo</p>
				</div>
				<form onSubmit={onSubmit} className="bg-card p-6 rounded-lg border space-y-4">
					<div>
						<label className="block text-sm font-medium">Email o Usuario</label>
						<Input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required />
					</div>
					<div>
						<label className="block text-sm font-medium">Contraseña</label>
						<Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
					</div>
					{error ? <p className="text-sm text-red-500">{error}</p> : null}
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? "Ingresando..." : "Ingresar"}
					</Button>
					<p className="text-xs text-muted-foreground text-center">
						Para usar sin base de datos, configura variables <code>ADMIN_EMAIL</code> y <code>ADMIN_PASSWORD</code>.
					</p>
				</form>
				<p className="text-center text-sm">
					<Link href="/">Volver al inicio</Link>
				</p>
			</div>
		</div>
	)
}

