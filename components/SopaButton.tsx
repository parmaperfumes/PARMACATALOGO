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
			{/* Flotante abajo-izquierda. */}
			<div className="fixed left-[18px] bottom-24 lg:bottom-[18px] z-[1000]">
				<button
					onClick={() => setIsOpen(true)}
					className="sopa2-btn"
					aria-label="Jugá y ganá con la Sopa de Letras"
				>
					<span className="sopa2-ic" aria-hidden>
						{Array.from({ length: 9 }).map((_, i) => (
							<i key={i} style={{ background: CLAROS.has(i) ? "#fff" : "rgba(255,255,255,.45)" }} />
						))}
					</span>
					<span className="sopa2-txt">
						<span className="sopa2-kicker">JUGÁ Y GANÁ</span>
						<span className="sopa2-title">Sopa de Letras</span>
					</span>
				</button>
			</div>

			<style>{`
				.sopa2-btn {
					display: inline-flex;
					align-items: center;
					gap: 12px;
					padding: 10px 18px 10px 10px;
					background: #12b76a;
					border: 0;
					border-radius: 16px;
					box-shadow: 0 12px 28px rgba(18,183,106,.35);
					color: #fff;
					text-align: left;
					font-family: 'Poppins', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
					cursor: pointer;
					transition: background 160ms ease, transform 160ms ease;
				}
				.sopa2-btn:hover { background: #0ea05c; transform: translateY(-2px); }
				.sopa2-btn:active { transform: translateY(0); }
				.sopa2-btn:focus-visible { outline: 2px solid #12b76a; outline-offset: 2px; }

				.sopa2-ic {
					display: grid;
					grid-template-columns: repeat(3, 6px);
					gap: 3px;
					padding: 9px;
					background: rgba(255,255,255,.18);
					border-radius: 10px;
				}
				.sopa2-ic i { width: 6px; height: 6px; border-radius: 1px; display: block; }

				.sopa2-txt { display: flex; flex-direction: column; }
				.sopa2-kicker {
					font-size: 10px;
					font-weight: 700;
					letter-spacing: .14em;
					color: rgba(255,255,255,.8);
					line-height: 1;
				}
				.sopa2-title {
					font-size: 14px;
					font-weight: 800;
					line-height: 1.1;
					color: #fff;
					margin-top: 3px;
				}
			`}</style>

			<SopaModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	)
}
