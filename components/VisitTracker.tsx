"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

const VISITOR_KEY = "parma-visitor-id"

// Obtiene (o crea) un identificador estable del visitante en localStorage.
function obtenerVisitorId(): string {
	try {
		let id = localStorage.getItem(VISITOR_KEY)
		if (!id) {
			id =
				typeof crypto !== "undefined" && crypto.randomUUID
					? crypto.randomUUID()
					: `${Date.now()}-${Math.random().toString(36).slice(2)}`
			localStorage.setItem(VISITOR_KEY, id)
		}
		return id
	} catch {
		// Si localStorage no está disponible, usamos un id efímero
		return `${Date.now()}-${Math.random().toString(36).slice(2)}`
	}
}

export function VisitTracker() {
	const pathname = usePathname()

	useEffect(() => {
		// SOLO registrar visitas en la página del catálogo de perfumes
		// Excluir admin, api, login, estadísticas, etc.
		if (pathname !== "/perfumes") {
			return
		}

		const visitorId = obtenerVisitorId()
		const inicio = Date.now()
		let visitaId: string | null = null

		// Registrar la visita
		const registrarVisita = async () => {
			try {
				const res = await fetch("/api/visitas", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						path: pathname,
						visitorId,
					}),
				})
				if (res.ok) {
					const data = await res.json()
					visitaId = data.id || null
				}
			} catch (error) {
				// Fallar silenciosamente si hay error
				console.debug("Error registrando visita:", error)
			}
		}

		// Registrar después de un pequeño delay para no bloquear la carga
		const timer = setTimeout(registrarVisita, 1000)

		// Enviar la duración de la visita cuando el usuario deja la página.
		// Usamos sendBeacon para que se envíe aunque la pestaña se esté cerrando.
		const enviarDuracion = () => {
			if (!visitaId) return
			const duracion = Math.round((Date.now() - inicio) / 1000)
			if (duracion <= 0) return
			try {
				const payload = JSON.stringify({ id: visitaId, duracion })
				if (navigator.sendBeacon) {
					const blob = new Blob([payload], { type: "application/json" })
					navigator.sendBeacon("/api/visitas", blob)
				} else {
					fetch("/api/visitas", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: payload,
						keepalive: true,
					})
				}
			} catch (error) {
				console.debug("Error enviando duración:", error)
			}
		}

		const onVisibilityChange = () => {
			if (document.visibilityState === "hidden") {
				enviarDuracion()
			}
		}

		document.addEventListener("visibilitychange", onVisibilityChange)
		window.addEventListener("pagehide", enviarDuracion)

		return () => {
			clearTimeout(timer)
			enviarDuracion()
			document.removeEventListener("visibilitychange", onVisibilityChange)
			window.removeEventListener("pagehide", enviarDuracion)
		}
	}, [pathname])

	return null // Este componente no renderiza nada
}
