"use client"

import { useWhatsApp } from "@/context/WhatsAppContext"
import { X, Truck, Wallet, CheckCircle } from "lucide-react"
import { MessageCircle } from "lucide-react"

type WhatsAppModalProps = {
	isOpen: boolean
	onClose: () => void
}

export function WhatsAppModal({ isOpen, onClose }: WhatsAppModalProps) {
	const { items, removeItem, clearItems } = useWhatsApp()

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
		window.open(whatsappUrl, '_blank')
		clearItems()
		onClose()
	}

	return (
		<div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
			{/* Backdrop */}
			<div 
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>
			
			{/* Modal Panel */}
			<div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b">
					<h2 className="text-2xl font-bold text-gray-800">Perfumes Seleccionados</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 transition-colors"
						aria-label="Cerrar"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6">
					{/* Intro Text */}
					<p className="text-gray-600 mb-6">Escríbenos y te los llevamos hoy mismo</p>

					{/* Selected Items List */}
					<div className="space-y-3 mb-6">
						{items.length === 0 ? (
							<p className="text-gray-400 text-center py-8">No hay perfumes seleccionados</p>
						) : (
							items.map((item, index) => (
								<div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
									<div className="flex items-center gap-3 flex-1">
										<CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
											<p className="text-xs text-gray-500">
												{item.size} ML • {item.use}
											</p>
										</div>
									</div>
									<button
										onClick={() => removeItem(item)}
										className="text-red-500 hover:text-red-700 transition-colors ml-2 flex-shrink-0"
										aria-label="Eliminar"
									>
										<X className="w-5 h-5" />
									</button>
								</div>
							))
						)}
					</div>

					{/* Service Options */}
					<div className="space-y-3 mb-6">
						<div className="flex items-center gap-3 text-sm text-gray-700">
							<Truck className="w-5 h-5 text-green-600" />
							<span>Envío gratis (ZONA METROPOLITANA)</span>
						</div>
						<div className="flex items-center gap-3 text-sm text-gray-700">
							<Wallet className="w-5 h-5 text-green-600" />
							<span>Pago contra entrega</span>
						</div>
						<div className="flex items-center gap-3 text-sm text-gray-700">
							<CheckCircle className="w-5 h-5 text-green-600" />
							<span>Garantía de devolución de tu dinero</span>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="border-t p-6 bg-gray-50">
					<div className="flex items-center justify-between mb-4">
						<button
							onClick={() => {
								clearItems()
								onClose()
							}}
							className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
						>
							Vaciar selección
						</button>
					</div>
					<button
						onClick={handleContinue}
						disabled={items.length === 0}
						className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
					>
						Continuar con el pedido
						<MessageCircle className="w-5 h-5" />
					</button>
				</div>
			</div>
		</div>
	)
}

