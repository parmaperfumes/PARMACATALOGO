"use client"

import { useState } from "react"
import { RuletaModal } from "./RuletaModal"

export function RuletaButton() {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<>
			{/* Móvil: arriba de la barra de navegación. Escritorio: esquina inferior izquierda. */}
			<div className="fixed left-4 bottom-24 lg:bottom-6 z-[1000]">
				<button
					onClick={() => setIsOpen(true)}
					style={{ letterSpacing: "-0.025em" }}
					className="ruleta-btn relative overflow-hidden bg-[#16255c] hover:bg-[#0d1b3d] text-white text-sm font-semibold rounded-full px-5 py-3 transition-colors duration-200 touch-manipulation"
					aria-label="Juega y gana un descuento"
				>
					<span className="ruleta-shine" aria-hidden />
					<span className="relative z-[1]">Juega y Gana</span>
				</button>
			</div>

			<style>{`
				.ruleta-btn {
					animation: ruleta-glow 2.8s ease-in-out infinite;
				}
				.ruleta-btn:hover {
					transform: scale(1.04);
				}
				.ruleta-shine {
					position: absolute;
					top: 0;
					left: 0;
					height: 100%;
					width: 45%;
					background: linear-gradient(
						100deg,
						transparent 0%,
						rgba(255, 255, 255, 0.55) 50%,
						transparent 100%
					);
					transform: translateX(-160%) skewX(-18deg);
					animation: ruleta-shine 3.4s ease-in-out infinite;
				}
				@keyframes ruleta-shine {
					0% { transform: translateX(-160%) skewX(-18deg); }
					55%, 100% { transform: translateX(320%) skewX(-18deg); }
				}
				@keyframes ruleta-glow {
					0%, 100% { box-shadow: 0 6px 18px rgba(22, 37, 92, 0.35); }
					50% { box-shadow: 0 8px 26px rgba(59, 111, 224, 0.65); }
				}
				@media (prefers-reduced-motion: reduce) {
					.ruleta-btn, .ruleta-shine { animation: none; }
				}
			`}</style>

			<RuletaModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	)
}
