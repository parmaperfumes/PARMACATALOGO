"use client"

import { useEffect, useMemo, useState } from "react"
import {
	construirGrilla,
	normalizarCrucigrama,
	CRUCIGRAMA_DEFAULT,
	type Direccion,
	type Entrada,
} from "@/lib/crucigrama"

export default function CrucigramaAdminPage() {
	const [activa, setActiva] = useState(false)
	const [descuento, setDescuento] = useState(10)
	const [filas, setFilas] = useState(8)
	const [columnas, setColumnas] = useState(8)
	const [entradas, setEntradas] = useState<Entrada[]>([])

	const [cargando, setCargando] = useState(true)
	const [guardando, setGuardando] = useState(false)
	const [msg, setMsg] = useState("")
	const [verRespuestas, setVerRespuestas] = useState(false)

	// Importar desde JSON (generado por una IA o a partir de una imagen).
	const [mostrarImportar, setMostrarImportar] = useState(false)
	const [textoImportar, setTextoImportar] = useState("")
	const [msgImportar, setMsgImportar] = useState("")

	useEffect(() => {
		fetch("/api/crucigrama/config")
			.then((r) => r.json())
			.then((d) => {
				setActiva(!!d.activa)
				setDescuento(d.descuento ?? 10)
				setFilas(d.filas ?? 8)
				setColumnas(d.columnas ?? 8)
				setEntradas(Array.isArray(d.entradas) ? d.entradas : [])
			})
			.catch(() => {})
			.finally(() => setCargando(false))
	}, [])

	const cfg = { activa, descuento, filas, columnas, entradas }
	const grilla = useMemo(() => construirGrilla(cfg as any), [activa, descuento, filas, columnas, entradas])

	function actualizarEntrada(i: number, campo: keyof Entrada, valor: string) {
		setEntradas((prev) =>
			prev.map((e, idx) => {
				if (idx !== i) return e
				if (campo === "fila" || campo === "columna") return { ...e, [campo]: Math.max(1, Math.round(Number(valor) || 1)) }
				if (campo === "direccion") return { ...e, direccion: (valor as Direccion) === "V" ? "V" : "H" }
				if (campo === "palabra") return { ...e, palabra: valor.toUpperCase() }
				return { ...e, [campo]: valor }
			})
		)
	}
	function agregarEntrada() {
		setEntradas((prev) => [...prev, { palabra: "", pista: "", fila: 1, columna: 1, direccion: "H" }])
	}
	function quitarEntrada(i: number) {
		setEntradas((prev) => prev.filter((_, idx) => idx !== i))
	}

	function cargarImportado() {
		setMsgImportar("")
		let datos: any
		try {
			datos = JSON.parse(textoImportar)
		} catch {
			setMsgImportar("❌ El texto no es un JSON válido. Revisa que esté completo.")
			return
		}
		const cfg = normalizarCrucigrama(datos)
		if (cfg.entradas.length === 0) {
			setMsgImportar("❌ No se encontraron palabras válidas en el JSON.")
			return
		}
		setDescuento(cfg.descuento)
		setFilas(cfg.filas)
		setColumnas(cfg.columnas)
		setEntradas(cfg.entradas)
		setMsgImportar(`✅ Se cargaron ${cfg.entradas.length} palabra(s). Revísalo abajo y guarda.`)
	}

	async function guardar() {
		setMsg("")
		setGuardando(true)
		try {
			const res = await fetch("/api/crucigrama/config", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(cfg),
			})
			const data = await res.json()
			if (res.ok) setMsg("✅ Crucigrama guardado.")
			else setMsg(`❌ ${data.error || "No se pudo guardar."}`)
		} catch {
			setMsg("❌ Error de conexión.")
		} finally {
			setGuardando(false)
		}
	}

	return (
		<div className="px-8 py-8 max-w-6xl mx-auto">
			<div className="flex items-center gap-2 text-[12px] text-[#9a9ba3] mb-1">
				<a href="/juegos" className="hover:text-black">Juegos</a>
				<span>/</span>
				<span className="text-[#6c6e78]">Crucigrama</span>
			</div>
			<h1 className="text-xl font-bold text-black mb-1">Crucigrama</h1>
			<p className="text-[13px] text-[#6c6e78] mb-6">
				Coloca las palabras en la cuadrícula. A la derecha ves cómo se verá en el sitio.
			</p>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* ---- Configuración ---- */}
				<div className="space-y-5">
					{/* Ajustes generales */}
					<div className="border border-[#ececef] rounded-xl p-4 space-y-3">
						<div className="flex items-center justify-between gap-4">
							<div>
								<div className="text-[14px] font-bold text-black">Crucigrama en el sitio</div>
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
								aria-label="Mostrar u ocultar el crucigrama"
							>
								<span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${activa ? "translate-x-6" : ""}`} />
							</button>
						</div>

						<div className="grid grid-cols-3 gap-3">
							<label className="block">
								<span className="text-[12px] text-[#6c6e78] font-semibold">Descuento (%)</span>
								<input type="number" min={1} max={100} value={descuento}
									onChange={(e) => setDescuento(Math.max(1, Math.round(Number(e.target.value) || 1)))}
									className="mt-1 w-full border border-[#ececef] rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-black" />
							</label>
							<label className="block">
								<span className="text-[12px] text-[#6c6e78] font-semibold">Filas</span>
								<input type="number" min={3} max={20} value={filas}
									onChange={(e) => setFilas(Math.max(3, Math.min(20, Math.round(Number(e.target.value) || 8))))}
									className="mt-1 w-full border border-[#ececef] rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-black" />
							</label>
							<label className="block">
								<span className="text-[12px] text-[#6c6e78] font-semibold">Columnas</span>
								<input type="number" min={3} max={20} value={columnas}
									onChange={(e) => setColumnas(Math.max(3, Math.min(20, Math.round(Number(e.target.value) || 8))))}
									className="mt-1 w-full border border-[#ececef] rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-black" />
							</label>
						</div>
					</div>

					{/* Importar desde JSON (IA / imagen) */}
					<div className="border border-[#ececef] rounded-xl">
						<button
							type="button"
							onClick={() => setMostrarImportar((v) => !v)}
							aria-expanded={mostrarImportar}
							className="w-full flex items-center justify-between p-4 text-left"
						>
							<span className="text-[14px] font-bold text-black">
								Importar crucigrama (desde IA)
							</span>
							<span className="text-[12px] font-semibold text-[#6c6e78]">
								{mostrarImportar ? "Ocultar ▲" : "Pegar JSON ▼"}
							</span>
						</button>
						{mostrarImportar && (
							<div className="px-4 pb-4">
								<p className="text-[12px] text-[#6c6e78] mb-2">
									Pega aquí el crucigrama en formato JSON (el que genera la IA o el que
									te doy a partir de tu imagen). Se cargará abajo para que lo revises.
								</p>
								<textarea
									value={textoImportar}
									onChange={(e) => setTextoImportar(e.target.value)}
									rows={7}
									placeholder='{"descuento":10,"filas":8,"columnas":8,"entradas":[{"palabra":"PERFUME","pista":"...","fila":2,"columna":1,"direccion":"H"}]}'
									className="w-full border border-[#ececef] rounded-lg px-3 py-2 text-[12px] font-mono text-black outline-none focus:border-black"
								/>
								<div className="flex items-center gap-3 mt-2">
									<button
										onClick={cargarImportado}
										className="bg-[#16255c] hover:bg-[#0d1b3d] text-white font-semibold rounded-lg px-4 py-2 text-sm"
									>
										Cargar
									</button>
									{msgImportar && <span className="text-[13px]">{msgImportar}</span>}
								</div>
							</div>
						)}
					</div>

					{/* Palabras */}
					<div className="border border-[#ececef] rounded-xl p-4">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-[14px] font-bold text-black">Palabras</h2>
							<button onClick={agregarEntrada} className="text-[12px] font-semibold text-[#16255c] hover:underline">
								+ Agregar palabra
							</button>
						</div>

						{entradas.length === 0 ? (
							<p className="text-[13px] text-[#9a9ba3]">Aún no hay palabras. Agrega la primera.</p>
						) : (
							<div className="space-y-3">
								{entradas.map((e, i) => (
									<div key={i} className="border border-[#f2f2f4] rounded-lg p-3">
										<div className="flex gap-2 mb-2">
											<input value={e.palabra} onChange={(ev) => actualizarEntrada(i, "palabra", ev.target.value)}
												placeholder="PALABRA"
												className="flex-1 border border-[#ececef] rounded-lg px-3 py-2 text-sm text-black uppercase outline-none focus:border-black font-mono" />
											<button onClick={() => quitarEntrada(i)}
												className="text-red-500 hover:text-red-700 text-lg leading-none px-1" aria-label="Quitar palabra">✕</button>
										</div>
										<input value={e.pista} onChange={(ev) => actualizarEntrada(i, "pista", ev.target.value)}
											placeholder="Pista / definición"
											className="w-full border border-[#ececef] rounded-lg px-3 py-2 text-sm text-black outline-none focus:border-black mb-2" />
										<div className="grid grid-cols-3 gap-2">
											<label className="text-[11px] text-[#6c6e78] font-semibold">
												Fila
												<input type="number" min={1} max={filas} value={e.fila}
													onChange={(ev) => actualizarEntrada(i, "fila", ev.target.value)}
													className="mt-0.5 w-full border border-[#ececef] rounded-lg px-2 py-1.5 text-sm text-black outline-none focus:border-black" />
											</label>
											<label className="text-[11px] text-[#6c6e78] font-semibold">
												Columna
												<input type="number" min={1} max={columnas} value={e.columna}
													onChange={(ev) => actualizarEntrada(i, "columna", ev.target.value)}
													className="mt-0.5 w-full border border-[#ececef] rounded-lg px-2 py-1.5 text-sm text-black outline-none focus:border-black" />
											</label>
											<label className="text-[11px] text-[#6c6e78] font-semibold">
												Dirección
												<select value={e.direccion} onChange={(ev) => actualizarEntrada(i, "direccion", ev.target.value)}
													className="mt-0.5 w-full border border-[#ececef] rounded-lg px-2 py-1.5 text-sm text-black outline-none focus:border-black bg-white">
													<option value="H">Horizontal →</option>
													<option value="V">Vertical ↓</option>
												</select>
											</label>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					<div className="flex items-center gap-3">
						<button onClick={guardar} disabled={guardando || cargando}
							className="bg-black hover:bg-[#222] text-white font-semibold rounded-lg px-5 py-2.5 text-sm disabled:opacity-50">
							{guardando ? "Guardando…" : "Guardar crucigrama"}
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

						<PreviewCrucigrama grilla={grilla} descuento={descuento} verRespuestas={verRespuestas} columnas={columnas} />
					</div>
				</div>
			</div>
		</div>
	)
}

function PreviewCrucigrama({
	grilla,
	descuento,
	verRespuestas,
	columnas,
}: {
	grilla: ReturnType<typeof construirGrilla>
	descuento: number
	verRespuestas: boolean
	columnas: number
}) {
	const CELDA = 34
	return (
		<div className="bg-[#f8f8f9] rounded-lg p-4">
			<div className="text-center mb-3">
				<div className="text-[15px] font-bold text-black">🧩 Resuelve y gana {descuento}%</div>
				<div className="text-[12px] text-[#6c6e78]">Completa el crucigrama para ganar tu descuento.</div>
			</div>

			<div className="overflow-x-auto">
				<div
					className="inline-grid gap-[2px] mx-auto"
					style={{ gridTemplateColumns: `repeat(${columnas}, ${CELDA}px)` }}
				>
					{grilla.celdas.map((fila, r) =>
						fila.map((celda, c) => (
							<div
								key={`${r}-${c}`}
								style={{ width: CELDA, height: CELDA }}
								className={
									celda.activa
										? "relative bg-white border border-[#16255c] rounded-[3px] flex items-center justify-center"
										: ""
								}
							>
								{celda.activa && celda.numero && (
									<span className="absolute top-0 left-0.5 text-[8px] text-[#6c6e78] leading-none">{celda.numero}</span>
								)}
								{celda.activa && verRespuestas && (
									<span className="text-[15px] font-bold text-[#16255c] font-mono">{celda.letra}</span>
								)}
							</div>
						))
					)}
				</div>
			</div>

			{/* Pistas */}
			<div className="grid grid-cols-2 gap-4 mt-4 text-[12px]">
				<div>
					<div className="font-bold text-black mb-1">Horizontales →</div>
					{grilla.horizontales.length === 0 ? (
						<p className="text-[#9a9ba3]">—</p>
					) : (
						<ul className="space-y-0.5">
							{grilla.horizontales.map((p, i) => (
								<li key={i} className="text-[#444]">
									<strong>{p.numero}.</strong> {p.pista || <em className="text-[#9a9ba3]">(sin pista)</em>}
								</li>
							))}
						</ul>
					)}
				</div>
				<div>
					<div className="font-bold text-black mb-1">Verticales ↓</div>
					{grilla.verticales.length === 0 ? (
						<p className="text-[#9a9ba3]">—</p>
					) : (
						<ul className="space-y-0.5">
							{grilla.verticales.map((p, i) => (
								<li key={i} className="text-[#444]">
									<strong>{p.numero}.</strong> {p.pista || <em className="text-[#9a9ba3]">(sin pista)</em>}
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	)
}
