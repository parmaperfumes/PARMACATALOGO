"use client"

import { useEffect, useState } from "react"
import { ProductCard, type Product } from "@/components/ProductCard"
import { useSearch } from "@/context/SearchContext"

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
}

export default function PerfumesPage() {
	const { searchQuery } = useSearch()
	const [perfumes, setPerfumes] = useState<Product[]>([])
	const [perfumesData, setPerfumesData] = useState<PerfumeFromDB[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedFilter, setSelectedFilter] = useState<"TODOS" | "HOMBRES" | "MUJERES">("TODOS")

	useEffect(() => {
		async function fetchPerfumes() {
			try {
				const res = await fetch("/api/perfumes")
				if (res.ok) {
					const data: PerfumeFromDB[] = await res.json()
					setPerfumesData(data) // Guardar los datos originales
					// Convertir los perfumes de la BD al formato Product
					const converted: Product[] = data.map((p) => ({
						id: p.id,
						name: p.nombre.toUpperCase(),
						subtitle: p.subtitulo || undefined,
						brand: "Parma",
						gender: (p.genero as "HOMBRE" | "MUJER" | "UNISEX") || undefined,
						images: p.imagenes && p.imagenes.length > 0 ? p.imagenes : [p.imagenPrincipal],
						sizes: (p.sizes.length > 0 ? p.sizes : [30, 50, 100]) as Product["sizes"],
					}))
					setPerfumes(converted)
				}
			} catch (error) {
				console.error("Error al cargar perfumes:", error)
			} finally {
				setLoading(false)
			}
		}
		fetchPerfumes()
	}, [])

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center py-12">
					<p className="text-gray-600">Cargando perfumes...</p>
				</div>
			</div>
		)
	}

	// Filtrar perfumes según el género seleccionado y la búsqueda
	const filteredPerfumes = perfumes.filter((perfume, index) => {
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
		const perfumeData = perfumesData[index]
		const genero = perfumeData?.genero
		if (selectedFilter === "HOMBRES") {
			return genero === "HOMBRE" || genero === "UNISEX"
		}
		if (selectedFilter === "MUJERES") {
			return genero === "MUJER" || genero === "UNISEX"
		}
		return true
	})

	// Obtener los índices filtrados para acceder a perfumesData
	const filteredIndices = perfumes
		.map((perfume, index) => {
			// Filtro por búsqueda
			if (searchQuery.trim() !== "") {
				const searchLower = searchQuery.toLowerCase().trim()
				const nombreLower = perfume.name.toLowerCase()
				if (!nombreLower.includes(searchLower)) {
					return null
				}
			}

			// Filtro por género
			if (selectedFilter === "TODOS") return index
			const perfumeData = perfumesData[index]
			const genero = perfumeData?.genero
			if (selectedFilter === "HOMBRES") {
				return (genero === "HOMBRE" || genero === "UNISEX") ? index : null
			}
			if (selectedFilter === "MUJERES") {
				return (genero === "MUJER" || genero === "UNISEX") ? index : null
			}
			return index
		})
		.filter((idx): idx is number => idx !== null)

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Filtros de Género */}
			<div className="flex justify-center mb-8">
				<div className="flex gap-2 bg-white/80 backdrop-blur-sm p-1 rounded-full border border-gray-200 shadow-sm">
					<button
						onClick={() => setSelectedFilter("TODOS")}
						className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
							selectedFilter === "TODOS"
								? "bg-[#2c2f43] text-white shadow-md"
								: "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
						}`}
					>
						TODOS
					</button>
					<button
						onClick={() => setSelectedFilter("HOMBRES")}
						className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
							selectedFilter === "HOMBRES"
								? "bg-[#2c2f43] text-white shadow-md"
								: "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
						}`}
					>
						HOMBRES
					</button>
					<button
						onClick={() => setSelectedFilter("MUJERES")}
						className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
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
				<div className="text-center py-12">
					<p className="text-gray-600">
						{searchQuery.trim() !== "" 
							? `No se encontraron perfumes que coincidan con "${searchQuery}"`
							: selectedFilter === "TODOS" 
								? "No hay perfumes disponibles en este momento."
								: `No hay perfumes de ${selectedFilter.toLowerCase()} disponibles.`}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredPerfumes.map((perfume, filteredIndex) => {
						const originalIndex = filteredIndices[filteredIndex]
						const perfumeData = perfumesData[originalIndex]
						const defaultUse = (perfumeData?.usoPorDefecto as "DIA" | "NOCHE" | "AMBOS") || "DIA"
						// En el catálogo público, SIEMPRE fijar el uso (no permitir cambios)
						const fixedUse = true
						return (
							<div key={perfume.id} className="max-w-sm mx-auto w-full">
								<ProductCard product={perfume} defaultUse={defaultUse} fixedUse={fixedUse} />
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}

