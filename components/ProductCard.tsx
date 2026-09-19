"use client"

import { useState, useEffect, memo } from "react"
import { Button } from "@/components/ui/button"
import { useWhatsApp } from "@/context/WhatsAppContext"
import Image from "next/image"
import { nombreDePerfume, precioRD } from "@/lib/formato"

export type ProductSizeMl = 30 | 50

export type Product = {
	id: string
	name: string // e.g. BLEU DE CHANEL
	subtitle?: string // e.g. EAU DE PARFUM
	brand?: string // e.g. Parma
	gender?: "HOMBRE" | "MUJER" | "UNISEX"
	images: string[] // at least one
	sizes: ProductSizeMl[]
	tipoLanzamiento?: "NUEVO" | "RESTOCK" | "LANZAMIENTO" | null
	precio30?: string | null // Precio personalizado para 30ml (ej: "850 RD")
	precio50?: string | null // Precio personalizado para 50ml (ej: "1,350 RD")
	agotado30?: boolean | null // Marca el tamaño 30ml como agotado
	agotado50?: boolean | null // Marca el tamaño 50ml como agotado
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
	// 30 ml preseleccionado por defecto para que el botón AGREGAR esté siempre activo.
	// Si 30 ml está agotado o no existe, se cae a 50 ml; si ninguno está disponible, queda sin selección.
	const [selectedSize, setSelectedSize] = useState<ProductSizeMl | null>(() => {
		const has = (s: ProductSizeMl) => product.sizes.includes(s)
		const agotado = (s: ProductSizeMl) => (s === 30 ? product.agotado30 === true : product.agotado50 === true)
		if (has(30) && !agotado(30)) return 30
		if (has(50) && !agotado(50)) return 50
		return null
	})
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

	// Precio final para un tamaño dado (usa precio personalizado o por defecto)
	const priceFor = (size: ProductSizeMl | null): string => {
		if (size === 30) return product.precio30 || "850 RD"
		if (size === 50) return product.precio50 || "1,350 RD"
		return ""
	}

	// Datos extra que viajan con el ítem para poder mostrarlos en el modal de carrito
	const buildCartItem = (size: ProductSizeMl, use: "DIA" | "NOCHE" | "AMBOS") => ({
		name: product.name,
		size,
		use,
		gender: product.gender,
		image: product.images?.[0],
		price: priceFor(size),
		tipoLanzamiento: product.tipoLanzamiento,
	})

	// Cantidad de unidades de este producto (mismo tamaño y uso) ya en el carrito
	const quantity = items.filter(
		item => item.name === product.name &&
		item.size === selectedSize &&
		item.use === currentUse
	).length

	return (
		<div className={`rounded-xl overflow-hidden border border-noche/12 bg-white flex flex-col w-full ${className ?? ""}`} style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
			{/* Header visual con imagen */}
			<div className="relative bg-noche text-white overflow-hidden flex-shrink-0 flex items-center justify-center w-full p-0" style={{ willChange: 'contents', contain: 'layout style paint' }}>
				{/* Etiqueta MÁS VENDIDO / RE-STOCK / NUEVO */}
				{product.tipoLanzamiento && (
					<div className="absolute top-2 right-2 z-10 px-2 py-1 sm:px-3 rounded-full bg-white text-noche text-xs leading-none font-semibold tracking-wide">
						{product.tipoLanzamiento === "NUEVO" ? "MÁS VENDIDO" : product.tipoLanzamiento === "LANZAMIENTO" ? "NUEVO" : "RE-STOCK"}
					</div>
				)}
				
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
					<h3 className="font-serif text-xl sm:text-2xl font-medium leading-tight text-noche line-clamp-1">
						{nombreDePerfume(product.name)}
					</h3>
				</div>
				
				{/* Subtítulo - Altura fija */}
				{product.subtitle ? (
					<div className="h-[18px] sm:h-[24px] flex items-center mb-1.5 sm:mb-2">
						<p className="text-xs lg:text-sm tracking-wide text-gris uppercase line-clamp-1">
							{product.subtitle}
						</p>
					</div>
				) : null}

				{/* Género y Uso: Día/Noche - Altura fija */}
				<div className="h-[26px] sm:h-[32px] flex items-center gap-1.5 sm:gap-2 lg:gap-3 mb-1.5 sm:mb-2">
					{product.gender ? (
						<span className="h-6 sm:h-7 lg:h-8 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap text-xs font-semibold capitalize whitespace-nowrap bg-white text-noche border border-noche flex items-center justify-center flex-shrink-0">
							{product.gender.toLowerCase()}
						</span>
					) : null}
					{isFixed ? (
						// Si está fijado, mostrar como elementos no interactivos (divs) - NO CLICABLES
						// Solo mostrar la opción que está marcada en el panel administrativo
						<>
							{defaultUse === "DIA" ? (
								<div
									className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap text-xs font-semibold h-6 sm:h-7 lg:h-8 flex items-center justify-center bg-noche text-white border-noche border cursor-default select-none pointer-events-none"
									style={{ userSelect: 'none' }}
								>
									Día
								</div>
							) : defaultUse === "NOCHE" ? (
								<div
									className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap text-xs font-semibold h-6 sm:h-7 lg:h-8 flex items-center justify-center bg-noche text-white border-noche border cursor-default select-none pointer-events-none"
									style={{ userSelect: 'none' }}
								>
									Noche
								</div>
							) : defaultUse === "AMBOS" ? (
								<div
									className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap text-xs font-semibold h-6 sm:h-7 lg:h-8 flex items-center justify-center bg-noche text-white border-noche border cursor-default select-none pointer-events-none"
									style={{ userSelect: 'none' }}
								>
									Día / Noche
								</div>
							) : (
								// Si no hay defaultUse, mostrar ambos con el mismo estilo (blanco con borde gris y texto negro)
								<>
									<div
										className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap text-xs font-semibold h-6 sm:h-7 lg:h-8 flex items-center justify-center bg-white border-noche/12 text-noche border cursor-default select-none pointer-events-none"
										style={{ userSelect: 'none' }}
									>
										Día
									</div>
									<div
										className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap text-xs font-semibold h-6 sm:h-7 lg:h-8 flex items-center justify-center bg-white border-noche/12 text-noche border cursor-default select-none pointer-events-none"
										style={{ userSelect: 'none' }}
									>
										Noche
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
									className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap border text-xs font-semibold h-6 sm:h-7 lg:h-8 flex items-center justify-center bg-noche text-white border-noche cursor-pointer hover:border-gray-400 active:scale-95"
									disabled
								>
									Día
								</button>
							)}
							{defaultUse === "NOCHE" && (
								<button
									type="button"
									className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap border text-xs font-semibold h-6 sm:h-7 lg:h-8 flex items-center justify-center bg-noche text-white border-noche cursor-pointer hover:border-gray-400 active:scale-95"
									disabled
								>
									Noche
								</button>
							)}
							{defaultUse === "AMBOS" && (
								<button
									type="button"
									className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap border text-xs font-semibold h-6 sm:h-7 lg:h-8 flex items-center justify-center bg-noche text-white border-noche cursor-pointer hover:border-gray-400 active:scale-95"
									disabled
								>
									Día / Noche
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
										className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap border text-xs font-semibold h-6 sm:h-7 lg:h-8 flex items-center justify-center ${selectedDia ? "bg-noche text-white border-noche" : "bg-white border-noche/12 text-noche"} ${isAmbos ? "cursor-not-allowed" : "cursor-pointer hover:border-gray-400 active:scale-95"}`}
									>
										Día
									</button>
									<button
										type="button"
										onClick={() => {
											if (isAmbos) return
											setSelectedNoche(!selectedNoche)
										}}
										disabled={isAmbos}
										className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap border text-xs font-semibold h-6 sm:h-7 lg:h-8 flex items-center justify-center ${selectedNoche ? "bg-noche text-white border-noche" : "bg-white border-noche/12 text-noche"} ${isAmbos ? "cursor-not-allowed" : "cursor-pointer hover:border-gray-400 active:scale-95"}`}
									>
										Noche
									</button>
								</>
							)}
						</>
					)}
				</div>

			{/* Tamaños - barra segmentada: la opción activa se ve como píldora negra flotante */}
			<div className="flex items-stretch gap-1 rounded-xl bg-niebla p-1 mb-2 sm:mb-3">
				{product.sizes.filter(s => s === 30 || s === 50).map((s) => {
						// Función para obtener el precio según el tamaño (usa precio personalizado o por defecto)
						const getPrice = (size: ProductSizeMl): string => {
							switch (size) {
								case 30: return product.precio30 || "850 RD"
								case 50: return product.precio50 || "1,350 RD"
								default: return ""
							}
						}
						const isSelected = selectedSize === s
						const isAgotado = s === 30 ? product.agotado30 === true : product.agotado50 === true
						return (
							<button
								key={s}
								onClick={() => {
									if (isAgotado) return
									setSelectedSize(s)
								}}
								disabled={isAgotado}
								className={`relative h-10 lg:h-11 rounded-xl px-0.5 sm:px-2 py-0.5 text-xs font-semibold flex flex-col items-center justify-center flex-1 min-w-0 touch-manipulation ${
									isAgotado
										? "bg-transparent text-gris/60 cursor-not-allowed"
										: isSelected
										? "bg-noche text-white active:scale-95"
										: "bg-transparent text-noche active:scale-95"
								}`}
							>
								<span>{s} ml</span>
								<span className={`text-xs font-medium leading-tight tabular-nums whitespace-nowrap ${
									isAgotado ? "text-gris/60" : isSelected ? "text-white/64" : "text-gris"
								}`}>{isAgotado ? "Agotado" : precioRD(getPrice(s))}</span>
							</button>
						)
					})}
				</div>

				{/* CTA - Altura fija y siempre al final */}
				<div className="mt-auto">
					{quantity > 0 ? (
						// Selector de cantidad: el cliente ve claramente que puede agregar o quitar unidades
						<div className="w-full h-9 sm:h-10 lg:h-11 rounded-full bg-senal/10 flex items-center justify-between px-1 sm:px-1.5">
							<button
								type="button"
								aria-label="Quitar una unidad"
								onClick={() => {
									if (selectedSize === null) return
									removeItem({
										name: product.name,
										size: selectedSize,
										use: currentUse,
									})
								}}
								className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full bg-senal hover:bg-senal/90 text-white text-base sm:text-lg font-bold flex items-center justify-center active:scale-95 touch-manipulation transition-colors duration-150 flex-shrink-0"
							>
								−
							</button>
							<div className="flex items-center justify-center gap-1 sm:gap-1.5 text-senal text-xs sm:text-sm font-semibold select-none">
								{quantity}
								<span className="text-xs tracking-wide">EN CARRITO</span>
							</div>
							<button
								type="button"
								aria-label="Agregar una unidad"
								onClick={() => {
									if (selectedSize === null) return
									addItem(buildCartItem(selectedSize, currentUse))
									onAdd?.({ productId: product.id, size: selectedSize, use: currentUse })
								}}
								className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full bg-senal hover:bg-senal/90 text-white text-base sm:text-lg font-bold flex items-center justify-center active:scale-95 touch-manipulation transition-colors duration-150 flex-shrink-0"
							>
								+
							</button>
						</div>
					) : (
						<Button
							onClick={() => {
								// Requiere que el cliente haya seleccionado un tamaño
								if (selectedSize === null) return
								// Cada clic agrega una unidad más al carrito de WhatsApp
								addItem(buildCartItem(selectedSize, currentUse))
								// Llamar al callback original si existe
								onAdd?.({ productId: product.id, size: selectedSize, use: currentUse })
							}}
							disabled={selectedSize === null}
							className={`w-full h-9 sm:h-10 lg:h-11 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-colors duration-150 border flex items-center justify-center touch-manipulation active:scale-95 ${selectedSize === null ? "bg-white text-gris/60 border-noche/12 cursor-not-allowed" : "bg-noche hover:bg-noche/90 text-white border-noche"}`}
						>
							<span className="inline-flex items-center justify-center gap-1.5 sm:gap-2">
								AGREGAR
								<span className="text-xs sm:text-sm lg:text-base font-bold leading-none" style={{ marginTop: '-0.1em' }}>+</span>
							</span>
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}

// Memoizar el componente para evitar re-renders innecesarios
export const ProductCard = memo(ProductCardComponent)
