"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import Image from "next/image"

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
	const [config, setConfig] = useState<HeaderConfig>({
		logoText: "parma",
		logoImage: null,
		navLinks: [
			{ label: "Catálogo", href: "/perfumes" },
			{ label: "Garantía", href: "/garantia" },
		],
	})

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
					<Link href="/" className="header-logo">
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
							/>
						</div>
					</div>

					{/* Barra de búsqueda móvil */}
					<div className="header-search-mobile">
						<button className="header-search-mobile-btn" aria-label="Buscar">
							<Search style={{ height: '20px', width: '20px' }} />
						</button>
					</div>
				</div>
			</div>
		</header>
	)
}
