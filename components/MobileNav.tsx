"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { useWhatsApp } from "@/context/WhatsAppContext"
import { WhatsAppModal } from "./WhatsAppModal"

type MobileNavProps = {
	onFilterChange: (filter: "TODOS" | "HOMBRES" | "MUJERES") => void
	currentFilter: "TODOS" | "HOMBRES" | "MUJERES"
}

export function MobileNav({ onFilterChange, currentFilter }: MobileNavProps) {
	const { items } = useWhatsApp()
	const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)

	const handleWhatsAppClick = () => {
		setIsWhatsAppModalOpen(true)
	}

	// Determinar si WhatsApp está activo (tiene items o modal abierto)
	const isWhatsAppActive = items.length > 0 || isWhatsAppModalOpen

	// La pastilla marca sólo el filtro. WhatsApp se pinta solo cuando hay perfumes
	// elegidos: son dos cosas distintas y pueden estar encendidas a la vez.
	const activeIndex = currentFilter === "HOMBRES" ? 0 : currentFilter === "MUJERES" ? 1 : -1

	return (
		<>
			{/* Barra de navegación móvil fija en la parte inferior */}
			<nav className="mobile-nav-bar">
				<div className="mobile-nav-container">
					{/* Indicador animado que se mueve al elemento activo */}
					<div 
						className="mobile-nav-indicator"
						style={{
							transform: `translateX(${Math.max(activeIndex, 0) * 100}%)`,
							opacity: activeIndex >= 0 ? 1 : 0,
						}}
					/>
					
					<button
					onClick={() => {
						if (currentFilter === "HOMBRES") {
							onFilterChange("TODOS")
						} else {
							onFilterChange("HOMBRES")
						}
					}}
					className={`mobile-nav-item ${currentFilter === "HOMBRES" ? "mobile-nav-item-active" : ""}`}
					aria-label="Perfumes para hombres"
				>
					<span className="mobile-nav-label">Hombres</span>
				</button>

				<button
					onClick={() => {
						if (currentFilter === "MUJERES") {
							onFilterChange("TODOS")
						} else {
							onFilterChange("MUJERES")
						}
					}}
					className={`mobile-nav-item ${currentFilter === "MUJERES" ? "mobile-nav-item-active" : ""}`}
					aria-label="Perfumes para mujeres"
				>
					<span className="mobile-nav-label">Mujeres</span>
				</button>

				<button
					onClick={handleWhatsAppClick}
					className={`mobile-nav-item mobile-nav-item-whatsapp ${isWhatsAppActive ? "mobile-nav-item-active" : ""}`}
					aria-label="Contactar por WhatsApp"
				>
					{/* El número ocupa el lugar del ícono: los dos juntos no entran en un tercio. */}
					{items.length > 0 ? (
						<span className="mobile-nav-badge">
							{items.length > 99 ? '99+' : items.length}
						</span>
					) : (
						<MessageCircle className="mobile-nav-icon" />
					)}
					<span className="mobile-nav-label">WhatsApp</span>
				</button>
				</div>
			</nav>

			{/* Modal de WhatsApp */}
			<WhatsAppModal isOpen={isWhatsAppModalOpen} onClose={() => setIsWhatsAppModalOpen(false)} />
		</>
	)
}

