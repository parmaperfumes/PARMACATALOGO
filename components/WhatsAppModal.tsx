"use client"

import { useWhatsApp } from "@/context/WhatsAppContext"
import { X, Truck, Wallet, CheckCircle } from "lucide-react"
import { MessageCircle } from "lucide-react"
import { useRef, useEffect } from "react"

type WhatsAppModalProps = {
	isOpen: boolean
	onClose: () => void
}

// Función para registrar eventos de carrito
async function registrarEventoCarrito(tipo: "click_continuar" | "carrito_abandonado", items: any[]) {
	try {
		await fetch("/api/eventos-carrito", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				tipo,
				cantidadItems: items.length,
				items: items.map(item => ({
					name: item.name,
					size: item.size,
					use: item.use,
				})),
			}),
		})
	} catch (error) {
		console.error("Error al registrar evento de carrito:", error)
	}
}

export function WhatsAppModal({ isOpen, onClose }: WhatsAppModalProps) {
	const { items, removeItem, clearItems } = useWhatsApp()
	const clickContinuarRef = useRef(false)
	const itemsAlAbrirRef = useRef(0)

	// Guardar la cantidad de items cuando se abre el modal
	useEffect(() => {
		if (isOpen) {
			clickContinuarRef.current = false
			itemsAlAbrirRef.current = items.length
		}
	}, [isOpen, items.length])

	// Detectar cuando se cierra el modal sin hacer clic en continuar
	useEffect(() => {
		return () => {
			// Si el modal se está cerrando y había items pero NO se hizo clic en continuar
			if (!isOpen && itemsAlAbrirRef.current > 0 && !clickContinuarRef.current) {
				registrarEventoCarrito("carrito_abandonado", items)
			}
		}
	}, [isOpen, items])

	if (!isOpen) return null

	// Número de WhatsApp: +1 (849) 471-4762
	const phoneNumber = "18494714762"
	
	const buildMessage = () => {
		if (items.length === 0) {
			return "Buenas 👋, me gustaria ordenar este perfume:"
		}
		
		// Si es un solo perfume
		if (items.length === 1) {
			const item = items[0]
			return `Buenas 👋, me gustaria ordenar este perfume:\n\n${item.name} - ${item.size} ML`
		}
		
		// Si son varios perfumes
		let message = "Buenas 👋, me gustaria ordenar estos perfumes:\n\n"
		items.forEach((item) => {
			message += `${item.name} - ${item.size} ML\n`
		})
		return message
	}
	
	const text = encodeURIComponent(buildMessage())
	const whatsappUrl = `https://wa.me/${phoneNumber}?text=${text}`

	const handleContinue = () => {
		// Marcar que se hizo clic en continuar
		clickContinuarRef.current = true
		
		// Registrar el evento de click en continuar (sin bloquear el flujo)
		registrarEventoCarrito("click_continuar", items).catch(err => {
			console.error("Error al registrar evento (no crítico):", err)
		})
		
		// Continuar con el pedido independientemente del resultado del registro
		window.open(whatsappUrl, '_blank')
		clearItems()
		onClose()
	}

	const handleClose = () => {
		// Si hay items y no se hizo clic en continuar, registrar abandono
		if (items.length > 0 && !clickContinuarRef.current) {
			registrarEventoCarrito("carrito_abandonado", items)
		}
		onClose()
	}

	return (
		<div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
			{/* Backdrop */}
			<div 
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={handleClose}
			/>
			
			{/* Modal Panel */}
			<div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between p-4 sm:p-6 border-b">
					<h2 className="text-lg sm:text-2xl font-bold text-gray-800">Perfumes Seleccionados</h2>
					<button
						onClick={handleClose}
						className="text-gray-500 hover:text-gray-700 active:text-gray-900 transition-colors p-1 touch-manipulation"
						aria-label="Cerrar"
					>
						<X className="w-5 h-5 sm:w-6 sm:h-6" />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-4 sm:p-6">
					{/* Selected Items List */}
					<div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
						{items.length === 0 ? (
							<p className="text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base">No hay perfumes seleccionados</p>
						) : (
							items.map((item, index) => (
								<div key={index} className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg">
									<div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
										<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
										<div className="flex-1 min-w-0">
											<p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{item.name}</p>
											<p className="text-[10px] sm:text-xs text-gray-500">
												{item.size} ML
											</p>
										</div>
									</div>
									<button
										onClick={() => removeItem(item)}
										className="text-red-500 hover:text-red-700 active:text-red-800 transition-colors ml-2 flex-shrink-0 p-1 touch-manipulation"
										aria-label="Eliminar"
									>
										<X className="w-4 h-4 sm:w-5 sm:h-5" />
									</button>
								</div>
							))
						)}
					</div>

					{/* Service Options */}
					<div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
						<div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
							<Truck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
							<span>Envío gratis (ZONA METROPOLITANA)</span>
						</div>
						<div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
							<Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
							<span>Pago contra entrega</span>
						</div>
						<div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
							<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
							<span>Garantía de devolución de tu dinero</span>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="border-t p-4 sm:p-6 bg-gray-50">
					<div className="flex items-center justify-center mb-3 sm:mb-4">
						<button
							onClick={() => {
								clearItems()
								handleClose()
							}}
							className="text-red-600 hover:text-red-700 active:text-red-800 text-xs sm:text-sm font-medium transition-colors touch-manipulation flex items-center gap-1.5"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
							BORRAR TODO
						</button>
					</div>
					<button
						onClick={handleContinue}
						disabled={items.length === 0}
						className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
					>
						Continuar con el pedido
						<MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
					</button>
				</div>
			</div>
		</div>
	)
}

