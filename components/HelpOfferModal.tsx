"use client"

import { X } from "lucide-react"

const PHONE_NUMBER = "18494714762"

// Logo oficial de WhatsApp (asset de marca de Font Awesome brands, sin modificar)
function WhatsAppGlyph({ size = 22, color = "#fff" }: { size?: number; color?: string }) {
	return (
		<svg width={size} height={size} viewBox="0 0 448 512" fill={color} aria-hidden="true" role="img">
			<path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.2-157zM223.9 438.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
		</svg>
	)
}

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
	mensajeTitulo = "¿Necesitas ayuda para elegir tu perfume?",
	mensajeTexto = "¿No sabes cuál elegir? Te ayudamos a encontrar tu fragancia ideal, gratis y sin compromiso. 💬",
	mensajeWhatsApp = "Hola 👋, necesito ayuda personalizada para elegir mi perfume.",
}: HelpOfferModalProps) {
	if (!isOpen) return null

	const handleYes = () => {
		const text = encodeURIComponent(mensajeWhatsApp)
		window.open(`https://wa.me/${PHONE_NUMBER}?text=${text}`, "_blank")
		onClose()
	}

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 200,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: 16,
				fontFamily: "var(--font-poppins), Poppins, system-ui, sans-serif",
			}}
		>
			{/* Backdrop oscuro difuminado */}
			<div
				className="help-backdrop"
				onClick={onClose}
				aria-hidden="true"
				style={{ position: "absolute", inset: 0, background: "rgba(15,18,28,0.6)", backdropFilter: "blur(6px)" }}
			/>

			{/* Tarjeta */}
			<div
				className="help-modal-card"
				role="dialog"
				aria-modal="true"
				aria-label={mensajeTitulo}
				style={{
					position: "relative",
					width: "100%",
					maxWidth: 400,
					background: "#fff",
					borderRadius: 24,
					boxShadow: "0 24px 60px -18px rgba(0,0,0,.35)",
					padding: "32px 28px 26px",
					textAlign: "left",
				}}
			>
				{/* Cerrar */}
				<button
					onClick={onClose}
					aria-label="Cerrar"
					style={{
						position: "absolute",
						top: 16,
						right: 16,
						background: "none",
						border: "none",
						color: "#9aa0ab",
						cursor: "pointer",
						padding: 4,
						lineHeight: 0,
						borderRadius: 999,
					}}
				>
					<X style={{ width: 20, height: 20 }} />
				</button>

				{/* Ícono verde con pulso */}
				<div
					className="help-pulse"
					style={{
						width: 60,
						height: 60,
						borderRadius: 999,
						background: "linear-gradient(180deg, #2bd15f, #1faa52)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						marginBottom: 18,
						border: "4px solid #e4f6ea",
					}}
				>
					<WhatsAppGlyph size={30} color="#fff" />
				</div>

				{/* Título */}
				<h2 style={{ fontSize: 22, fontWeight: 700, color: "#1f2430", lineHeight: 1.25, margin: 0 }}>
					{mensajeTitulo}
				</h2>

				{/* Texto */}
				<p style={{ fontSize: 14.5, fontWeight: 400, color: "#707784", lineHeight: 1.55, margin: "12px 0 24px" }}>
					{mensajeTexto}
				</p>

				{/* Botones apilados */}
				<button
					onClick={handleYes}
					style={{
						width: "100%",
						border: "none",
						borderRadius: 14,
						padding: "15px 22px",
						background: "linear-gradient(180deg, #2ec85c 0%, #1fa34a 100%)",
						color: "#fff",
						fontSize: 15,
						fontWeight: 600,
						cursor: "pointer",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: 10,
						boxShadow: "0 10px 22px -10px rgba(31,163,74,.7)",
					}}
				>
					<WhatsAppGlyph size={20} color="#fff" />
					Sí, quiero ayuda
				</button>

				<button
					onClick={onClose}
					style={{
						width: "100%",
						border: "none",
						background: "none",
						color: "#8a909c",
						fontSize: 14,
						fontWeight: 500,
						cursor: "pointer",
						padding: "14px 0 2px",
					}}
				>
					No, gracias
				</button>
			</div>
		</div>
	)
}
