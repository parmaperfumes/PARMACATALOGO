"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { WhatsAppGlyph } from "./WhatsAppGlyph"
import { WHATSAPP_SITIO } from "@/lib/sitio"

// Popup de ofertas al entrar a /perfumes: la imagen de la oferta y un botón
// «Pedir oferta» que abre WhatsApp. Se configura en Ajustes del Catálogo.
// Sale una vez por sesión y por imagen: una oferta nueva vuelve a mostrarse.
const CLAVE_VISTA = "oferta-popup-vista"

export function OfertaModal() {
	const [oferta, setOferta] = useState<{ imagen: string; mensajeWhatsApp: string } | null>(null)
	const [abierto, setAbierto] = useState(false)

	useEffect(() => {
		let vivo = true
		let timer: ReturnType<typeof setTimeout> | null = null

		fetch("/api/oferta-popup")
			.then((r) => r.json())
			.then((d) => {
				if (!vivo || !d.activo || !d.imagen) return
				try {
					if (sessionStorage.getItem(CLAVE_VISTA) === d.imagen) return
				} catch {}
				// Se abre cuando la imagen ya cargó (y al menos 1 s después de entrar),
				// para no mostrar un recuadro vacío.
				const inicio = Date.now()
				const img = new Image()
				img.onload = () => {
					if (!vivo) return
					setOferta({ imagen: d.imagen, mensajeWhatsApp: d.mensajeWhatsApp })
					timer = setTimeout(() => vivo && setAbierto(true), Math.max(0, 1000 - (Date.now() - inicio)))
				}
				img.src = d.imagen
			})
			.catch(() => {})

		return () => {
			vivo = false
			if (timer) clearTimeout(timer)
		}
	}, [])

	useEffect(() => {
		if (!abierto) return
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && cerrar()
		window.addEventListener("keydown", onKey)
		return () => window.removeEventListener("keydown", onKey)
	})

	function cerrar() {
		setAbierto(false)
		try {
			if (oferta) sessionStorage.setItem(CLAVE_VISTA, oferta.imagen)
		} catch {}
	}

	if (!abierto || !oferta) return null

	const href = `https://wa.me/${WHATSAPP_SITIO.replace(/\D/g, "")}?text=${encodeURIComponent(oferta.mensajeWhatsApp)}`

	return (
		<div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
			<div className="oferta-velo absolute inset-0 bg-noche/60 backdrop-blur-sm" onClick={cerrar} aria-hidden="true" />

			<div
				role="dialog"
				aria-modal="true"
				aria-label="Oferta especial"
				className="oferta-tarjeta relative w-full max-w-[280px] sm:max-w-[320px] rounded-2xl bg-white shadow-[0_24px_60px_-18px_rgba(0,0,0,0.45)] overflow-hidden"
			>
				<button
					onClick={cerrar}
					aria-label="Cerrar"
					className="absolute top-2 right-2 z-10 grid place-items-center w-8 h-8 rounded-full bg-black/45 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
				>
					<X className="w-4 h-4" />
				</button>

				<img src={oferta.imagen} alt="Oferta especial de Parma" className="block w-full h-auto max-h-[45vh] object-cover" />

				<div className="p-3">
					<a
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						onClick={cerrar}
						className="help-pulse flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-[#25d366] hover:bg-[#1fbd5a] text-white text-sm font-semibold transition-colors"
					>
						<WhatsAppGlyph size={17} color="#fff" />
						Pedir oferta
					</a>
					<button onClick={cerrar} className="block w-full pt-2 text-xs font-medium text-[#8a909c] hover:text-noche transition-colors">
						No, gracias
					</button>
				</div>
			</div>
		</div>
	)
}
