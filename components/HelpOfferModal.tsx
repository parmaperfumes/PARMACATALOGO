"use client"

import { X, MessageCircle } from "lucide-react"

const PHONE_NUMBER = "18494714762"

type HelpOfferModalProps = {
	isOpen: boolean
	onClose: () => void
	mensajeTitulo?: string
	mensajeTexto?: string
	mensajeWhatsApp?: string
}

export function HelpOfferModal({
	isOpen,
	onClose,
	mensajeTitulo = "¿Necesitas ayuda personalizada?",
	mensajeTexto = "Te ayudamos a encontrar el perfume ideal para ti. ¿Hablamos por WhatsApp?",
	mensajeWhatsApp = "Hola 👋, necesito ayuda personalizada para elegir mi perfume.",
}: HelpOfferModalProps) {
	if (!isOpen) return null

	const handleYes = () => {
		const text = encodeURIComponent(mensajeWhatsApp)
		window.open(`https://wa.me/${PHONE_NUMBER}?text=${text}`, "_blank")
		onClose()
	}

	return (
		<div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
				aria-hidden="true"
			/>
			<div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
				<div className="flex items-center justify-between p-4 sm:p-6 border-b">
					<h2 className="text-lg sm:text-xl font-bold text-gray-800">{mensajeTitulo}</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 active:text-gray-900 transition-colors p-1 touch-manipulation"
						aria-label="Cerrar"
					>
						<X className="w-5 h-5 sm:w-6 sm:h-6" />
					</button>
				</div>
				<div className="p-4 sm:p-6">
					<p className="text-gray-600 text-sm sm:text-base mb-6">{mensajeTexto}</p>
					<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
						<button
							onClick={handleYes}
							className="flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
						>
							Sí, ayúdame
							<MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
						</button>
						<button
							onClick={onClose}
							className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200 text-sm sm:text-base touch-manipulation"
						>
							No, gracias
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
