"use client"

import { useState, useEffect, memo } from "react"
import { Button } from "@/components/ui/button"
import { useWhatsApp } from "@/context/WhatsAppContext"
import Image from "next/image"

export type ProductSizeMl = 30 | 50

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

const ProductCardComponent = ({ product, onAdd, className, defaultUse, fixedUse = false }: ProductCardProps) => {
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
	const [selectedSize, setSelectedSize] = useState<ProductSizeMl>(() => {
		const validSizes = product.sizes.filter(s => s === 30 || s === 50)
		return validSizes[0] || 30
	})
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
		<div className={`rounded-lg sm:rounded-2xl overflow-hidden border bg-white flex flex-col w-full ${className ?? ""}`} style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
			{/* Header visual con imagen */}
			<div className="relative bg-[#2c2f43] text-white overflow-hidden flex-shrink-0 flex items-center justify-center w-full p-0" style={{ willChange: 'contents', contain: 'layout style paint' }}>
				{product.images && product.images.length > 0 && product.images[0] ? (
					<img
						src={product.images[0]}
						alt={product.name}
						className="object-contain w-full h-auto max-w-full block"
						style={{
							objectPosition: 'center center',
							willChange: 'transform',
							transform: 'translateZ(0)',
							display: 'block',
						}}
						loading="lazy"
						decoding="async"
					/>
				) : (
					<div className="w-full h-[180px] sm:h-[250px] lg:h-[280px] flex items-center justify-center">
						<div className="text-gray-400 text-xs sm:text-sm">Sin imagen</div>
					</div>
				)}
			</div>

			{/* Info y controles */}
			<div className="p-2 sm:p-3 sm:p-4 flex flex-col flex-1 min-h-0">
				{/* Título - Altura fija */}
				<div className="h-[26px] sm:h-[32px] flex items-center mb-1 sm:mb-1.5">
					<h3 className="text-sm sm:text-base lg:text-xl font-extrabold leading-tight uppercase line-clamp-1">
						{product.name}
					</h3>
				</div>
				
				{/* Subtítulo - Altura fija */}
				{product.subtitle ? (
					<div className="h-[18px] sm:h-[24px] flex items-center mb-1.5 sm:mb-2">
						<p className="text-[10px] sm:text-xs lg:text-sm tracking-wide text-gray-600 uppercase line-clamp-1">
							{product.subtitle}
						</p>
					</div>
				) : null}

				{/* Género y Uso: Día/Noche - Altura fija */}
				<div className="h-[26px] sm:h-[32px] flex items-center gap-1.5 sm:gap-2 lg:gap-3 mb-1.5 sm:mb-2">
					{product.gender ? (
						<span className="h-6 sm:h-7 lg:h-8 px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase bg-white text-black border border-black flex items-center justify-center flex-shrink-0">
							{product.gender}
						</span>
					) : null}
					{isFixed ? (
						// Si está fijado, mostrar como elementos no interactivos (divs) - NO CLICABLES
						// Solo mostrar la opción que está marcada en el panel administrativo
						<>
							{defaultUse === "DIA" ? (
								<div
									className="px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-semibold h-6 sm:h-7 lg:h-8 flex items-center justify-center bg-black text-white border-black border cursor-default select-none pointer-events-none"
									style={{ userSelect: 'none' }}
								>
									DIA
								</div>
							) : defaultUse === "NOCHE" ? (
								<div
									className="px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-semibold h-6 sm:h-7 lg:h-8 flex items-center justify-center bg-black text-white border-black border cursor-default select-none pointer-events-none"
									style={{ userSelect: 'none' }}
								>
									NOCHE
								</div>
							) : defaultUse === "AMBOS" ? (
								<div
									className="px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-semibold h-6 sm:h-7 lg:h-8 flex items-center justify-center bg-black text-white border-black border cursor-default select-none pointer-events-none"
									style={{ userSelect: 'none' }}
								>
									DIA / NOCHE
								</div>
							) : (
								// Si no hay defaultUse, mostrar ambos con el mismo estilo (blanco con borde gris y texto negro)
								<>
									<div
										className="px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-semibold h-6 sm:h-7 lg:h-8 flex items-center justify-center bg-white border-gray-300 text-black border cursor-default select-none pointer-events-none"
										style={{ userSelect: 'none' }}
									>
										DIA
									</div>
									<div
										className="px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-semibold h-6 sm:h-7 lg:h-8 flex items-center justify-center bg-white border-gray-300 text-black border cursor-default select-none pointer-events-none"
										style={{ userSelect: 'none' }}
									>
										NOCHE
									</div>
								</>
							)}
						</>
					) : (
						// Si no está fijado, mostrar como botones interactivos
						// Solo mostrar la opción que está marcada en el panel administrativo
						<>
							{defaultUse === "DIA" && (
								<button
									type="button"
									className="px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-md border text-[10px] sm:text-xs font-semibold h-6 sm:h-7 lg:h-8 flex items-center justify-center bg-black text-white border-black cursor-pointer hover:border-gray-400 active:scale-95"
									disabled
								>
									DIA
								</button>
							)}
							{defaultUse === "NOCHE" && (
								<button
									type="button"
									className="px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-md border text-[10px] sm:text-xs font-semibold h-6 sm:h-7 lg:h-8 flex items-center justify-center bg-black text-white border-black cursor-pointer hover:border-gray-400 active:scale-95"
									disabled
								>
									NOCHE
								</button>
							)}
							{defaultUse === "AMBOS" && (
								<button
									type="button"
									className="px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-md border text-[10px] sm:text-xs font-semibold h-6 sm:h-7 lg:h-8 flex items-center justify-center bg-black text-white border-black cursor-pointer hover:border-gray-400 active:scale-95"
									disabled
								>
									DIA / NOCHE
								</button>
							)}
							{!defaultUse && (
								// Si no hay defaultUse, mostrar ambos interactivos (comportamiento por defecto)
								<>
									<button
										type="button"
										onClick={() => {
											if (isAmbos) return
											setSelectedDia(!selectedDia)
										}}
										disabled={isAmbos}
										className={`px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-md border text-[10px] sm:text-xs font-semibold h-6 sm:h-7 lg:h-8 flex items-center justify-center ${selectedDia ? "bg-black text-white border-black" : "bg-white border-gray-300"} ${isAmbos ? "cursor-not-allowed" : "cursor-pointer hover:border-gray-400 active:scale-95"}`}
									>
										DIA
									</button>
									<button
										type="button"
										onClick={() => {
											if (isAmbos) return
											setSelectedNoche(!selectedNoche)
										}}
										disabled={isAmbos}
										className={`px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-md border text-[10px] sm:text-xs font-semibold h-6 sm:h-7 lg:h-8 flex items-center justify-center ${selectedNoche ? "bg-black text-white border-black" : "bg-white border-gray-300"} ${isAmbos ? "cursor-not-allowed" : "cursor-pointer hover:border-gray-400 active:scale-95"}`}
									>
										NOCHE
									</button>
								</>
							)}
						</>
					)}
				</div>

			{/* Tamaños - Altura fija, todos en una fila */}
			<div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 mb-2 sm:mb-3">
				{product.sizes.filter(s => s === 30 || s === 50).map((s) => {
						// Función para obtener el precio según el tamaño
						const getPrice = (size: ProductSizeMl): string => {
							switch (size) {
								case 30: return "850 RD"
								case 50: return "1,350 RD"
								default: return ""
							}
						}
						return (
							<button
								key={s}
								onClick={() => setSelectedSize(s)}
								className={`h-9 sm:h-10 lg:h-11 rounded-md border px-1.5 sm:px-2 lg:px-2.5 py-0.5 text-[10px] sm:text-[11px] lg:text-xs font-semibold flex flex-col items-center justify-center flex-1 min-w-0 touch-manipulation active:scale-95 ${selectedSize === s ? "bg-black text-white border-black" : "bg-white border-gray-300 text-black"}`}
							>
								<span>{s} ML</span>
								<span className="text-[9px] sm:text-[10px] lg:text-[11px] font-normal mt-0.5 leading-tight">{getPrice(s)}</span>
							</button>
						)
					})}
				</div>

				{/* CTA - Altura fija y siempre al final */}
				<div className="mt-auto">
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
						className={`w-full h-9 sm:h-10 lg:h-11 rounded-lg sm:rounded-xl text-xs sm:text-sm lg:text-base transition-colors duration-150 border-2 flex items-center justify-center touch-manipulation active:scale-95 ${
							isAdded 
								? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
								: "bg-white hover:bg-green-50 text-green-600 border-green-600"
						}`}
					>
						{isAdded ? (
							<span className="flex items-center justify-center gap-1.5 sm:gap-2">
								AGREGADO
								<svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
							</span>
						) : (
							<span className="inline-flex items-center justify-center gap-1.5 sm:gap-2">
								AGREGAR
								<span className="text-xs sm:text-sm lg:text-base font-bold leading-none" style={{ marginTop: '-0.1em' }}>+</span>
							</span>
						)}
					</Button>
				</div>
			</div>
		</div>
	)
}

// Memoizar el componente para evitar re-renders innecesarios
export const ProductCard = memo(ProductCardComponent)
