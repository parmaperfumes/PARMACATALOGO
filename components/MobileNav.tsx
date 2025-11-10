"use client"

import { useState } from "react"
import { User, UserCircle, MessageCircle } from "lucide-react"
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

	// Determinar qué elemento está activo para la animación
	// Priorizar el filtro activo, solo mover el indicador a WhatsApp si no hay filtro activo
	const getActiveIndex = () => {
		// Si hay un filtro activo, mantener el indicador ahí
		if (currentFilter === "HOMBRES") return 0
		if (currentFilter === "MUJERES") return 1
		// Solo si no hay filtro activo y hay items, mostrar WhatsApp como activo
		if (isWhatsAppActive) return 2
		return -1
	}

	const activeIndex = getActiveIndex()
	const isIndicatorOnWhatsApp = activeIndex === 2

	return (
		<>
			{/* Barra de navegación móvil fija en la parte inferior */}
			<nav className="mobile-nav-bar">
				{/* Indicador animado que se mueve al elemento activo */}
				<div 
					className={`mobile-nav-indicator ${isIndicatorOnWhatsApp ? 'whatsapp-active' : ''}`}
					style={{
						left: activeIndex >= 0 
							? `calc(4px + ${activeIndex} * ((100% - 8px) / 3 + 4px))` 
							: '4px',
						opacity: activeIndex >= 0 ? 1 : 0
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
					<User className="mobile-nav-icon" />
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
					<UserCircle className="mobile-nav-icon" />
					<span className="mobile-nav-label">Mujeres</span>
				</button>

				<button
					onClick={handleWhatsAppClick}
					className={`mobile-nav-item mobile-nav-item-whatsapp ${isWhatsAppActive ? "mobile-nav-item-active" : ""}`}
					aria-label="Contactar por WhatsApp"
				>
					<div className="relative">
						<MessageCircle className="mobile-nav-icon" />
						{items.length > 0 && (
							<span className="mobile-nav-badge">
								{items.length > 99 ? '99+' : items.length}
							</span>
						)}
					</div>
					<span className="mobile-nav-label">WhatsApp</span>
				</button>
			</nav>

			{/* Modal de WhatsApp */}
			<WhatsAppModal isOpen={isWhatsAppModalOpen} onClose={() => setIsWhatsAppModalOpen(false)} />
		</>
	)
}

