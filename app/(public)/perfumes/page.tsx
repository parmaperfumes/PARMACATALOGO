"use client"

import { useEffect, useState } from "react"
import { ProductCard, type Product } from "@/components/ProductCard"

type PerfumeFromDB = {
	id: string
	nombre: string
	subtitulo: string | null
	genero: string | null
	imagenPrincipal: string
	imagenes: string[]
	sizes: number[]
	activo: boolean
}

export default function PerfumesPage() {
	const [perfumes, setPerfumes] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function fetchPerfumes() {
			try {
				const res = await fetch("/api/perfumes")
				if (res.ok) {
					const data: PerfumeFromDB[] = await res.json()
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
				<h1 className="text-3xl font-bold mb-6">Catálogo de Perfumes</h1>
				<div className="text-center py-12">
					<p className="text-gray-600">Cargando perfumes...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-6">Catálogo de Perfumes</h1>
			{perfumes.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-gray-600">No hay perfumes disponibles en este momento.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{perfumes.map((perfume) => (
						<div key={perfume.id} className="max-w-sm mx-auto w-full">
							<ProductCard product={perfume} />
						</div>
					))}
				</div>
			)}
		</div>
	)
}

