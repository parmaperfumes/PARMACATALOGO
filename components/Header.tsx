"use client"

import Link from "next/link"
import { Search } from "lucide-react"

export function Header() {
  return (
    <header>
      <div className="header-container">
        <div className="header-content">
          {/* Logo - Izquierda */}
          <Link href="/" className="header-logo">
            <span className="header-logo-text">
              parma<span className="header-logo-dot">.</span>
            </span>
          </Link>

          {/* Navegación - Centro */}
          <nav className="header-nav">
            <Link href="/perfumes" className="header-nav-link">
              Catálogo
            </Link>
            <Link href="/garantia" className="header-nav-link">
              Garantía
            </Link>
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
