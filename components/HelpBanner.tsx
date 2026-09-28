"use client"

import { useEffect, useState } from "react"
import { WhatsAppGlyph } from "./WhatsAppGlyph"

const PHONE_NUMBER = "18494714762"
const MENSAJE_DEFAULT = "Hola 👋, necesito ayuda personalizada para elegir mi perfume."

// Banda de ayuda personalizada en el tope del catálogo, con el mismo formato que
// SopaBanner. Reemplaza al popup que aparecía al entrar. Se activa/desactiva
// desde Ajustes del Catálogo.
export function HelpBanner() {
	const [activo, setActivo] = useState<boolean | null>(null)
	const [mensajeWhatsApp, setMensajeWhatsApp] = useState(MENSAJE_DEFAULT)

	useEffect(() => {
		let vivo = true
		fetch("/api/catalog-popup")
			.then((r) => r.json())
			.then((d) => {
				if (!vivo) return
				setActivo(d.activo !== false)
				if (d.mensajeWhatsApp) setMensajeWhatsApp(d.mensajeWhatsApp)
			})
			.catch(() => vivo && setActivo(false))
		return () => {
			vivo = false
		}
	}, [])

	if (activo !== true) return null

	const href = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(mensajeWhatsApp)}`

	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			aria-label="Ayuda personalizada: escríbenos por WhatsApp"
			className="relative w-full h-28 sm:h-40 mb-2 sm:mb-4 px-4 sm:px-8 rounded-xl bg-noche text-white text-left flex items-center overflow-hidden active:scale-[0.99] transition-transform"
		>
			{/* Resplandor verde detrás de la conversación */}
			<span
				className="absolute -right-10 top-1/2 -translate-y-1/2 w-72 h-72 sm:w-[28rem] sm:h-[28rem] rounded-full bg-[radial-gradient(circle,rgba(37,211,102,0.35),transparent_65%)]"
				aria-hidden="true"
			/>
			{/* Logo grande de fondo */}
			<WhatsAppGlyph
				size={220}
				color="rgba(37,211,102,0.10)"
				className="absolute -right-6 -bottom-16 sm:right-6 sm:-bottom-20 sm:w-[300px] sm:h-[300px]"
			/>

			{/* Conversación ilustrada. En el teléfono solo cabe la respuesta, abajo a la
			    derecha, para no tapar el título. */}
			<span className="absolute right-3 bottom-3 sm:right-10 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 flex flex-col items-end gap-2.5" aria-hidden="true">
				<span className="help-burbuja hidden sm:block rounded-2xl rounded-bl-sm bg-white text-noche px-4 py-2.5 text-sm font-medium shadow-lg -translate-x-16">
					¿Cuál perfume me recomiendas?
				</span>
				<span className="help-burbuja help-burbuja-2 rounded-2xl rounded-br-sm bg-[#d9fdd3] text-noche px-2.5 py-1 sm:px-4 sm:py-2.5 text-[11px] sm:text-sm font-medium shadow-lg">
					¡Te ayudamos a elegir! ✨
				</span>
			</span>

			{/* Velo para que el texto se lea en pantallas angostas */}
			<span className="absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-noche via-noche/80 to-transparent sm:hidden" aria-hidden="true" />

			<span className="relative min-w-0">
				<span className="block text-xs font-medium tracking-[0.16em] text-white/64">ASESORÍA GRATIS</span>
				<span className="block font-serif text-2xl sm:text-4xl font-medium leading-none mt-1.5">Ayuda personalizada</span>
				<span className="help-pulse inline-flex items-center gap-1.5 h-6 sm:h-8 px-3 sm:px-4 mt-2.5 rounded-full bg-[#25d366] text-white text-xs sm:text-sm font-semibold">
					<WhatsAppGlyph size={14} color="#fff" />
					Escríbenos
				</span>
			</span>
		</a>
	)
}
