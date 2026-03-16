"use client"

import { useState, useEffect } from "react"
import { ProductCard, type Product } from "@/components/ProductCard"
import { useSearch } from "@/context/SearchContext"
import { MobileNav } from "@/components/MobileNav"
import { HelpOfferModal } from "@/components/HelpOfferModal"

const STORAGE_KEY = "perfumes-help-offer-shown"

export type PerfumeFromDB = {
	id: string
	nombre: string
	subtitulo: string | null
	genero: string | null
	imagenPrincipal: string
	imagenes: string[]
	sizes: number[]
	activo: boolean
	usoPorDefecto?: string | null
	fijarUso?: boolean
	tipoLanzamiento?: string | null
	precio30?: string | null
	precio50?: string | null
	fijado?: boolean
	ordenFijado?: number
	sku?: string | null
}

type PerfumesClientProps = {
	initialData: PerfumeFromDB[]
}

const DEFAULT_CONFIG = {
	mensajeTitulo: "¿Necesitas ayuda personalizada?",
	mensajeTexto: "Te ayudamos a encontrar el perfume ideal para ti. ¿Hablamos por WhatsApp?",
	mensajeWhatsApp: "Hola 👋, necesito ayuda personalizada para elegir mi perfume.",
}

export default function PerfumesClient({ initialData }: PerfumesClientProps) {
	const { searchQuery } = useSearch()
	const [selectedFilter, setSelectedFilter] = useState<"TODOS" | "HOMBRES" | "MUJERES">("HOMBRES")
	const [showHelpOffer, setShowHelpOffer] = useState(false)
	const [popupConfig, setPopupConfig] = useState(DEFAULT_CONFIG)

	// Cargar config y decidir si mostrar popup (una vez por sesión, con 1s de delay)
	useEffect(() => {
		if (typeof window === "undefined") return
		if (sessionStorage.getItem(STORAGE_KEY)) return

		let cancelled = false
		let timer: ReturnType<typeof setTimeout> | null = null

		async function load() {
			try {
				const res = await fetch("/api/catalog-popup")
				if (res.ok) {
					const data = await res.json()
					setPopupConfig({
						mensajeTitulo: data.mensajeTitulo || DEFAULT_CONFIG.mensajeTitulo,
						mensajeTexto: data.mensajeTexto || DEFAULT_CONFIG.mensajeTexto,
						mensajeWhatsApp: data.mensajeWhatsApp || DEFAULT_CONFIG.mensajeWhatsApp,
					})
				}
			} catch {
				// Usar defaults
			}
			if (!cancelled) {
				timer = setTimeout(() => {
					if (!cancelled) setShowHelpOffer(true)
				}, 1000)
			}
		}
		load()

		return () => {
			cancelled = true
			if (timer) clearTimeout(timer)
		}
	}, [])

	const handleCloseHelpOffer = () => {
		setShowHelpOffer(false)
		try {
			sessionStorage.setItem(STORAGE_KEY, "1")
		} catch {}
	}

	const perfumesData: PerfumeFromDB[] = Array.isArray(initialData) ? initialData : []

	// Convertir perfumes de la BD al formato Product
	const perfumes: Product[] = perfumesData.map((p) => ({
		id: p.id,
		name: p.nombre.toUpperCase(),
		subtitle: p.subtitulo || undefined,
		brand: "Parma",
		gender: (p.genero as "HOMBRE" | "MUJER" | "UNISEX") || undefined,
		images: p.imagenes && p.imagenes.length > 0 ? p.imagenes : [p.imagenPrincipal],
		sizes: (p.sizes.length > 0 ? p.sizes : [30, 50]) as Product["sizes"],
		tipoLanzamiento: (p.tipoLanzamiento as "NUEVO" | "RESTOCK" | "LANZAMIENTO" | null) || null,
		precio30: p.precio30 || null,
		precio50: p.precio50 || null,
	}))

	// Filtrar perfumes según el género seleccionado y la búsqueda
	const filteredData = perfumesData
		.map((perfumeData, index) => ({ perfumeData, perfume: perfumes[index] }))
		.filter(({ perfumeData, perfume }) => {
			if (!perfume) return false

			// Filtro por búsqueda (nombre)
			if (searchQuery.trim() !== "") {
				const searchLower = searchQuery.toLowerCase().trim()
				const nombreLower = perfume.name.toLowerCase()
				if (!nombreLower.includes(searchLower)) {
					return false
				}
			}

			// Filtro por género
			if (selectedFilter === "TODOS") return true
			const genero = perfumeData?.genero
			if (selectedFilter === "HOMBRES") {
				return genero === "HOMBRE" || genero === "UNISEX"
			}
			if (selectedFilter === "MUJERES") {
				return genero === "MUJER" || genero === "UNISEX"
			}
			return true
		})

	// Ordenar: 1) fijados, 2) NUEVO, 3) RE-STOCK, 4) resto
	const sortedFilteredData = [...filteredData].sort((a, b) => {
		const aFijado = a.perfumeData.fijado ? 1 : 0
		const bFijado = b.perfumeData.fijado ? 1 : 0
		if (aFijado !== bFijado) return bFijado - aFijado
		if (aFijado && bFijado) {
			return (a.perfumeData.ordenFijado || 0) - (b.perfumeData.ordenFijado || 0)
		}

		const labelRank = (tipo: string | null | undefined) =>
			tipo === "LANZAMIENTO" ? 0 : tipo === "RESTOCK" ? 1 : 2
		const rankDiff = labelRank(a.perfumeData.tipoLanzamiento) - labelRank(b.perfumeData.tipoLanzamiento)
		if (rankDiff !== 0) return rankDiff

		return 0
	})

	const filteredPerfumes = sortedFilteredData.map(({ perfume }) => perfume)
	const filteredPerfumesData = sortedFilteredData.map(({ perfumeData }) => perfumeData)

	return (
		<div className="container mx-auto px-2 sm:px-4 py-2 sm:py-8 pb-20 lg:pb-8 max-w-6xl pt-20 sm:pt-24">
			{/* Filtros de Género - Solo visible en desktop */}
			<div className="hidden lg:flex justify-center mb-4 sm:mb-8">
				<div className="flex gap-1 sm:gap-2 bg-white/80 backdrop-blur-sm p-0.5 sm:p-1 rounded-full border border-gray-200 shadow-sm">
					<button
						onClick={() => setSelectedFilter("HOMBRES")}
						className={`px-3 py-1.5 sm:px-6 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
							selectedFilter === "HOMBRES"
								? "bg-[#2c2f43] text-white shadow-md"
								: "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
						}`}
					>
						HOMBRES
					</button>
					<button
						onClick={() => setSelectedFilter("MUJERES")}
						className={`px-3 py-1.5 sm:px-6 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
							selectedFilter === "MUJERES"
								? "bg-[#2c2f43] text-white shadow-md"
								: "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
						}`}
					>
						MUJERES
					</button>
				</div>
			</div>

			{filteredPerfumes.length === 0 ? (
				<div className="text-center py-8 sm:py-12">
					<p className="text-gray-600 text-sm sm:text-base px-4">
						{searchQuery.trim() !== ""
							? `No se encontraron perfumes que coincidan con "${searchQuery}"`
							: selectedFilter === "TODOS"
								? "No hay perfumes disponibles en este momento."
								: `No hay perfumes de ${selectedFilter.toLowerCase()} disponibles.`}
					</p>
				</div>
			) : (
				<div
					className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-6"
					style={{ willChange: "contents", contain: "layout style paint" }}
				>
					{filteredPerfumes.map((perfume, filteredIndex) => {
						const perfumeData = filteredPerfumesData[filteredIndex]

						// Normalizar usoPorDefecto
						let defaultUse: "DIA" | "NOCHE" | "AMBOS" | undefined = undefined
						if (perfumeData?.usoPorDefecto) {
							const usoNormalizado = String(perfumeData.usoPorDefecto).trim().toUpperCase()
							if (usoNormalizado === "DIA") defaultUse = "DIA"
							else if (usoNormalizado === "NOCHE") defaultUse = "NOCHE"
							else if (usoNormalizado === "AMBOS") defaultUse = "AMBOS"
						}

						// En el catálogo público, siempre fijar el uso
						const fixedUse = true

						return (
							<div key={perfume.id} className="w-full">
								<ProductCard product={perfume} defaultUse={defaultUse} fixedUse={fixedUse} />
							</div>
						)
					})}
				</div>
			)}

			{/* Navegación móvil */}
			<MobileNav onFilterChange={setSelectedFilter} currentFilter={selectedFilter} />

			{/* Popup ayuda personalizada */}
			<HelpOfferModal
				isOpen={showHelpOffer}
				onClose={handleCloseHelpOffer}
				mensajeTitulo={popupConfig.mensajeTitulo}
				mensajeTexto={popupConfig.mensajeTexto}
				mensajeWhatsApp={popupConfig.mensajeWhatsApp}
			/>
		</div>
	)
}

