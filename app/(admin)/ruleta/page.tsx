"use client"

import { useEffect, useState } from "react"

type Registro = {
	id: string
	codigo: string
	correo: string
	descuento: number
	usado: boolean
	vencido: boolean
	telefono: string | null
	usadoEn: string | null
	createdAt: string
}

type Totales = {
	total?: number
	usados?: number
	d5?: number
	d10?: number
	d15?: number
}

type Validacion = {
	existe: boolean
	codigo?: string
	correo?: string
	descuento?: number
	usado?: boolean
	vencido?: boolean
	telefono?: string | null
} | null

function fecha(s: string | null) {
	if (!s) return "—"
	try {
		return new Date(s).toLocaleString("es-DO", {
			dateStyle: "short",
			timeStyle: "short",
		})
	} catch {
		return s
	}
}

export default function RuletaAdminPage() {
	const [registros, setRegistros] = useState<Registro[]>([])
	const [totales, setTotales] = useState<Totales>({})
	const [filtro, setFiltro] = useState<"todos" | "usados" | "no-usados">("todos")
	const [loading, setLoading] = useState(true)

	// Validador
	const [codigo, setCodigo] = useState("")
	const [telefono, setTelefono] = useState("")
	const [validacion, setValidacion] = useState<Validacion>(null)
	const [validando, setValidando] = useState(false)
	const [msg, setMsg] = useState("")

	// Selección múltiple para marcar en lote
	const [sel, setSel] = useState<Set<string>>(new Set())
	const [marcandoLote, setMarcandoLote] = useState(false)
	const [msgLote, setMsgLote] = useState("")

	// Solo se pueden marcar los disponibles (no usados y no vencidos).
	const elegibles = registros.filter((r) => !r.usado && !r.vencido)
	const todosSeleccionados = elegibles.length > 0 && sel.size === elegibles.length

	function toggleUno(codigo: string) {
		setSel((prev) => {
			const n = new Set(prev)
			n.has(codigo) ? n.delete(codigo) : n.add(codigo)
			return n
		})
	}

	function toggleTodos() {
		setSel(todosSeleccionados ? new Set() : new Set(elegibles.map((r) => r.codigo)))
	}

	async function marcarLote() {
		if (sel.size === 0) return
		setMsgLote("")
		setMarcandoLote(true)
		try {
			const res = await fetch("/api/ruleta/marcar-usados", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ codigos: Array.from(sel) }),
			})
			const data = await res.json()
			if (res.ok) {
				const extra = data.vencidos ? ` (${data.vencidos} vencido/s omitido/s)` : ""
				setMsgLote(`✅ ${data.actualizados} código(s) marcado(s) como usado(s).${extra}`)
				setSel(new Set())
				cargar()
			} else {
				setMsgLote(`❌ ${data.error || "No se pudo marcar."}`)
			}
		} catch {
			setMsgLote("❌ Error de conexión.")
		} finally {
			setMarcandoLote(false)
		}
	}

	async function cargar() {
		setLoading(true)
		try {
			const q = filtro === "todos" ? "" : `?filtro=${filtro}`
			const res = await fetch(`/api/ruleta/listado${q}`)
			const data = await res.json()
			setRegistros(data.registros ?? [])
			setTotales(data.totales ?? {})
		} catch {
			// noop
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		setSel(new Set())
		cargar()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filtro])

	async function validar() {
		setMsg("")
		setValidacion(null)
		const c = codigo.trim().toUpperCase()
		if (!c) return
		setValidando(true)
		try {
			const res = await fetch(`/api/ruleta/validar?codigo=${encodeURIComponent(c)}`)
			const data = await res.json()
			setValidacion(data)
		} catch {
			setMsg("Error al validar.")
		} finally {
			setValidando(false)
		}
	}

	async function marcarUsado() {
		const c = (validacion?.codigo ?? codigo).trim().toUpperCase()
		if (!c) return
		setMsg("")
		try {
			const res = await fetch("/api/ruleta/marcar-usado", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ codigo: c, telefono: telefono.trim() || null }),
			})
			const data = await res.json()
			if (res.ok) {
				setMsg("✅ Código marcado como usado.")
				setValidacion((v) => (v ? { ...v, usado: true } : v))
				cargar()
			} else {
				setMsg(`❌ ${data.error || "No se pudo marcar."}`)
			}
		} catch {
			setMsg("❌ Error de conexión.")
		}
	}

	return (
		<div className="px-8 py-8 max-w-5xl mx-auto">
			<h1 className="text-xl font-bold text-black mb-1">Ruleta de descuentos</h1>
			<p className="text-[13px] text-[#6c6e78] mb-6">
				Valida los códigos y revisa los descuentos generados.
			</p>

			{/* Resumen */}
			<div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
				<Tarjeta label="Total" valor={totales.total ?? 0} />
				<Tarjeta label="Usados" valor={totales.usados ?? 0} />
				<Tarjeta label="5%" valor={totales.d5 ?? 0} />
				<Tarjeta label="10%" valor={totales.d10 ?? 0} />
				<Tarjeta label="15%" valor={totales.d15 ?? 0} destacado />
			</div>

			{/* Validador del vendedor */}
			<div className="border border-[#ececef] rounded-xl p-5 mb-8">
				<h2 className="text-[15px] font-bold text-black mb-3">
					Validar un código
				</h2>
				<div className="flex flex-col sm:flex-row gap-2">
					<input
						value={codigo}
						onChange={(e) => setCodigo(e.target.value.toUpperCase())}
						onKeyDown={(e) => e.key === "Enter" && validar()}
						placeholder="PARMA-XXXXXX"
						className="flex-1 border border-[#ececef] rounded-lg px-3 py-2.5 text-sm text-black outline-none focus:border-black uppercase"
					/>
					<button
						onClick={validar}
						disabled={validando}
						className="bg-black hover:bg-[#222] text-white font-semibold rounded-lg px-5 py-2.5 text-sm disabled:opacity-50"
					>
						{validando ? "Validando…" : "Validar"}
					</button>
				</div>

				{validacion && !validacion.existe && (
					<p className="mt-3 text-sm text-red-600 font-semibold">
						❌ Código inválido — no existe en el sistema.
					</p>
				)}

				{validacion && validacion.existe && (
					<div className="mt-4 bg-[#f8f8f9] rounded-lg p-4">
						<div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
							<span>
								<strong>Descuento:</strong> {validacion.descuento}%
							</span>
							<span>
								<strong>Correo:</strong> {validacion.correo}
							</span>
							<span>
								<strong>Estado:</strong>{" "}
								{validacion.usado ? (
									<span className="text-red-600 font-semibold">Ya usado</span>
								) : validacion.vencido ? (
									<span className="text-orange-600 font-semibold">
										Vencido (no es de hoy)
									</span>
								) : (
									<span className="text-green-600 font-semibold">
										Disponible
									</span>
								)}
							</span>
						</div>

						{!validacion.usado && !validacion.vencido && (
							<div className="mt-3 flex flex-col sm:flex-row gap-2">
								<input
									value={telefono}
									onChange={(e) => setTelefono(e.target.value)}
									placeholder="Teléfono del cliente (opcional)"
									className="flex-1 border border-[#ececef] rounded-lg px-3 py-2.5 text-sm text-black outline-none focus:border-black"
								/>
								<button
									onClick={marcarUsado}
									className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-5 py-2.5 text-sm"
								>
									Marcar como usado
								</button>
							</div>
						)}
					</div>
				)}

				{msg && <p className="mt-3 text-sm">{msg}</p>}
			</div>

			{/* Tabla */}
			<div className="flex items-center justify-between mb-3">
				<h2 className="text-[15px] font-bold text-black">Descuentos por correo</h2>
				<div className="flex gap-1">
					{(["todos", "no-usados", "usados"] as const).map((f) => (
						<button
							key={f}
							onClick={() => setFiltro(f)}
							className={`text-[12px] font-semibold rounded-full px-3 py-1.5 transition-colors ${
								filtro === f
									? "bg-black text-white"
									: "bg-[#f0f0f2] text-[#6c6e78] hover:bg-[#e6e6e9]"
							}`}
						>
							{f === "todos" ? "Todos" : f === "usados" ? "Usados" : "No usados"}
						</button>
					))}
				</div>
			</div>

			{/* Barra de acción en lote */}
			{sel.size > 0 && (
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#eef1f9] border border-[#16255c] rounded-xl px-4 py-3 mb-3">
					<span className="text-sm font-semibold text-[#16255c]">
						{sel.size} seleccionado{sel.size > 1 ? "s" : ""}
					</span>
					<div className="flex items-center gap-2">
						<button
							onClick={() => setSel(new Set())}
							className="text-[13px] font-semibold text-[#6c6e78] hover:text-black px-3 py-2"
						>
							Cancelar
						</button>
						<button
							onClick={marcarLote}
							disabled={marcandoLote}
							className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-5 py-2.5 text-sm disabled:opacity-50"
						>
							{marcandoLote
								? "Marcando…"
								: `Marcar ${sel.size} como usado${sel.size > 1 ? "s" : ""}`}
						</button>
					</div>
				</div>
			)}
			{msgLote && <p className="mb-3 text-sm">{msgLote}</p>}

			<div className="border border-[#ececef] rounded-xl overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="text-left text-[12px] text-[#6c6e78] border-b border-[#ececef]">
							<th className="px-4 py-3 font-semibold w-10">
								<input
									type="checkbox"
									checked={todosSeleccionados}
									onChange={toggleTodos}
									disabled={elegibles.length === 0}
									className="w-4 h-4 accent-[#16255c] cursor-pointer"
									aria-label="Seleccionar todos"
								/>
							</th>
							<th className="px-4 py-3 font-semibold">Correo</th>
							<th className="px-4 py-3 font-semibold">Código</th>
							<th className="px-4 py-3 font-semibold">Desc.</th>
							<th className="px-4 py-3 font-semibold">Estado</th>
							<th className="px-4 py-3 font-semibold">Teléfono</th>
							<th className="px-4 py-3 font-semibold">Fecha</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td colSpan={7} className="px-4 py-8 text-center text-[#9a9ba3]">
									Cargando…
								</td>
							</tr>
						) : registros.length === 0 ? (
							<tr>
								<td colSpan={7} className="px-4 py-8 text-center text-[#9a9ba3]">
									Aún no hay participantes.
								</td>
							</tr>
						) : (
							registros.map((r) => {
								const seleccionable = !r.usado && !r.vencido
								return (
								<tr key={r.id} className={`border-b border-[#f2f2f4] last:border-0 ${sel.has(r.codigo) ? "bg-[#eef1f9]" : ""}`}>
									<td className="px-4 py-3">
										<input
											type="checkbox"
											checked={sel.has(r.codigo)}
											onChange={() => toggleUno(r.codigo)}
											disabled={!seleccionable}
											className="w-4 h-4 accent-[#16255c] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
											aria-label={`Seleccionar ${r.codigo}`}
										/>
									</td>
									<td className="px-4 py-3 text-black">{r.correo}</td>
									<td className="px-4 py-3 font-mono text-black">{r.codigo}</td>
									<td className="px-4 py-3 font-semibold text-black">
										{r.descuento}%
									</td>
									<td className="px-4 py-3">
										{r.usado ? (
											<span className="text-red-600 font-semibold">Usado</span>
										) : r.vencido ? (
											<span className="text-orange-600 font-semibold">
												Vencido
											</span>
										) : (
											<span className="text-green-600 font-semibold">
												Disponible
											</span>
										)}
									</td>
									<td className="px-4 py-3 text-[#6c6e78]">{r.telefono ?? "—"}</td>
									<td className="px-4 py-3 text-[#6c6e78]">{fecha(r.createdAt)}</td>
								</tr>
								)
							})
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}

function Tarjeta({
	label,
	valor,
	destacado,
}: {
	label: string
	valor: number
	destacado?: boolean
}) {
	return (
		<div
			className={`rounded-xl border p-4 ${
				destacado ? "border-[#16255c] bg-[#eef1f9]" : "border-[#ececef] bg-white"
			}`}
		>
			<div className="text-[12px] text-[#6c6e78]">{label}</div>
			<div className="text-2xl font-bold text-black">{valor}</div>
		</div>
	)
}
