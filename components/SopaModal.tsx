"use client"

import { useEffect, useRef, useState } from "react"
import { normalizarPalabra, type Premio } from "@/lib/sopa"

type Fase = "jugando" | "premios" | "correo" | "listo"
type Celda = [number, number]

// Línea recta de celdas entre a y b (horizontal, vertical o diagonal a 45°).
function lineaCeldas(a: Celda, b: Celda): Celda[] | null {
	const dr = b[0] - a[0]
	const dc = b[1] - a[1]
	const adr = Math.abs(dr)
	const adc = Math.abs(dc)
	let steps: number, sr: number, sc: number
	if (dr === 0 && dc === 0) return [[a[0], a[1]]]
	if (dr === 0) { steps = adc; sr = 0; sc = Math.sign(dc) }
	else if (dc === 0) { steps = adr; sr = Math.sign(dr); sc = 0 }
	else if (adr === adc) { steps = adr; sr = Math.sign(dr); sc = Math.sign(dc) }
	else return null
	const cells: Celda[] = []
	for (let k = 0; k <= steps; k++) cells.push([a[0] + sr * k, a[1] + sc * k])
	return cells
}

const CLAROS = new Set([0, 2, 4, 6, 8]) // damero del ícono

export function SopaModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
	const [letras, setLetras] = useState<string[][]>([])
	const [palabras, setPalabras] = useState<string[]>([])
	const [premios, setPremios] = useState<Premio[]>([])
	const [cargando, setCargando] = useState(true)

	const [fase, setFase] = useState<Fase>("jugando")
	const [encontradas, setEncontradas] = useState<Set<string>>(new Set())
	const [celdasEncontradas, setCeldasEncontradas] = useState<Set<string>>(new Set())
	const [inicio, setInicio] = useState<Celda | null>(null)
	const [seleccion, setSeleccion] = useState<Celda[]>([])

	const [premioIdx, setPremioIdx] = useState(0)
	const [correo, setCorreo] = useState("")
	const [codigo, setCodigo] = useState("")
	const [correoEnviado, setCorreoEnviado] = useState(true)
	const [error, setError] = useState("")
	const [enviando, setEnviando] = useState(false)

	const gridRef = useRef<HTMLDivElement>(null)
	const premioElegido = premios[premioIdx] ?? null

	// Carga Poppins una sola vez.
	useEffect(() => {
		const id = "poppins-font"
		if (typeof document !== "undefined" && !document.getElementById(id)) {
			const l = document.createElement("link")
			l.id = id
			l.rel = "stylesheet"
			l.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap"
			document.head.appendChild(l)
		}
	}, [])

	useEffect(() => {
		if (!isOpen) return
		reset()
		setCargando(true)
		fetch("/api/sopa/config")
			.then((r) => r.json())
			.then((d) => {
				setLetras(Array.isArray(d.letras) ? d.letras : [])
				setPalabras(Array.isArray(d.palabras) ? d.palabras : [])
				setPremios(Array.isArray(d.premios) ? d.premios : [])
			})
			.catch(() => {})
			.finally(() => setCargando(false))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen])

	function reset() {
		setFase("jugando")
		setEncontradas(new Set())
		setCeldasEncontradas(new Set())
		setInicio(null)
		setSeleccion([])
		setPremioIdx(0)
		setCorreo("")
		setCodigo("")
		setError("")
	}
	function cerrar() { reset(); onClose() }

	if (!isOpen) return null

	function celdaDesdePunto(x: number, y: number): Celda | null {
		const el = document.elementFromPoint(x, y) as HTMLElement | null
		const cell = el?.closest("[data-r]") as HTMLElement | null
		if (!cell) return null
		return [Number(cell.dataset.r), Number(cell.dataset.c)]
	}
	function onPointerDown(e: React.PointerEvent) {
		const c = celdaDesdePunto(e.clientX, e.clientY)
		if (!c) return
		gridRef.current?.setPointerCapture(e.pointerId)
		setInicio(c)
		setSeleccion([c])
	}
	function onPointerMove(e: React.PointerEvent) {
		if (!inicio) return
		const c = celdaDesdePunto(e.clientX, e.clientY)
		if (!c) return
		const linea = lineaCeldas(inicio, c)
		if (linea) setSeleccion(linea)
	}
	function onPointerUp() {
		if (!inicio || seleccion.length === 0) { setInicio(null); setSeleccion([]); return }
		const texto = seleccion.map(([r, c]) => letras[r]?.[c] ?? "").join("")
		const rev = texto.split("").reverse().join("")
		const objetivo = palabras.find(
			(p) => !encontradas.has(p) && (normalizarPalabra(p) === texto || normalizarPalabra(p) === rev)
		)
		if (objetivo) {
			const nuevas = new Set(encontradas); nuevas.add(objetivo)
			const celdas = new Set(celdasEncontradas)
			for (const [r, c] of seleccion) celdas.add(`${r},${c}`)
			setEncontradas(nuevas)
			setCeldasEncontradas(celdas)
		}
		setInicio(null); setSeleccion([])
	}

	async function reclamar() {
		setError("")
		const email = correo.trim().toLowerCase()
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Escribí un correo válido."); return }
		if (!premioElegido) return
		setEnviando(true)
		try {
			const res = await fetch("/api/sopa/reclamar", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ correo: email, etiqueta: premioElegido.etiqueta }),
			})
			const data = await res.json()
			if (!res.ok) { setError(data.error || "No se pudo reclamar el premio."); setEnviando(false); return }
			setCodigo(data.codigo ?? "")
			setCorreoEnviado(data.correoEnviado)
			setFase("listo")
		} catch { setError("Error de conexión. Intentá de nuevo.") }
		finally { setEnviando(false) }
	}

	const selSet = new Set(seleccion.map(([r, c]) => `${r},${c}`))
	const cols = letras[0]?.length || 10
	const total = palabras.length
	const hechas = encontradas.size
	const pct = total > 0 ? Math.round((hechas / total) * 100) : 0
	const completo = total > 0 && hechas >= total
	const enJuego = cargando || letras.length === 0 || fase === "jugando"

	return (
		<div className="s2back" onClick={cerrar}>
			{enJuego ? (
				/* ---------- Tarjeta del juego ---------- */
				<div className="s2card" onClick={(e) => e.stopPropagation()}>
					<div className="s2head">
						<span className="s2ic" aria-hidden>
							{Array.from({ length: 9 }).map((_, i) => (
								<i key={i} style={{ background: CLAROS.has(i) ? "#12b76a" : "rgba(255,255,255,.4)" }} />
							))}
						</span>
						<span className="s2htxt">
							<span className="s2kicker">JUGÁ Y GANÁ</span>
							<span className="s2htitle">Sopa de Letras</span>
						</span>
						<button className="s2close" onClick={cerrar} aria-label="Cerrar">✕</button>
					</div>

					{cargando ? (
						<p className="s2info" style={{ padding: "28px 24px", textAlign: "center" }}>Cargando…</p>
					) : letras.length === 0 ? (
						<p className="s2info" style={{ padding: "28px 24px", textAlign: "center" }}>El juego no está disponible ahora.</p>
					) : (
						<>
							<div className="s2prog">
								<span className="s2progtxt">Palabras ({hechas}/{total})</span>
								<span className="s2bar"><span className="s2barfill" style={{ width: `${pct}%` }} /></span>
							</div>
							<p className="s2instr">Arrastrá el dedo sobre las letras para marcar cada palabra.</p>

							<div style={{ padding: "6px 24px 0" }}>
								<div
									ref={gridRef}
									onPointerDown={onPointerDown}
									onPointerMove={onPointerMove}
									onPointerUp={onPointerUp}
									onPointerCancel={onPointerUp}
									className="s2grid"
									style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
								>
									{letras.map((fila, r) =>
										fila.map((ch, c) => {
											const key = `${r},${c}`
											const cls = celdasEncontradas.has(key) ? "s2cell found" : selSet.has(key) ? "s2cell sel" : "s2cell"
											return <div key={key} data-r={r} data-c={c} className={cls}>{ch}</div>
										})
									)}
								</div>
							</div>

							<div className="s2chips">
								{palabras.map((p, i) => {
									const ok = encontradas.has(p)
									return (
										<span key={i} className="s2chip">
											<span className={ok ? "s2dot s2dot-ok" : "s2dot"}>{ok ? "✓" : ""}</span>
											{p}
										</span>
									)
								})}
							</div>

							{completo ? (
								<div className="s2foot-win">
									<span className="s2winL">
										<span className="s2kicker" style={{ color: "rgba(255,255,255,.85)" }}>COMPLETASTE EL JUEGO</span>
										<span className="s2wintitle">¡Ganaste un premio!</span>
									</span>
									<button className="s2winbtn" onClick={() => setFase("premios")}>ELEGIR PREMIO</button>
								</div>
							) : (
								<div className="s2foot-note">
									<span style={{ fontSize: 18 }}>🎁</span>
									<span>Encontrá las {total} familias olfativas y desbloqueás tu premio.</span>
								</div>
							)}
						</>
					)}
				</div>
			) : (
				/* ---------- Popup de premios ---------- */
				<div className="p2card" onClick={(e) => e.stopPropagation()}>
					<div className="p2head">
						<span className="p2pill">PREMIO DESBLOQUEADO</span>
						<div className="p2title">¡Ganaste! 🎉</div>
						<div className="p2sub">
							{fase === "premios"
								? `Elegí uno de los ${premios.length} beneficios.`
								: fase === "correo"
								? "Escribí tu correo para recibir el código."
								: "Tu premio quedó reservado."}
						</div>
						<button className="p2close" onClick={cerrar} aria-label="Cerrar">✕</button>
					</div>

					{fase === "premios" ? (
						<div className="p2body">
							{premios.map((p, i) => {
								const sel = i === premioIdx
								return (
									<button key={i} className={sel ? "p2opt p2opt-sel" : "p2opt"} onClick={() => setPremioIdx(i)}>
										<span className={sel ? "p2radio p2radio-on" : "p2radio"}>{sel ? "✓" : ""}</span>
										<span className="p2mid">
											<span className="p2row1">
												<span className="p2name">{p.etiqueta}</span>
												{p.masPedido && <span className="p2badge">MÁS PEDIDO</span>}
											</span>
											{p.detalle && <span className="p2det">{p.detalle}</span>}
										</span>
										{p.valor && <span className="p2val">{p.valor}</span>}
									</button>
								)
							})}
							<button className="p2cta" onClick={() => setFase("correo")}>RECLAMAR PREMIO</button>
						</div>
					) : fase === "correo" ? (
						<div className="p2body">
							<div className="p2sel">
								<span className="p2selname">{premioElegido?.etiqueta}</span>
								{premioElegido?.valor && <span className="p2val">{premioElegido.valor}</span>}
							</div>
							<input
								className="p2input"
								type="email"
								value={correo}
								onChange={(e) => setCorreo(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && reclamar()}
								placeholder="tucorreo@ejemplo.com"
							/>
							<p className="p2mini">Solo podés participar una vez con tu correo.</p>
							{error && <p className="p2err">{error}</p>}
							<button className="p2cta" onClick={reclamar} disabled={enviando}>
								{enviando ? "ENVIANDO…" : "RECLAMAR PREMIO"}
							</button>
						</div>
					) : (
						<div className="p2body" style={{ textAlign: "center" }}>
							<div style={{ fontSize: 40 }}>🎁</div>
							<div className="p2selname" style={{ fontSize: 16, marginTop: 4 }}>{premioElegido?.etiqueta}</div>
							{correoEnviado ? (
								<p className="p2det" style={{ marginTop: 8 }}>Enviamos tu código a <strong style={{ color: "#131735" }}>{correo}</strong>. Revisalo (y spam) y presentalo por WhatsApp.</p>
							) : (
								<>
									<p className="p2det" style={{ marginTop: 8 }}>Guardá este código y presentalo por WhatsApp:</p>
									<div className="p2code">{codigo}</div>
								</>
							)}
							<button className="p2cta" onClick={cerrar} style={{ marginTop: 16 }}>¡LISTO!</button>
						</div>
					)}
				</div>
			)}

			<style>{`
				.s2back {
					position: fixed; inset: 0; z-index: 2000;
					background: rgba(11,13,28,.6);
					display: flex; align-items: center; justify-content: center; padding: 14px;
					font-family: 'Poppins', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
				}
				.s2card {
					width: 100%; max-width: 460px; background: #fff;
					border-radius: 24px; overflow: hidden;
					box-shadow: 0 30px 70px rgba(19,23,53,.22);
					max-height: 94vh; overflow-y: auto;
					animation: s2pop2 240ms ease;
				}
				.s2head { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 14px; background: #131735; padding: 20px 24px; }
				.s2ic { display: grid; grid-template-columns: repeat(3, 6px); gap: 3px; padding: 9px; background: rgba(255,255,255,.14); border-radius: 10px; }
				.s2ic i { width: 6px; height: 6px; border-radius: 1px; display: block; }
				.s2htxt { display: flex; flex-direction: column; min-width: 0; }
				.s2kicker { font-size: 10px; font-weight: 700; letter-spacing: .14em; color: rgba(255,255,255,.7); line-height: 1; }
				.s2htitle { font-size: 19px; font-weight: 800; color: #fff; line-height: 1.15; margin-top: 3px; }
				.s2close { width: 36px; height: 36px; border-radius: 999px; background: transparent; border: 1.5px solid rgba(255,255,255,.22); color: #fff; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 160ms ease; }
				.s2close:hover { background: rgba(255,255,255,.12); }

				.s2prog { display: flex; align-items: center; gap: 14px; padding: 18px 24px 6px; }
				.s2progtxt { font-size: 12px; font-weight: 700; color: #131735; white-space: nowrap; }
				.s2bar { flex: 1; height: 6px; border-radius: 999px; background: #eceae6; overflow: hidden; }
				.s2barfill { display: block; height: 100%; background: #12b76a; border-radius: 999px; transition: width 260ms ease; }
				.s2instr { font-size: 12px; color: #6b7080; line-height: 1.4; padding: 0 24px; }

				.s2grid { display: grid; gap: 5px; touch-action: none; user-select: none; }
				.s2cell { aspect-ratio: 1; border-radius: 8px; background: #f4f3f1; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #131735; }
				.s2cell:hover { background: #e7e5e1; }
				.s2cell.sel { background: #12b76a; color: #fff; font-weight: 800; }
				.s2cell.found { background: #131735; color: #fff; font-weight: 800; animation: s2pop 200ms ease; }

				.s2chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 18px 24px 6px; }
				.s2chip { display: inline-flex; align-items: center; gap: 7px; background: #fff; border: 1.5px solid #e2e0dd; border-radius: 999px; padding: 6px 12px 6px 8px; font-size: 12px; font-weight: 700; color: #131735; }
				.s2dot { width: 14px; height: 14px; border-radius: 999px; border: 1.5px solid #cfcdc9; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; color: #fff; }
				.s2dot-ok { background: #12b76a; border-color: #12b76a; }

				.s2foot-note { display: flex; align-items: center; gap: 10px; margin: 14px 24px 24px; background: #fdf8f3; border: 1px solid #f0e7dc; border-radius: 14px; padding: 12px 14px; font-size: 12px; color: #6b7080; line-height: 1.4; }
				.s2foot-win { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 12px; margin: 14px 24px 24px; background: #12b76a; border-radius: 16px; padding: 14px 16px; animation: s2pop2 240ms ease; }
				.s2winL { display: flex; flex-direction: column; }
				.s2wintitle { font-size: 18px; font-weight: 800; color: #fff; line-height: 1.15; margin-top: 2px; }
				.s2winbtn { background: #fff; color: #131735; border: 0; border-radius: 12px; padding: 12px 16px; font-size: 12px; font-weight: 800; cursor: pointer; font-family: inherit; transition: transform 160ms ease; }
				.s2winbtn:hover { transform: translateY(-1px); }
				.s2info { font-size: 12px; color: #6b7080; line-height: 1.4; }

				/* ----- Popup de premios ----- */
				.p2card {
					width: 100%; max-width: 420px; background: #fff;
					border: 1px solid #e7e4e0; border-radius: 20px; overflow: hidden;
					box-shadow: 0 10px 30px rgba(19,23,53,.07);
					max-height: 94vh; overflow-y: auto; animation: s2pop2 240ms ease;
				}
				.p2head { position: relative; background: #131735; padding: 22px 24px; }
				.p2pill { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: .12em; color: #12b76a; background: rgba(18,183,106,.16); border-radius: 999px; padding: 5px 10px; }
				.p2title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -.01em; margin-top: 12px; }
				.p2sub { font-size: 13px; color: #b9bdd0; margin-top: 4px; }
				.p2close { position: absolute; top: 18px; right: 18px; width: 34px; height: 34px; border-radius: 999px; background: transparent; border: 1.5px solid rgba(255,255,255,.22); color: #fff; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 160ms ease; }
				.p2close:hover { background: rgba(255,255,255,.12); }

				.p2body { display: flex; flex-direction: column; gap: 12px; padding: 20px 24px 24px; }
				.p2opt {
					display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 14px;
					background: #fff; border: 1.5px solid #e2e0dd; border-radius: 16px; padding: 16px;
					text-align: left; cursor: pointer; font-family: inherit;
					transition: border-color 160ms ease, background 160ms ease;
				}
				.p2opt:hover { border-color: #12b76a; background: #f4fbf7; }
				.p2opt-sel { border-color: #12b76a; background: #f4fbf7; }
				.p2radio { width: 22px; height: 22px; border-radius: 999px; border: 2px solid #cfcdc9; display: inline-flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 800; }
				.p2radio-on { background: #12b76a; border-color: #12b76a; animation: s2pop 180ms ease; }
				.p2mid { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
				.p2row1 { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
				.p2name { font-size: 16px; font-weight: 700; color: #131735; }
				.p2badge { font-size: 10px; font-weight: 800; letter-spacing: .1em; color: #131735; background: #f2e4c9; border-radius: 999px; padding: 3px 8px; }
				.p2det { font-size: 12px; color: #6b7080; line-height: 1.35; text-wrap: pretty; }
				.p2val { font-size: 14px; font-weight: 800; color: #131735; white-space: nowrap; }

				.p2cta {
					width: 100%; background: #131735; border: 1.5px solid #131735; color: #fff;
					border-radius: 14px; padding: 15px 18px; font-size: 14px; font-weight: 800; letter-spacing: .06em;
					text-align: center; cursor: pointer; font-family: inherit; margin-top: 2px;
					transition: background 160ms ease, border-color 160ms ease;
				}
				.p2cta:hover { background: #12b76a; border-color: #12b76a; }
				.p2cta:disabled { opacity: .6; cursor: default; }

				.p2sel { display: flex; align-items: center; justify-content: space-between; gap: 10px; background: #f4fbf7; border: 1.5px solid #cdeede; border-radius: 14px; padding: 12px 14px; }
				.p2selname { font-size: 15px; font-weight: 700; color: #131735; }
				.p2input { width: 100%; border: 1.5px solid #e2e0dd; border-radius: 12px; padding: 12px; font-size: 14px; color: #131735; font-family: inherit; outline: none; }
				.p2input:focus { border-color: #12b76a; }
				.p2mini { font-size: 11px; color: #9a9ba3; }
				.p2err { font-size: 12px; color: #d92d20; }
				.p2code { background: #131735; color: #fff; border-radius: 12px; padding: 14px; font-family: 'Courier New', monospace; font-size: 18px; font-weight: 800; letter-spacing: 4px; }

				.s2back button:focus-visible, .s2back input:focus-visible { outline: 2px solid #12b76a; outline-offset: 2px; }

				@keyframes s2pop { 0% { transform: scale(.94); } 60% { transform: scale(1.02); } 100% { transform: scale(1); } }
				@keyframes s2pop2 { 0% { transform: scale(.96); opacity: .4; } 60% { transform: scale(1.01); } 100% { transform: scale(1); opacity: 1; } }
			`}</style>
		</div>
	)
}
