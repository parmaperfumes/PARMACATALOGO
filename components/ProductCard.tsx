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
	onAdd?: (payload: { productId: string; size: ProductSizeMl; use: "DIA" | "NOCHE" | "AMBOS" }) => void
	className?: string
	defaultUse?: "DIA" | "NOCHE" | "AMBOS" // Valor fijo para DIA/NOCHE/AMBOS
	fixedUse?: boolean // Si es true, los botones no se pueden cambiar
}

export function ProductCard({ product, onAdd, className, defaultUse, fixedUse = false }: ProductCardProps) {
	// Si fixedUse es undefined o false, pero estamos en el catálogo público, forzar a true
	// Para el catálogo público, siempre debe estar fijado
	const isFixed = fixedUse === true
	
	// Si defaultUse es "AMBOS", significa que ambos DIA y NOCHE están seleccionados
	const isAmbos = defaultUse === "AMBOS"
	const [selectedDia, setSelectedDia] = useState<boolean>(() => {
		if (defaultUse === "AMBOS") return true
		if (defaultUse === "DIA") return true
		return false
	})
	const [selectedNoche, setSelectedNoche] = useState<boolean>(() => {
		if (defaultUse === "AMBOS") return true
		if (defaultUse === "NOCHE") return true
		return false
	})
	const [selectedSize, setSelectedSize] = useState<ProductSizeMl>(product.sizes[0])
	const [isAdded, setIsAdded] = useState(false)
	const { addItem, removeItem, items } = useWhatsApp()

	// Actualizar cuando cambie defaultUse
	useEffect(() => {
		if (defaultUse === "AMBOS") {
			setSelectedDia(true)
			setSelectedNoche(true)
		} else if (defaultUse === "DIA") {
			setSelectedDia(true)
			setSelectedNoche(false)
		} else if (defaultUse === "NOCHE") {
			setSelectedDia(false)
			setSelectedNoche(true)
		}
	}, [defaultUse])

	// Determinar el uso actual basado en las selecciones
	const currentUse: "DIA" | "NOCHE" | "AMBOS" = 
		selectedDia && selectedNoche ? "AMBOS" :
		selectedDia ? "DIA" :
		selectedNoche ? "NOCHE" : "DIA"

	// Verificar si el producto ya está agregado cuando cambian los items o las selecciones
	useEffect(() => {
		const isProductAdded = items.some(
			item => item.name === product.name && 
			item.size === selectedSize && 
			item.use === currentUse
		)
		setIsAdded(isProductAdded)
	}, [items, product.name, selectedSize, currentUse])

	return (
		<div className={`rounded-lg sm:rounded-2xl overflow-hidden border bg-white h-full flex flex-col ${className ?? ""}`}>
			{/* Header visual con imagen */}
			<div className="relative bg-[#2c2f43] text-white h-[180px] sm:h-[300px] flex items-center justify-center overflow-hidden flex-shrink-0">
				{product.images && product.images.length > 0 && product.images[0] ? (
					<img
						src={product.images[0]}
						alt={product.name}
						className="max-w-full max-h-full w-auto h-auto object-contain"
						loading="lazy"
						decoding="async"
						onError={(e) => {
							// Si la imagen falla al cargar, mostrar fondo sólido
							e.currentTarget.style.display = 'none'
						}}
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<div className="text-gray-400 text-xs sm:text-sm">Sin imagen</div>
					</div>
				)}
			</div>

			{/* Info y controles */}
			<div className="p-2.5 sm:p-4 flex flex-col flex-1 space-y-2 sm:space-y-3">
				{/* Título - Altura fija */}
				<div className="h-[28px] sm:h-[32px] flex items-center">
					<h3 className="text-base sm:text-xl font-extrabold leading-tight uppercase line-clamp-1">
						{product.name}
					</h3>
				</div>
				
				{/* Subtítulo y género - Altura fija */}
				<div className="h-[20px] sm:h-[24px] flex items-center gap-2">
					{product.subtitle ? (
						<p className="text-xs sm:text-sm tracking-wide text-gray-600 uppercase line-clamp-1">
							{product.subtitle}
						</p>
					) : null}
					{product.gender ? (
						<span className="text-[10px] font-bold uppercase bg-red-500 text-white px-2 py-0.5 rounded-md flex-shrink-0">
							{product.gender}
						</span>
					) : null}
				</div>

				{/* Uso: Día/Noche - Altura fija */}
				<div className="h-[28px] sm:h-[32px] flex items-center gap-2 sm:gap-3">
					{isFixed ? (
						// Si está fijado, mostrar como elementos no interactivos (divs) - NO CLICABLES
						<>
							<div
								className={`px-2 sm:px-3 py-1 rounded-md text-xs font-semibold h-7 sm:h-8 flex items-center justify-center ${selectedDia ? "bg-black text-white border-black" : "bg-white border-gray-300"} border cursor-default select-none pointer-events-none`}
								style={{ userSelect: 'none' }}
							>
								DIA
							</div>
							<div
								className={`px-2 sm:px-3 py-1 rounded-md text-xs font-semibold h-7 sm:h-8 flex items-center justify-center ${selectedNoche ? "bg-black text-white border-black" : "bg-white border-gray-300"} border cursor-default select-none pointer-events-none`}
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
								onClick={() => {
									if (isAmbos) return // No permitir cambios si está fijado como AMBOS
									setSelectedDia(!selectedDia)
								}}
								disabled={isAmbos}
								className={`px-2 sm:px-3 py-1 rounded-md border text-xs font-semibold h-7 sm:h-8 flex items-center justify-center ${selectedDia ? "bg-black text-white border-black" : "bg-white border-gray-300"} ${isAmbos ? "cursor-not-allowed" : "cursor-pointer hover:border-gray-400"}`}
							>
								DIA
							</button>
							<button
								type="button"
								onClick={() => {
									if (isAmbos) return // No permitir cambios si está fijado como AMBOS
									setSelectedNoche(!selectedNoche)
								}}
								disabled={isAmbos}
								className={`px-2 sm:px-3 py-1 rounded-md border text-xs font-semibold h-7 sm:h-8 flex items-center justify-center ${selectedNoche ? "bg-black text-white border-black" : "bg-white border-gray-300"} ${isAmbos ? "cursor-not-allowed" : "cursor-pointer hover:border-gray-400"}`}
							>
								NOCHE
							</button>
						</>
					)}
				</div>

				{/* Tamaños - Altura fija, todos en una fila */}
				<div className="h-[32px] sm:h-[36px] flex items-center gap-1.5 sm:gap-2">
					{product.sizes.map((s) => (
						<button
							key={s}
							onClick={() => setSelectedSize(s)}
							className={`h-7 sm:h-9 rounded-full border px-2 sm:px-3 text-[10px] sm:text-xs font-semibold flex items-center justify-center flex-1 min-w-0 ${selectedSize === s ? "bg-black text-white border-black" : "bg-white border-gray-300"}`}
						>
							{s} ML
						</button>
					))}
				</div>

				{/* CTA - Altura fija y siempre al final */}
				<div className="mt-auto pt-1">
					<Button
						onClick={() => {
							const currentItem = {
								name: product.name,
								size: selectedSize,
								use: currentUse,
							}
							
							if (isAdded) {
								// Remover el producto del carrito de WhatsApp
								removeItem(currentItem)
								setIsAdded(false)
							} else {
								// Agregar el producto al carrito de WhatsApp
								addItem(currentItem)
								setIsAdded(true)
								// Llamar al callback original si existe
								onAdd?.({ productId: product.id, size: selectedSize, use: currentUse })
							}
						}}
						className={`w-full h-10 sm:h-11 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all duration-200 border-2 flex items-center justify-center ${
							isAdded 
								? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
								: "bg-white hover:bg-green-50 text-green-600 border-green-600"
						}`}
					>
						{isAdded ? (
							<span className="flex items-center justify-center gap-2">
								<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
								AGREGADO
							</span>
						) : (
							"AGREGAR"
						)}
					</Button>
				</div>
			</div>
		</div>
	)
}
