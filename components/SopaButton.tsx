"use client"

import { useEffect, useState } from "react"
import { SopaModal } from "./SopaModal"

// Grilla 3×3 tipo damero: esquinas + centro en blanco, el resto semitransparente.
const CLAROS = new Set([0, 2, 4, 6, 8])

export function SopaButton() {
	const [isOpen, setIsOpen] = useState(false)
	const [activa, setActiva] = useState<boolean | null>(null)

	useEffect(() => {
		let vivo = true
		fetch("/api/sopa/config")
			.then((r) => r.json())
			.then((d) => vivo && setActiva(!!d.activa && Array.isArray(d.letras) && d.letras.length > 0))
			.catch(() => vivo && setActiva(false))
		return () => {
			vivo = false
		}
	}, [])

	if (activa !== true) return null

	return (
		<>
			{/* Flotante abajo-izquierda. En teléfono va sólo el ícono: con el texto tapaba
			    el botón Agregar de la columna izquierda. */}
			<div className="fixed left-[18px] bottom-24 lg:bottom-[18px] z-[1000]">
				<button
					onClick={() => setIsOpen(true)}
					className="sopa2-btn"
					aria-label="Juega y gana con la Sopa de Letras"
				>
					<span className="sopa2-ic" aria-hidden>
						{Array.from({ length: 9 }).map((_, i) => (
							<i key={i} style={{ background: CLAROS.has(i) ? "#fff" : "rgba(255,255,255,.45)" }} />
						))}
					</span>
					<span className="sopa2-txt">
						<span className="sopa2-kicker">JUEGA Y GANA</span>
						<span className="sopa2-title">Sopa de Letras</span>
					</span>
				</button>
			</div>

			<style>{`
				.sopa2-btn {
					display: inline-flex;
					align-items: center;
					gap: 12px;
					padding: 8px;
					background: var(--color-noche);
					border: 0;
					border-radius: 12px;
					box-shadow: 0 8px 24px rgba(15,24,33,.24);
					color: #fff;
					text-align: left;
					font-family: inherit;
					cursor: pointer;
					transition: background 160ms ease, transform 160ms ease;
				}
				.sopa2-btn:hover { transform: translateY(-2px); }
				.sopa2-btn:active { transform: translateY(0); }
				.sopa2-btn:focus-visible { outline: 2px solid var(--color-noche); outline-offset: 2px; }

				.sopa2-ic {
					display: grid;
					grid-template-columns: repeat(3, 6px);
					gap: 3px;
					padding: 9px;
					background: rgba(255,255,255,.12);
					border-radius: 12px;
				}
				.sopa2-ic i { width: 6px; height: 6px; border-radius: 1px; display: block; }

				.sopa2-txt { display: none; flex-direction: column; }
				@media (min-width: 1024px) {
					.sopa2-btn { padding: 8px 16px 8px 8px; }
					.sopa2-txt { display: flex; }
				}
				.sopa2-kicker {
					font-size: 12px;
					font-weight: 600;
					letter-spacing: .08em;
					color: rgba(255,255,255,.8);
					line-height: 1;
				}
				.sopa2-title {
					font-size: 14px;
					font-weight: 600;
					line-height: 1.1;
					color: #fff;
					margin-top: 3px;
				}
			`}</style>

			<SopaModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	)
}
