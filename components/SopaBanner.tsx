"use client"

import { useEffect, useState } from "react"
import { SopaModal } from "./SopaModal"

// Banda en el tope del catálogo. Reemplaza al botón flotante, que tapaba
// «Agregar» en la columna izquierda del teléfono.
export function SopaBanner() {
	const [isOpen, setIsOpen] = useState(false)
	const [activa, setActiva] = useState<boolean | null>(null)

	useEffect(() => {
		let vivo = true
		fetch("/api/sopa/config")
			.then((r) => r.json())
			.then((d) => vivo && setActiva(!!d.activa && Array.isArray(d.letras) && d.letras.length > 0))
			.catch(() => vivo && setActiva(false))
		return () => {
			vivo = false
		}
	}, [])

	if (activa !== true) return null

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				aria-label="Juega y gana con la Sopa de Letras"
				className="relative w-full h-28 sm:h-40 mb-2 sm:mb-6 px-4 sm:px-8 rounded-xl bg-noche text-white text-left flex items-center overflow-hidden active:scale-[0.99] transition-transform"
			>
				{/* Render 3D generado para la marca (original en brand/sopa-banner-original.png).
				    Se ancla a la derecha: ahí está PARMA; la izquierda de la imagen es fondo liso. */}
				<img
					src="/sopa-banner.webp"
					alt=""
					width={1600}
					height={686}
					className="absolute inset-0 w-full h-full object-cover object-[78%_44%] sm:object-[right_44%]"
					decoding="async"
				/>
				{/* Velo para que el texto se lea sobre las fichas en pantallas angostas */}
				<span className="absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-noche via-noche/80 to-transparent" aria-hidden="true" />

				<span className="relative min-w-0">
					<span className="block text-xs font-medium tracking-[0.16em] text-white/64">JUEGA Y GANA</span>
					<span className="block font-serif text-2xl sm:text-4xl font-medium leading-none mt-1.5">Sopa de Letras</span>
					<span className="inline-flex items-center h-6 sm:h-8 px-3 sm:px-4 mt-2.5 rounded-full bg-white text-noche text-xs sm:text-sm font-semibold">
						Jugar
					</span>
				</span>
			</button>

			<SopaModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	)
}
