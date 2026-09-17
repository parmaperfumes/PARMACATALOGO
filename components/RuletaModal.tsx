"use client"

import { useEffect, useState } from "react"
import { construirGajos, PREMIOS_DEFAULT, type Premio } from "@/lib/ruleta-premios"

function colorGajo(valor: number, i: number, maxValor: number): string {
	if (valor === maxValor) return "#3b6fe0" // azul brillante para el premio grande
	return i % 2 === 0 ? "#16255c" : "#24357d" // azul marino de la marca
}

// Punto en el borde, con el angulo medido en sentido horario desde arriba.
function polar(cx: number, cy: number, r: number, grados: number) {
	const rad = (grados * Math.PI) / 180
	return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
}

function pathGajo(i: number, grados: number): string {
	const cx = 150,
		cy = 150,
		r = 145
	const ini = i * grados
	const fin = ini + grados
	const p1 = polar(cx, cy, r, ini)
	const p2 = polar(cx, cy, r, fin)
	return `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y} Z`
}

type Fase = "correo" | "girando" | "resultado"

export function RuletaModal({
	isOpen,
	onClose,
}: {
	isOpen: boolean
	onClose: () => void
}) {
	const [fase, setFase] = useState<Fase>("correo")
	const [correo, setCorreo] = useState("")
	const [error, setError] = useState("")
	const [rotacion, setRotacion] = useState(0)
	const [descuento, setDescuento] = useState<number | null>(null)
	const [codigo, setCodigo] = useState("")
	const [correoEnviado, setCorreoEnviado] = useState(true)
	const [premios, setPremios] = useState<Premio[]>(PREMIOS_DEFAULT)

	// Carga los premios configurados para dibujar la rueda.
	useEffect(() => {
		if (!isOpen) return
		fetch("/api/ruleta/config")
			.then((r) => r.json())
			.then((d) => Array.isArray(d.premios) && d.premios.length > 0 && setPremios(d.premios))
			.catch(() => {})
	}, [isOpen])

	const gajos = construirGajos(premios)
	const grados = 360 / gajos.length
	const maxValor = Math.max(...gajos)

	if (!isOpen) return null

	function reset() {
		setFase("correo")
		setCorreo("")
		setError("")
		setRotacion(0)
		setDescuento(null)
	}

	function cerrar() {
		reset()
		onClose()
	}

	async function girar() {
		setError("")
		const email = correo.trim().toLowerCase()
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			setError("Escribe un correo válido.")
			return
		}

		setFase("girando")
		try {
			const res = await fetch("/api/ruleta/girar", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ correo: email }),
			})
			const data = await res.json()

			if (!res.ok) {
				setError(data.error || "No se pudo girar.")
				setFase("correo")
				return
			}

			const premio: number = data.descuento
			setCodigo(data.codigo ?? "")
			setCorreoEnviado(data.correoEnviado)

			// Elige un gajo que coincida con el premio y calcula la rotacion.
			const candidatos = gajos
				.map((v, i) => (v === premio ? i : -1))
				.filter((i) => i >= 0)
			const idx = candidatos.length > 0 ? candidatos[Math.floor(Math.random() * candidatos.length)] : 0
			const centro = idx * grados + grados / 2
			const vueltas = 6
			const objetivo = 360 * vueltas - centro

			setRotacion(objetivo)

			// Espera a que termine la animacion (4s) antes de mostrar el premio.
			setTimeout(() => {
				setDescuento(premio)
				setFase("resultado")
			}, 4200)
		} catch {
			setError("Error de conexión. Intenta de nuevo.")
			setFase("correo")
		}
	}

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 2000,
				background: "rgba(0,0,0,0.6)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "16px",
			}}
			onClick={cerrar}
		>
			<div
				onClick={(e) => e.stopPropagation()}
				className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
			>
				<button
					onClick={cerrar}
					aria-label="Cerrar"
					className="absolute top-3 right-3 text-[#6c6e78] hover:text-black text-xl leading-none"
				>
					✕
				</button>

				<h2 className="text-lg font-bold text-black text-center mb-1">
					🎉 Juega y Gana
				</h2>
				<p className="text-[13px] text-[#6c6e78] text-center mb-4">
					Gira la ruleta y gana un descuento en tu compra.
				</p>

				{/* Ruleta */}
				<div className="relative mx-auto mb-5" style={{ width: 260, height: 260 }}>
					{/* Puntero */}
					<div
						style={{
							position: "absolute",
							top: -4,
							left: "50%",
							transform: "translateX(-50%)",
							zIndex: 5,
							width: 0,
							height: 0,
							borderLeft: "12px solid transparent",
							borderRight: "12px solid transparent",
							borderTop: "20px solid #3b6fe0",
							filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))",
						}}
					/>
					<svg
						viewBox="0 0 300 300"
						width={260}
						height={260}
						style={{
							transform: `rotate(${rotacion}deg)`,
							transition:
								fase === "girando"
									? "transform 4s cubic-bezier(0.15,0.85,0.2,1)"
									: "none",
						}}
					>
						{gajos.map((valor, i) => {
							const mid = i * grados + grados / 2
							const pos = polar(150, 150, 95, mid)
							return (
								<g key={i}>
									<path
										d={pathGajo(i, grados)}
										fill={colorGajo(valor, i, maxValor)}
										stroke="#fff"
										strokeWidth={2}
									/>
									<text
										x={pos.x}
										y={pos.y}
										fill="#fff"
										fontSize={20}
										fontWeight="bold"
										textAnchor="middle"
										dominantBaseline="middle"
										transform={`rotate(${mid} ${pos.x} ${pos.y})`}
									>
										{valor}%
									</text>
								</g>
							)
						})}
					</svg>

					{/* Centro clickeable: indica cómo jugar */}
					<button
						onClick={girar}
						disabled={fase !== "correo"}
						style={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							width: 72,
							height: 72,
							borderRadius: "50%",
							background: "#ffffff",
							border: "4px solid #16255c",
							color: "#16255c",
							fontWeight: 800,
							fontSize: 13,
							letterSpacing: "0.5px",
							cursor: fase === "correo" ? "pointer" : "default",
							boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
							zIndex: 6,
							lineHeight: 1.1,
							textAlign: "center",
						}}
						aria-label="Girar la ruleta"
					>
						{fase === "correo" ? "GIRAR" : ""}
					</button>
				</div>

				{/* Fase: pedir correo */}
				{fase === "correo" && (
					<div>
						<label className="block text-[13px] font-semibold text-black mb-1">
							Tu correo electrónico
						</label>
						<input
							type="email"
							value={correo}
							onChange={(e) => setCorreo(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && girar()}
							placeholder="tucorreo@ejemplo.com"
							className="w-full border border-[#ececef] rounded-lg px-3 py-2.5 text-sm text-black outline-none focus:border-black"
						/>
						<p className="text-[11px] text-[#9a9ba3] mt-1.5">
							Solo puedes participar una vez con tu correo.
						</p>
						{error && (
							<p className="text-[12px] text-red-600 mt-2">{error}</p>
						)}
						<button
							onClick={girar}
							className="w-full mt-3 bg-black hover:bg-[#222] text-white font-semibold rounded-lg py-3 text-sm transition-colors"
						>
							Girar la ruleta
						</button>
					</div>
				)}

				{/* Fase: girando */}
				{fase === "girando" && (
					<p className="text-center text-[13px] text-[#6c6e78] py-2">
						Girando… ¡suerte! 🍀
					</p>
				)}

				{/* Fase: resultado */}
				{fase === "resultado" && descuento !== null && (
					<div className="text-center">
						<p className="text-lg font-bold text-black">
							¡Ganaste {descuento}% de descuento! 🎉
						</p>
						{correoEnviado ? (
							<p className="text-[13px] text-[#6c6e78] mt-1">
								Enviamos tu código a <strong>{correo}</strong>. Revísalo (y la
								carpeta de spam) y preséntalo por WhatsApp.
							</p>
						) : (
							<>
								<p className="text-[13px] text-[#6c6e78] mt-1">
									Guarda este código y preséntalo por WhatsApp al hacer tu
									pedido:
								</p>
								<div className="mt-3 bg-black text-white rounded-lg py-3 font-mono text-lg font-bold tracking-widest">
									{codigo}
								</div>
							</>
						)}
						<button
							onClick={cerrar}
							className="w-full mt-4 bg-black hover:bg-[#222] text-white font-semibold rounded-lg py-3 text-sm transition-colors"
						>
							¡Listo!
						</button>
					</div>
				)}
			</div>
		</div>
	)
}
