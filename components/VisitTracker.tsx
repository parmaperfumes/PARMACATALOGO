"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function VisitTracker() {
	const pathname = usePathname()

	useEffect(() => {
		// No registrar visitas en rutas de admin o API
		if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
			return
		}

		// Registrar la visita
		const registrarVisita = async () => {
			try {
				await fetch("/api/visitas", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						path: pathname,
					}),
				})
			} catch (error) {
				// Fallar silenciosamente si hay error
				console.debug("Error registrando visita:", error)
			}
		}

		// Registrar después de un pequeño delay para no bloquear la carga
		const timer = setTimeout(registrarVisita, 1000)

		return () => clearTimeout(timer)
	}, [pathname])

	return null // Este componente no renderiza nada
}


