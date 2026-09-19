"use client"

import { useEffect, useState } from "react"
import {
	celdasRespuesta,
	generarSopa,
	PREMIOS_SOPA_DEFAULT,
	type Colocacion,
	type Premio,
} from "@/lib/sopa"

export default function SopaAdminPage() {
	const [activa, setActiva] = useState(false)
	const [descuento, setDescuento] = useState(10)
	const [filas, setFilas] = useState(12)
	const [columnas, setColumnas] = useState(12)
	const [palabrasTexto, setPalabrasTexto] = useState("")

	const [palabras, setPalabras] = useState<string[]>([])
	const [letras, setLetras] = useState<string[][]>([])
	const [colocaciones, setColocaciones] = useState<Colocacion[]>([])
	const [premios, setPremios] = useState<Premio[]>(PREMIOS_SOPA_DEFAULT)

	const [cargando, setCargando] = useState(true)
	const [guardando, setGuardando] = useState(false)
	const [msg, setMsg] = useState("")
	const [msgGen, setMsgGen] = useState("")
	const [verRespuestas, setVerRespuestas] = useState(false)

	useEffect(() => {
		fetch("/api/sopa/config")
			.then((r) => r.json())
			.then((d) => {
				setActiva(!!d.activa)
				setDescuento(d.descuento ?? 10)
				setFilas(d.filas ?? 12)
				setColumnas(d.columnas ?? 12)
				setPalabras(Array.isArray(d.palabras) ? d.palabras : [])
				setPalabrasTexto(Array.isArray(d.palabras) ? d.palabras.join("\n") : "")
				setLetras(Array.isArray(d.letras) ? d.letras : [])
				setColocaciones(Array.isArray(d.colocaciones) ? d.colocaciones : [])
				if (Array.isArray(d.premios) && d.premios.length > 0) setPremios(d.premios)
			})
			.catch(() => {})
			.finally(() => setCargando(false))
	}, [])

	function generar() {
		setMsgGen("")
		const lista = palabrasTexto
			.split(/[\n,]/)
			.map((s) => s.trim())
			.filter(Boolean)
		if (lista.length === 0) {
			setMsgGen("❌ Escribe al menos una palabra.")
			return
		}
		const { letras: g, colocaciones: col, noColocadas, palabras: colocadas } = generarSopa(lista, filas, columnas)
		setLetras(g)
		setColocaciones(col)
		setPalabras(colocadas.filter((p) => !noColocadas.includes(p)))
		if (noColocadas.length > 0) {
			setMsgGen(`⚠️ No cupieron: ${noColocadas.join(", ")}. Usa una cuadrícula más grande o palabras más cortas.`)
		} else {
			setMsgGen(`✅ Sopa generada con ${col.length} palabra(s).`)
		}
	}

	function actualizarPremio(i: number, campo: keyof Premio, valor: string) {
		setPremios((prev) =>
			prev.map((p, idx) => {
				if (idx !== i) return p
				if (campo === "descuento") return { ...p, descuento: Math.max(0, Math.min(100, Math.round(Number(valor) || 0))) }
				if (campo === "detalle" || campo === "valor") return { ...p, [campo]: valor }
				return { ...p, etiqueta: valor }
			})
		)
	}
	function agregarPremio() {
		setPremios((prev) => [...prev, { etiqueta: "", descuento: 0 }])
	}
	function quitarPremio(i: number) {
		setPremios((prev) => prev.filter((_, idx) => idx !== i))
	}

	async function guardar() {
		setMsg("")
		if (letras.length === 0) {
			setMsg("❌ Primero genera la sopa (botón “Generar sopa”).")
			return
		}
		const premiosLimpios = premios.filter((p) => p.etiqueta.trim())
		if (premiosLimpios.length === 0) {
			setMsg("❌ Agrega al menos un premio con etiqueta.")
			return
		}
		setGuardando(true)
		try {
			const res = await fetch("/api/sopa/config", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ activa, descuento, filas, columnas, palabras, letras, colocaciones, premios: premiosLimpios }),
			})
			const data = await res.json()
			if (res.ok) setMsg("✅ Sopa de letras guardada.")
			else setMsg(`❌ ${data.error || "No se pudo guardar."}`)
		} catch {
			setMsg("❌ Error de conexión.")
		} finally {
			setGuardando(false)
		}
	}

	const claves = celdasRespuesta(colocaciones)

	return (
		<div className="px-8 py-8 max-w-6xl mx-auto">
			<div className="flex items-center gap-2 text-[12px] text-[#9a9ba3] mb-1">
				<a href="/juegos" className="hover:text-black">Juegos</a>
				<span>/</span>
				<span className="text-[#6c6e78]">Sopa de letras</span>
			</div>
			<h1 className="text-xl font-bold text-black mb-1">Sopa de letras</h1>
			<p className="text-[13px] text-[#6c6e78] mb-6">
				Escribe las palabras y genera la sopa. A la derecha ves cómo se verá en el sitio.
			</p>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* ---- Configuración ---- */}
				<div className="space-y-5">
					<div className="border border-[#ececef] rounded-xl p-4 space-y-3">
						<div className="flex items-center justify-between gap-4">
							<div>
								<div className="text-[14px] font-bold text-black">Sopa de letras en el sitio</div>
								<div className="text-[12px] text-[#6c6e78]">
									{activa ? "Visible para los clientes." : "Oculto — no aparece en el sitio."}
								</div>
							</div>
							<button
								type="button"
								role="switch"
								aria-checked={activa}
								onClick={() => setActiva((v) => !v)}
								className={`relative w-14 h-8 rounded-full transition-colors ${activa ? "bg-green-600" : "bg-[#ccced6]"}`}
								aria-label="Mostrar u ocultar la sopa de letras"
							>
								<span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${activa ? "translate-x-6" : ""}`} />
							</button>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<label className="block">
								<span className="text-[12px] text-[#6c6e78] font-semibold">Filas</span>
								<input type="number" min={5} max={20} value={filas}
									onChange={(e) => setFilas(Math.max(5, Math.min(20, Math.round(Number(e.target.value) || 12))))}
									className="mt-1 w-full border border-[#ececef] rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-black" />
							</label>
							<label className="block">
								<span className="text-[12px] text-[#6c6e78] font-semibold">Columnas</span>
								<input type="number" min={5} max={20} value={columnas}
									onChange={(e) => setColumnas(Math.max(5, Math.min(20, Math.round(Number(e.target.value) || 12))))}
									className="mt-1 w-full border border-[#ececef] rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-black" />
							</label>
						</div>
					</div>

					<div className="border border-[#ececef] rounded-xl p-4">
						<h2 className="text-[14px] font-bold text-black mb-1">Palabras a buscar</h2>
						<p className="text-[12px] text-[#6c6e78] mb-2">
							Una palabra por línea (sin espacios ni acentos; se convierten solas a mayúsculas).
						</p>
						<textarea
							value={palabrasTexto}
							onChange={(e) => setPalabrasTexto(e.target.value)}
							rows={7}
							placeholder={"PERFUME\nPARMA\nAROMA\nFRAGANCIA\nESENCIA\nELEGANCIA"}
							className="w-full border border-[#ececef] rounded-lg px-3 py-2 text-sm text-black font-mono uppercase outline-none focus:border-black"
						/>
						<div className="flex items-center gap-3 mt-2">
							<button onClick={generar}
								className="bg-[#16255c] hover:bg-[#0d1b3d] text-white font-semibold rounded-lg px-4 py-2 text-sm">
								Generar sopa
							</button>
							{msgGen && <span className="text-[13px]">{msgGen}</span>}
						</div>
					</div>

					{/* Premios que el cliente elige al ganar */}
					<div className="border border-[#ececef] rounded-xl p-4">
						<div className="flex items-center justify-between mb-1">
							<h2 className="text-[14px] font-bold text-black">Premios (el cliente elige uno al ganar)</h2>
							<button onClick={agregarPremio} className="text-[12px] font-semibold text-[#16255c] hover:underline">
								+ Agregar premio
							</button>
						</div>
						<p className="text-[12px] text-[#6c6e78] mb-3">
							Nombre = lo principal. Detalle = línea secundaria. Valor = texto a la derecha (ej. “1,550 RD”, “Regalo”).
						</p>
						<div className="space-y-3">
							{premios.map((p, i) => (
								<div key={i} className="border border-[#f0f0f2] rounded-lg p-3 space-y-2">
									<div className="flex gap-2">
										<input value={p.etiqueta} onChange={(e) => actualizarPremio(i, "etiqueta", e.target.value)}
											placeholder="Nombre (ej. 2 Perfumes)"
											className="flex-1 border border-[#ececef] rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-black" />
										<button onClick={() => quitarPremio(i)} disabled={premios.length <= 1}
											className="w-6 text-red-500 hover:text-red-700 disabled:opacity-30 text-lg leading-none" aria-label="Quitar premio">✕</button>
									</div>
									<input value={p.detalle ?? ""} onChange={(e) => actualizarPremio(i, "detalle", e.target.value)}
										placeholder="Detalle (ej. 30 ML cada uno · eliges los aromas)"
										className="w-full border border-[#ececef] rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-black" />
									<input value={p.valor ?? ""} onChange={(e) => actualizarPremio(i, "valor", e.target.value)}
										placeholder="Valor (ej. 1,550 RD / Regalo / 0 RD)"
										className="w-full border border-[#ececef] rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-black" />
								</div>
							))}
						</div>

						{/* Vista previa del popup de premios (como lo ve el cliente) */}
						{premios.some((p) => p.etiqueta.trim()) && (
							<div className="mt-4 pt-4 border-t border-[#f0f0f2]">
								<div className="text-[11px] text-[#9a9ba3] font-semibold mb-2">VISTA PREVIA — popup de premios</div>
								<div className="max-w-[340px] mx-auto rounded-2xl overflow-hidden border border-[#e7e4e0]">
									<div className="bg-[#131735] px-4 py-4">
										<span className="inline-block text-[10px] font-bold tracking-[.12em] text-[#12b76a] bg-[#12b76a]/15 rounded-full px-2 py-1">PREMIO DESBLOQUEADO</span>
										<div className="text-[20px] font-extrabold text-white mt-2">¡Ganaste! 🎉</div>
										<div className="text-[12px] text-[#b9bdd0]">Elegí uno de los {premios.filter((p) => p.etiqueta.trim()).length} beneficios.</div>
									</div>
									<div className="p-3 space-y-2">
										{premios.filter((p) => p.etiqueta.trim()).map((p, i) => (
											<div key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl p-3 border-[1.5px]"
												style={{ borderColor: i === 0 ? "#12b76a" : "#e2e0dd", background: i === 0 ? "#f4fbf7" : "#fff" }}>
												<span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] font-extrabold"
													style={{ background: i === 0 ? "#12b76a" : "transparent", border: i === 0 ? "2px solid #12b76a" : "2px solid #cfcdc9" }}>
													{i === 0 ? "✓" : ""}
												</span>
												<div className="min-w-0">
													<div className="flex items-center gap-2 flex-wrap">
														<span className="text-[14px] font-bold text-[#131735]">{p.etiqueta}</span>
														{p.masPedido && <span className="text-[9px] font-extrabold tracking-[.1em] text-[#131735] bg-[#f2e4c9] rounded-full px-1.5 py-0.5">MÁS PEDIDO</span>}
													</div>
													{p.detalle && <div className="text-[11px] text-[#6b7080] leading-snug">{p.detalle}</div>}
												</div>
												{p.valor && <span className="text-[12px] font-extrabold text-[#131735] whitespace-nowrap">{p.valor}</span>}
											</div>
										))}
										<div className="w-full bg-[#131735] text-white text-center text-[12px] font-extrabold tracking-[.06em] rounded-xl py-3">RECLAMAR PREMIO</div>
									</div>
								</div>
							</div>
						)}
					</div>

					<div className="flex items-center gap-3">
						<button onClick={guardar} disabled={guardando || cargando}
							className="bg-black hover:bg-[#222] text-white font-semibold rounded-lg px-5 py-2.5 text-sm disabled:opacity-50">
							{guardando ? "Guardando…" : "Guardar sopa"}
						</button>
						{msg && <span className="text-sm">{msg}</span>}
					</div>
				</div>

				{/* ---- Vista previa ---- */}
				<div className="lg:sticky lg:top-4 self-start w-full">
					<div className="border border-[#ececef] rounded-xl p-4">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-[14px] font-bold text-black">Vista previa (como se verá)</h2>
							<label className="flex items-center gap-1.5 text-[12px] text-[#6c6e78] cursor-pointer">
								<input type="checkbox" checked={verRespuestas} onChange={(e) => setVerRespuestas(e.target.checked)} className="accent-[#16255c]" />
								Ver respuestas
							</label>
						</div>

						<div className="rounded-2xl overflow-hidden border border-[#e7e4e0]"
							style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
							{/* Cabecera navy */}
							<div className="bg-[#131735] px-4 py-3 flex items-center gap-3">
								<span className="grid gap-[3px] p-[9px] rounded-[10px] bg-white/[.14]" style={{ gridTemplateColumns: "repeat(3, 6px)" }}>
									{Array.from({ length: 9 }).map((_, i) => (
										<i key={i} className="block w-[6px] h-[6px] rounded-[1px]"
											style={{ background: [0, 2, 4, 6, 8].includes(i) ? "#12b76a" : "rgba(255,255,255,.4)" }} />
									))}
								</span>
								<span className="flex flex-col">
									<span className="text-[10px] font-bold tracking-[.14em] text-white/70 leading-none">JUGÁ Y GANÁ</span>
									<span className="text-[16px] font-extrabold text-white leading-tight">Sopa de Letras</span>
								</span>
							</div>

							{letras.length === 0 ? (
								<p className="text-center text-[13px] text-[#9a9ba3] py-10 px-4">
									Escribe palabras y pulsa “Generar sopa” para ver la vista previa.
								</p>
							) : (
								<div className="p-4">
									<div className="grid gap-[4px]" style={{ gridTemplateColumns: `repeat(${letras[0]?.length || columnas}, 1fr)` }}>
										{letras.map((fila, r) =>
											fila.map((ch, c) => {
												const esClave = verRespuestas && claves.has(`${r},${c}`)
												return (
													<div key={`${r}-${c}`}
														className="aspect-square flex items-center justify-center text-[12px] font-bold rounded-[6px]"
														style={{ background: esClave ? "#131735" : "#f4f3f1", color: esClave ? "#fff" : "#131735" }}>
														{ch}
													</div>
												)
											})
										)}
									</div>

									<div className="flex flex-wrap gap-2 mt-4">
										{palabras.map((p, i) => (
											<span key={i}
												className="inline-flex items-center gap-[7px] bg-white border-[1.5px] border-[#e2e0dd] rounded-full px-3 py-1.5 text-[12px] font-bold text-[#131735]">
												<span className="w-[14px] h-[14px] rounded-full flex items-center justify-center text-white text-[9px]"
													style={{ background: verRespuestas ? "#12b76a" : "transparent", border: verRespuestas ? "1.5px solid #12b76a" : "1.5px solid #cfcdc9" }}>
													{verRespuestas ? "✓" : ""}
												</span>
												{p}
											</span>
										))}
									</div>

									<div className="flex items-center gap-2.5 mt-4 bg-[#fdf8f3] border border-[#f0e7dc] rounded-[14px] px-3.5 py-3 text-[12px] text-[#6b7080]">
										<span className="text-[18px]">🎁</span>
										<span>Encontrá las {palabras.length} familias olfativas y desbloqueás tu premio.</span>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
