"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useWhatsApp } from "@/context/WhatsAppContext"

export type ProductSizeMl = 30 | 50 | 100

export type Product = {
	id: string
	name: string // e.g. BLEU DE CHANEL
	subtitle?: string // e.g. EAU DE PARFUM
	brand?: string // e.g. Parma
	gender?: "HOMBRE" | "MUJER" | "UNISEX"
	images: string[] // at least one
	sizes: ProductSizeMl[]
}

export type ProductCardProps = {
	product: Product
	onAdd?: (payload: { productId: string; size: ProductSizeMl; use: "DIA" | "NOCHE" }) => void
	className?: string
	defaultUse?: "DIA" | "NOCHE" // Valor fijo para DIA/NOCHE
	fixedUse?: boolean // Si es true, los botones no se pueden cambiar
}

export function ProductCard({ product, onAdd, className, defaultUse, fixedUse = false }: ProductCardProps) {
	// Si fixedUse es undefined o false, pero estamos en el catálogo público, forzar a true
	// Para el catálogo público, siempre debe estar fijado
	const isFixed = fixedUse === true
	
	const [selectedUse, setSelectedUse] = useState<"DIA" | "NOCHE">(defaultUse || "DIA")
	const [selectedSize, setSelectedSize] = useState<ProductSizeMl>(product.sizes[0])
	const { addItem } = useWhatsApp()

	// Actualizar selectedUse cuando cambie defaultUse
	useEffect(() => {
		if (defaultUse) {
			setSelectedUse(defaultUse)
		}
	}, [defaultUse])

	return (
		<div className={`rounded-2xl overflow-hidden border bg-white ${className ?? ""}`}>
			{/* Header visual con imagen */}
			<div className="relative bg-[#2c2f43] text-white min-h-[300px] flex items-center justify-center overflow-hidden">
				{product.images && product.images.length > 0 && product.images[0] ? (
					<img
						src={product.images[0]}
						alt={product.name}
						className="max-w-full max-h-full w-auto h-auto object-contain"
						onError={(e) => {
							// Si la imagen falla al cargar, mostrar fondo sólido
							e.currentTarget.style.display = 'none'
						}}
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<div className="text-gray-400 text-sm">Sin imagen</div>
					</div>
				)}
			</div>

			{/* Info y controles */}
			<div className="p-4 space-y-3">
				<div className="flex items-center gap-2">
					<h3 className="text-xl font-extrabold leading-tight uppercase">
						{product.name}
					</h3>
				</div>
				{(product.subtitle || product.gender) && (
					<div className="flex items-center gap-2">
						{product.subtitle && (
							<p className="text-sm tracking-wide text-gray-600 uppercase">
								{product.subtitle}
							</p>
						)}
						{product.gender ? (
							<span className="text-[10px] font-bold uppercase bg-red-500 text-white px-2 py-1 rounded-md">
								{product.gender}
							</span>
						) : null}
					</div>
				)}

				{/* Uso: Día/Noche */}
				<div className="flex items-center gap-3 text-xs font-semibold">
					{isFixed ? (
						// Si está fijado, mostrar como elementos no interactivos (divs) - NO CLICABLES
						<>
							<div
								className={`px-3 py-1 rounded-md border ${selectedUse === "DIA" ? "bg-black text-white" : "bg-white"} cursor-default select-none pointer-events-none`}
								style={{ userSelect: 'none' }}
							>
								DIA
							</div>
							<div
								className={`px-3 py-1 rounded-md border ${selectedUse === "NOCHE" ? "bg-black text-white" : "bg-white"} cursor-default select-none pointer-events-none`}
								style={{ userSelect: 'none' }}
							>
								NOCHE
							</div>
						</>
					) : (
						// Si no está fijado, mostrar como botones interactivos
						<>
							<button
								type="button"
								onClick={() => setSelectedUse("DIA")}
								className={`px-3 py-1 rounded-md border ${selectedUse === "DIA" ? "bg-black text-white" : "bg-white"} cursor-pointer`}
							>
								DIA
							</button>
							<button
								type="button"
								onClick={() => setSelectedUse("NOCHE")}
								className={`px-3 py-1 rounded-md border ${selectedUse === "NOCHE" ? "bg-black text-white" : "bg-white"} cursor-pointer`}
							>
								NOCHE
							</button>
						</>
					)}
				</div>

				{/* Tamaños */}
				<div className="flex flex-wrap gap-3">
					{product.sizes.map((s) => (
						<button
							key={s}
							onClick={() => setSelectedSize(s)}
							className={`h-10 rounded-full border px-4 text-sm ${selectedSize === s ? "bg-black text-white" : "bg-white"}`}
						>
							{s} ML
						</button>
					))}
				</div>

				{/* CTA */}
				<div className="pt-1">
					<Button
						onClick={() => {
							// Agregar el producto al carrito de WhatsApp
							addItem({
								name: product.name,
								size: selectedSize,
								use: selectedUse,
							})
							// Llamar al callback original si existe
							onAdd?.({ productId: product.id, size: selectedSize, use: selectedUse })
						}}
						className="w-full h-11 rounded-xl text-base bg-green-600 hover:bg-green-700 text-white"
					>
						AGREGAR
					</Button>
				</div>
			</div>
		</div>
	)
}
