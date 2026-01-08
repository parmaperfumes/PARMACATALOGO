"use client"
// Version: 2025-01-08 - Fix loading and cold start issues

import { useEffect, useState, useCallback, useRef } from "react"
import { ProductCard, type Product } from "@/components/ProductCard"
import { useSearch } from "@/context/SearchContext"
import { MobileNav } from "@/components/MobileNav"

type PerfumeFromDB = {
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
}

export default function PerfumesPage() {
	const { searchQuery } = useSearch()
	const [perfumes, setPerfumes] = useState<Product[]>([])
	const [perfumesData, setPerfumesData] = useState<PerfumeFromDB[]>([])
	const [loading, setLoading] = useState(true)
	const [loadingMessage, setLoadingMessage] = useState("Cargando perfumes...")
	const [retryCount, setRetryCount] = useState(0)
	const [selectedFilter, setSelectedFilter] = useState<"TODOS" | "HOMBRES" | "MUJERES">("HOMBRES")
	const [mounted, setMounted] = useState(false)
	const fetchStartedRef = useRef(false)

	const fetchPerfumes = useCallback(async (retry = 0) => {
		try {
			// Actualizar mensaje según el intento
			if (retry === 0) {
				setLoadingMessage("Cargando perfumes...")
			} else {
				setLoadingMessage(`Conectando con el servidor... (intento ${retry + 1})`)
			}

			// Fetch con timeout más largo para cold starts de Render
			const controller = new AbortController()
			const timeoutId = setTimeout(() => {
				controller.abort()
			}, 60000) // 60 segundos timeout para cold starts
			
			const res = await fetch(`/api/perfumes?t=${Date.now()}`, {
				method: 'GET',
				headers: {
					'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0',
				},
				signal: controller.signal
			})
			
			clearTimeout(timeoutId)
				
			if (!res.ok) {
				console.error("Error en la respuesta de la API:", res.status, res.statusText)
				// Si hay error del servidor, reintentar
				if (retry < 2 && (res.status >= 500 || res.status === 0)) {
					setRetryCount(retry + 1)
					setTimeout(() => fetchPerfumes(retry + 1), 2000)
					return
				}
				setLoading(false)
				return
			}
			
			const responseData = await res.json()
			
			// Manejar respuesta de error
			if (responseData.error) {
				console.error("Error de la API:", responseData.error)
				setPerfumesData([])
				setPerfumes([])
				setLoading(false)
				return
			}
			
			// La respuesta puede ser un array directamente o un objeto con perfumes
			const data: PerfumeFromDB[] = Array.isArray(responseData) ? responseData : (responseData.perfumes || [])
			
			if (!data || data.length === 0) {
				console.warn("La API devolvió un array vacío.")
				setPerfumesData([])
				setPerfumes([])
				setLoading(false)
				return
			}
			
			setPerfumesData(data)
			// Convertir los perfumes de la BD al formato Product
			const converted: Product[] = data.map((p) => ({
				id: p.id,
				name: p.nombre.toUpperCase(),
				subtitle: p.subtitulo || undefined,
				brand: "Parma",
				gender: (p.genero as "HOMBRE" | "MUJER" | "UNISEX") || undefined,
				images: p.imagenes && p.imagenes.length > 0 ? p.imagenes : [p.imagenPrincipal],
				sizes: (p.sizes.length > 0 ? p.sizes : [30, 50]) as Product["sizes"],
				tipoLanzamiento: p.tipoLanzamiento as "NUEVO" | "RESTOCK" | null || null,
			}))
			setPerfumes(converted)
			setLoading(false)
		} catch (error: any) {
			console.error("Error al cargar perfumes:", error)
			
			// Si es un timeout o error de red, reintentar
			if (retry < 2 && (error.name === 'AbortError' || error.message?.includes('fetch'))) {
				setLoadingMessage("El servidor está iniciando, por favor espera...")
				setRetryCount(retry + 1)
				setTimeout(() => fetchPerfumes(retry + 1), 3000)
				return
			}
			
			setPerfumesData([])
			setPerfumes([])
			setLoading(false)
		}
	}, [])

	// Efecto para marcar que el componente está montado en el cliente
	useEffect(() => {
		setMounted(true)
	}, [])

	// Efecto para cargar los perfumes después de que el componente esté montado
	useEffect(() => {
		if (mounted && !fetchStartedRef.current) {
			fetchStartedRef.current = true
			fetchPerfumes(0)
		}
	}, [mounted, fetchPerfumes])

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fdf6f6 0%, #e8f4f8 50%, #f6f0fd 100%)' }}>
				<div className="text-center p-8">
					{/* Spinner animado */}
					<div className="relative w-16 h-16 mx-auto mb-6">
						<div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
						<div className="absolute inset-0 border-4 border-transparent border-t-[#2c2f43] rounded-full animate-spin"></div>
					</div>
					<p className="text-gray-600 text-lg font-medium">{loadingMessage}</p>
					{retryCount > 0 && (
						<p className="text-gray-400 text-sm mt-2">
							Esto puede tardar unos segundos la primera vez...
						</p>
					)}
				</div>
			</div>
		)
	}

	// Filtrar perfumes según el género seleccionado y la búsqueda
	// Usar perfumesData como fuente de verdad y mapear a perfumes
	const filteredData = perfumesData
		.map((perfumeData, index) => ({ perfumeData, perfume: perfumes[index] }))
		.filter(({ perfumeData, perfume }) => {
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

	// Extraer los perfumes y datos filtrados
	const filteredPerfumes = filteredData.map(({ perfume }) => perfume)
	const filteredPerfumesData = filteredData.map(({ perfumeData }) => perfumeData)

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
				<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-6" style={{ willChange: 'contents', contain: 'layout style paint' }}>
					{filteredPerfumes.map((perfume, filteredIndex) => {
						const perfumeData = filteredPerfumesData[filteredIndex]
						// Normalizar usoPorDefecto: el valor ya viene normalizado desde la API
						let defaultUse: "DIA" | "NOCHE" | "AMBOS" | undefined = undefined
						if (perfumeData?.usoPorDefecto) {
							const usoNormalizado = String(perfumeData.usoPorDefecto).trim().toUpperCase()
							// Validar que el valor sea uno de los permitidos
							if (usoNormalizado === "DIA") {
								defaultUse = "DIA"
							} else if (usoNormalizado === "NOCHE") {
								defaultUse = "NOCHE"
							} else if (usoNormalizado === "AMBOS") {
								defaultUse = "AMBOS"
							}
						}
						// En el catálogo público, SIEMPRE fijar el uso (no permitir cambios)
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
			<MobileNav 
				onFilterChange={setSelectedFilter}
				currentFilter={selectedFilter}
			/>
		</div>
	)
}

