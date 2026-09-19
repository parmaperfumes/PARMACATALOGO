"use client"

import { useEffect, useState } from "react"
import { SopaModal } from "./SopaModal"

// La sopa dibujada, no fotografiada: letras nítidas en cualquier pantalla y sin
// peso de imagen. La palabra encontrada es la marca, rodeada como un aro del logo.
const FILAS = ["KAROM", "PARMA", "TNOCH", "ELUZS"]
const FILA_ENCONTRADA = 1

function SopaDibujada() {
	return (
		<div className="relative grid grid-rows-4 gap-1 select-none" aria-hidden="true">
			{FILAS.map((fila, i) => (
				<div key={fila} className="relative grid grid-cols-5 gap-1">
					{i === FILA_ENCONTRADA && <span className="absolute -inset-x-1.5 -inset-y-0.5 rounded-full border border-white" />}
					{fila.split("").map((letra, j) => (
						<span
							key={j}
							className={`w-4 h-4 flex items-center justify-center text-xs leading-none font-semibold ${
								i === FILA_ENCONTRADA ? "text-white" : "text-white/32"
							}`}
						>
							{letra}
						</span>
					))}
				</div>
			))}
		</div>
	)
}

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
				className="w-full mb-2 sm:mb-6 px-4 sm:px-6 py-3 rounded-xl bg-noche text-white text-left flex items-center justify-between gap-4 overflow-hidden active:scale-[0.99] transition-transform"
			>
				<span className="min-w-0">
					<span className="block text-xs font-medium tracking-[0.16em] text-white/64">JUEGA Y GANA</span>
					<span className="block font-serif text-2xl font-medium leading-none mt-1.5">Sopa de Letras</span>
					<span className="inline-flex items-center h-6 px-3 mt-2.5 rounded-full bg-white text-noche text-xs font-semibold">
						Jugar
					</span>
				</span>
				<SopaDibujada />
			</button>

			<SopaModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	)
}
