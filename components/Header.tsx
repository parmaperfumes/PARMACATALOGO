"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, X } from "lucide-react"
import Image from "next/image"
import { useSearch } from "@/context/SearchContext"

type NavLink = {
	label: string
	href: string
}

type HeaderConfig = {
	logoText: string
	logoImage: string | null
	navLinks: NavLink[]
}

export function Header() {
	const { searchQuery, setSearchQuery } = useSearch()
	const [config, setConfig] = useState<HeaderConfig>({
		logoText: "parma",
		logoImage: null,
		navLinks: [
			{ label: "Catálogo", href: "/perfumes" },
			{ label: "Garantía", href: "/garantia" },
		],
	})
	const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

	useEffect(() => {
		async function loadConfig() {
			try {
				const res = await fetch("/api/header")
				if (res.ok) {
					const data = await res.json()
					setConfig(data)
				}
			} catch (error) {
				console.error("Error al cargar configuración del header:", error)
			}
		}
		loadConfig()
	}, [])

	return (
		<header>
			<div className="header-container">
				<div className="header-content">
					{/* Logo - Izquierda */}
					<Link href="/perfumes" className="header-logo">
						{config.logoImage ? (
							<Image
								src={config.logoImage}
								alt={config.logoText}
								width={200}
								height={80}
								className="h-16 w-auto object-contain"
								style={{ maxHeight: '80px' }}
							/>
						) : (
							<span className="header-logo-text">
								{config.logoText}
								<span className="header-logo-dot">.</span>
							</span>
						)}
					</Link>

					{/* Navegación - Centro */}
					<nav className="header-nav">
						{config.navLinks.map((link, index) => (
							<Link key={index} href={link.href} className="header-nav-link">
								{link.label}
							</Link>
						))}
					</nav>

					{/* Barra de búsqueda - Derecha */}
					<div className="header-search-desktop">
						<div className="header-search-input-wrapper">
							<Search className="header-search-icon" />
							<input
								type="search"
								placeholder="Buscar perfumes..."
								className="header-search-input"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>

					{/* Barra de búsqueda móvil */}
					<div className="header-search-mobile">
						<button 
							className="header-search-mobile-btn touch-manipulation" 
							aria-label="Buscar"
							onClick={() => setIsMobileSearchOpen(true)}
						>
							<Search style={{ height: '20px', width: '20px' }} />
						</button>
					</div>
				</div>
				
				{/* Dropdown de búsqueda móvil - Fuera del header-content para posicionamiento correcto */}
				{isMobileSearchOpen && (
					<div className="header-search-mobile-dropdown">
						<div className="header-search-mobile-dropdown-content">
							<div className="relative w-full">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
								<input
									type="search"
									placeholder="Buscar perfumes..."
									className="w-full h-10 pl-10 pr-10 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									autoFocus
								/>
								<button
									onClick={() => setIsMobileSearchOpen(false)}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 active:text-gray-800 transition-colors touch-manipulation"
									aria-label="Cerrar búsqueda"
								>
									<X className="h-4 w-4" />
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</header>
	)
}
