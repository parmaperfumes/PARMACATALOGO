"use client"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { WhatsAppGlyph } from "./WhatsAppGlyph"
import { WHATSAPP_SITIO } from "@/lib/sitio"

// Popup de ofertas al entrar a /perfumes: la imagen de la oferta y un botón
// «Pedir oferta» que abre WhatsApp. Se configura en Ajustes del Catálogo.
// Sale hasta 2 veces por visita (pestaña) y por imagen: al entrar y, si la cierran,
// otra vez un minuto después. Si piden la oferta, no vuelve en esa visita.
// Una oferta nueva (otra imagen) cuenta desde cero.
const CLAVE_VISTAS = "oferta-popup-vistas"
const MAX_VECES = 2
const ESPERA_SEGUNDA_MS = 60_000

function leerVistas(imagen: string): number {
	try {
		const d = JSON.parse(sessionStorage.getItem(CLAVE_VISTAS) || "null")
		return d?.imagen === imagen ? Number(d.veces) || 0 : 0
	} catch {
		return 0
	}
}

function guardarVistas(imagen: string, veces: number) {
	try {
		sessionStorage.setItem(CLAVE_VISTAS, JSON.stringify({ imagen, veces }))
	} catch {}
}

// Las imágenes de Cloudinary se piden al tamaño del popup: la original puede
// pesar varios MB y retrasar la aparición en el teléfono.
function imagenLigera(url: string) {
	return url.includes("res.cloudinary.com") && url.includes("/upload/")
		? url.replace("/upload/", "/upload/f_auto,q_auto,w_720/")
		: url
}

export function OfertaModal() {
	const [oferta, setOferta] = useState<{ imagen: string; mensajeWhatsApp: string } | null>(null)
	const [abierto, setAbierto] = useState(false)
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

	// Abre y lo cuenta, así una recarga no regala una vista extra.
	function programar(imagen: string, esperaMs: number) {
		if (timer.current) clearTimeout(timer.current)
		timer.current = setTimeout(() => {
			const veces = leerVistas(imagen)
			if (veces >= MAX_VECES) return
			guardarVistas(imagen, veces + 1)
			setAbierto(true)
		}, esperaMs)
	}

	useEffect(() => {
		let vivo = true

		fetch("/api/oferta-popup")
			.then((r) => r.json())
			.then((d) => {
				if (!vivo || !d.activo || !d.imagen) return
				const veces = leerVistas(d.imagen)
				if (veces >= MAX_VECES) return
				// Se abre cuando la imagen ya cargó (y al menos 1 s después de entrar),
				// para no mostrar un recuadro vacío.
				const inicio = Date.now()
				const img = new Image()
				img.onload = () => {
					if (!vivo) return
					setOferta({ imagen: d.imagen, mensajeWhatsApp: d.mensajeWhatsApp })
					// Si ya la vio una vez en esta visita, la segunda espera el minuto.
					programar(d.imagen, veces === 0 ? Math.max(0, 1000 - (Date.now() - inicio)) : ESPERA_SEGUNDA_MS)
				}
				img.src = imagenLigera(d.imagen)
			})
			.catch(() => {})

		return () => {
			vivo = false
			if (timer.current) clearTimeout(timer.current)
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
		if (oferta) programar(oferta.imagen, ESPERA_SEGUNDA_MS)
	}

	function pedir() {
		setAbierto(false)
		if (oferta) guardarVistas(oferta.imagen, MAX_VECES)
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
				className="oferta-tarjeta relative w-fit max-w-[280px] sm:max-w-[320px] rounded-2xl bg-white shadow-[0_24px_60px_-18px_rgba(0,0,0,0.45)] overflow-hidden"
			>
				<button
					onClick={cerrar}
					aria-label="Cerrar"
					className="absolute top-2 right-2 z-10 grid place-items-center w-8 h-8 rounded-full bg-black/45 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
				>
					<X className="w-4 h-4" />
				</button>

				{/* La imagen se ve completa, sin recortes: si es alta, la tarjeta se angosta. */}
				<img src={imagenLigera(oferta.imagen)} alt="Oferta especial de Parma" className="block w-auto h-auto max-w-full max-h-[60vh] mx-auto" />

				<div className="p-3">
					<a
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						onClick={pedir}
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
