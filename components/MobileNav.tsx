"use client"

import { useState } from "react"
import { Search, User, UserCircle, MessageCircle } from "lucide-react"
import { useSearch } from "@/context/SearchContext"
import { useWhatsApp } from "@/context/WhatsAppContext"
import { WhatsAppModal } from "./WhatsAppModal"

type MobileNavProps = {
	onFilterChange: (filter: "TODOS" | "HOMBRES" | "MUJERES") => void
	currentFilter: "TODOS" | "HOMBRES" | "MUJERES"
}

export function MobileNav({ onFilterChange, currentFilter }: MobileNavProps) {
	const { setSearchQuery } = useSearch()
	const { items } = useWhatsApp()
	const [isSearchOpen, setIsSearchOpen] = useState(false)
	const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)

	const handleSearchClick = () => {
		setIsSearchOpen(true)
	}

	const handleWhatsAppClick = () => {
		setIsWhatsAppModalOpen(true)
	}

	return (
		<>
			{/* Barra de navegación móvil fija en la parte inferior */}
			<nav className="mobile-nav-bar">
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
					onClick={handleSearchClick}
					className={`mobile-nav-item ${isSearchOpen ? "mobile-nav-item-active" : ""}`}
					aria-label="Buscar perfumes"
				>
					<Search className="mobile-nav-icon" />
					<span className="mobile-nav-label">Buscar</span>
				</button>

				<button
					onClick={handleWhatsAppClick}
					className={`mobile-nav-item mobile-nav-item-whatsapp ${isWhatsAppModalOpen ? "mobile-nav-item-active" : ""}`}
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

			{/* Modal de búsqueda móvil */}
			{isSearchOpen && (
				<div className="mobile-search-overlay">
					<div className="mobile-search-backdrop" onClick={() => setIsSearchOpen(false)} />
					<div className="mobile-search-container">
						<div className="relative w-full">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
							<input
								type="text"
								placeholder="Buscar perfumes..."
								className="w-full h-12 pl-10 pr-12 bg-white border-2 border-gray-300 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
								autoFocus
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							<button
								onClick={() => setIsSearchOpen(false)}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 active:text-gray-800 transition-colors touch-manipulation px-2 text-xl"
								aria-label="Cerrar búsqueda"
							>
								✕
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Modal de WhatsApp */}
			<WhatsAppModal isOpen={isWhatsAppModalOpen} onClose={() => setIsWhatsAppModalOpen(false)} />
		</>
	)
}

