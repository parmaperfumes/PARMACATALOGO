"use client"

import { useEffect, useState } from "react"

type Registro = {
	id: string
	codigo: string
	correo: string
	descuento: number
	usado: boolean
	vencido: boolean
	usadoEn: string | null
	createdAt: string
}

type Totales = {
	total?: number
	disponibles?: number
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
	createdAt?: string
} | null

// 24 horas de validez desde la creación.
const MS_VALIDEZ = 24 * 60 * 60 * 1000

function msRestantes(createdAt: string, now: number): number {
	return new Date(createdAt).getTime() + MS_VALIDEZ - now
}

// "23h 05m 12s" — o null si ya venció.
function formatoRestante(ms: number): string | null {
	if (ms <= 0) return null
	const s = Math.floor(ms / 1000)
	const h = Math.floor(s / 3600)
	const m = Math.floor((s % 3600) / 60)
	const sec = s % 60
	return `${h}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`
}

function fecha(s: string | null) {
	if (!s) return "—"
	try {
		return new Date(s).toLocaleString("es-DO", { dateStyle: "short", timeStyle: "short" })
	} catch {
		return s
	}
}

export default function RuletaAdminPage() {
	const [registros, setRegistros] = useState<Registro[]>([])
	const [totales, setTotales] = useState<Totales>({})
	const [porDia, setPorDia] = useState<Array<{ dia: string; n: number }>>([])
	const [filtro, setFiltro] = useState<"todos" | "usados" | "no-usados">("todos")
	const [loading, setLoading] = useState(true)

	// Reloj que avanza cada segundo para la cuenta regresiva.
	const [now, setNow] = useState(() => Date.now())
	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), 1000)
		return () => clearInterval(id)
	}, [])

	// Validador
	const [codigo, setCodigo] = useState("")
	const [validacion, setValidacion] = useState<Validacion>(null)
	const [validando, setValidando] = useState(false)
	const [msg, setMsg] = useState("")

	// Estado de "Verificar" por fila
	const [verificando, setVerificando] = useState<string | null>(null)

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
		cargar()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filtro])

	// Códigos por día (se refresca cada 60s para ver los que van entrando).
	async function cargarStats() {
		try {
			const res = await fetch("/api/ruleta/stats")
			const data = await res.json()
			setPorDia(data.porDia ?? [])
		} catch {
			// noop
		}
	}
	useEffect(() => {
		cargarStats()
		const id = setInterval(cargarStats, 60000)
		return () => clearInterval(id)
	}, [])

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

	// Marca (verifica y quema) un código como usado.
	async function verificar(cod: string, desdeValidador = false) {
		const c = cod.trim().toUpperCase()
		if (!c) return
		setVerificando(c)
		if (desdeValidador) setMsg("")
		try {
			const res = await fetch("/api/ruleta/marcar-usado", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ codigo: c }),
			})
			const data = await res.json()
			if (res.ok) {
				if (desdeValidador) {
					setMsg("✅ Código verificado y marcado como usado.")
					setValidacion((v) => (v ? { ...v, usado: true } : v))
				}
				cargar()
			} else if (desdeValidador) {
				setMsg(`❌ ${data.error || "No se pudo verificar."}`)
			}
		} catch {
			if (desdeValidador) setMsg("❌ Error de conexión.")
		} finally {
			setVerificando(null)
		}
	}

	// Estado calculado de una fila teniendo en cuenta el reloj en vivo.
	function estadoFila(r: Registro): "usado" | "finalizado" | "disponible" {
		if (r.usado) return "usado"
		if (msRestantes(r.createdAt, now) <= 0) return "finalizado"
		return "disponible"
	}

	return (
		<div className="px-8 py-8 max-w-5xl mx-auto">
			<h1 className="text-xl font-bold text-black mb-1">Ruleta de descuentos</h1>
			<p className="text-[13px] text-[#6c6e78] mb-6">
				Verifica los códigos de los clientes. Cada código vale por 24 horas.
			</p>

			{/* Resumen */}
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
				<Tarjeta label="Total" valor={totales.total ?? 0} />
				<Tarjeta label="Disponibles" valor={totales.disponibles ?? 0} destacado />
				<Tarjeta label="Usados" valor={totales.usados ?? 0} />
				<Tarjeta label="5%" valor={totales.d5 ?? 0} />
				<Tarjeta label="10%" valor={totales.d10 ?? 0} />
				<Tarjeta label="15%" valor={totales.d15 ?? 0} />
			</div>

			{/* Códigos por día */}
			<div className="border border-[#ececef] rounded-xl p-5 mb-8">
				<h2 className="text-[15px] font-bold text-black mb-4">Códigos por día</h2>
				{porDia.length === 0 ? (
					<p className="text-[13px] text-[#9a9ba3]">Aún no hay datos.</p>
				) : (
					(() => {
						const maxN = Math.max(1, ...porDia.map((d) => d.n))
						const hoyRD = new Intl.DateTimeFormat("en-CA", {
							timeZone: "America/Santo_Domingo",
						}).format(new Date())
						const etiquetaDia = (dia: string) => {
							if (dia === hoyRD) return "Hoy"
							try {
								return new Date(dia + "T12:00:00").toLocaleDateString("es-DO", {
									day: "2-digit",
									month: "short",
								})
							} catch {
								return dia
							}
						}
						return (
							<div className="flex items-end gap-3 overflow-x-auto pb-1">
								{[...porDia].reverse().map((d) => (
									<div key={d.dia} className="flex flex-col items-center gap-1 min-w-[42px]">
										<span className="text-[12px] font-bold text-black tabular-nums">{d.n}</span>
										<div
											className="w-7 rounded-t bg-[#16255c]"
											style={{ height: `${Math.max(4, Math.round((d.n / maxN) * 90))}px` }}
										/>
										<span className="text-[10px] text-[#6c6e78] whitespace-nowrap">
											{etiquetaDia(d.dia)}
										</span>
									</div>
								))}
							</div>
						)
					})()
				)}
			</div>

			{/* Validador del vendedor */}
			<div className="border border-[#ececef] rounded-xl p-5 mb-8">
				<h2 className="text-[15px] font-bold text-black mb-3">Validar un código</h2>
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
						{validando ? "Buscando…" : "Buscar"}
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
							<span><strong>Descuento:</strong> {validacion.descuento}%</span>
							<span><strong>Correo:</strong> {validacion.correo}</span>
							<span>
								<strong>Estado:</strong>{" "}
								{validacion.usado ? (
									<span className="text-red-600 font-semibold">Ya usado</span>
								) : validacion.createdAt && msRestantes(validacion.createdAt, now) <= 0 ? (
									<span className="text-[#6c6e78] font-semibold">Finalizado</span>
								) : (
									<span className="text-green-600 font-semibold">Disponible</span>
								)}
							</span>
							{!validacion.usado &&
								validacion.createdAt &&
								msRestantes(validacion.createdAt, now) > 0 && (
									<span className="text-[#6c6e78]">
										⏳ Vence en {formatoRestante(msRestantes(validacion.createdAt, now))}
									</span>
								)}
						</div>

						{!validacion.usado &&
							validacion.createdAt &&
							msRestantes(validacion.createdAt, now) > 0 && (
								<div className="mt-3">
									<button
										onClick={() => verificar(validacion.codigo!, true)}
										disabled={verificando === validacion.codigo}
										className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-5 py-2.5 text-sm disabled:opacity-50"
									>
										{verificando === validacion.codigo ? "Verificando…" : "Verificar"}
									</button>
								</div>
							)}
					</div>
				)}

				{msg && <p className="mt-3 text-sm">{msg}</p>}
			</div>

			{/* Tabla */}
			<div className="flex items-center justify-between mb-3">
				<h2 className="text-[15px] font-bold text-black">Códigos generados</h2>
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

			<div className="border border-[#ececef] rounded-xl overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="text-left text-[12px] text-[#6c6e78] border-b border-[#ececef]">
							<th className="px-4 py-3 font-semibold">Correo</th>
							<th className="px-4 py-3 font-semibold">Código</th>
							<th className="px-4 py-3 font-semibold">Desc.</th>
							<th className="px-4 py-3 font-semibold">Vence en</th>
							<th className="px-4 py-3 font-semibold">Estado</th>
							<th className="px-4 py-3 font-semibold">Fecha</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td colSpan={6} className="px-4 py-8 text-center text-[#9a9ba3]">Cargando…</td>
							</tr>
						) : registros.length === 0 ? (
							<tr>
								<td colSpan={6} className="px-4 py-8 text-center text-[#9a9ba3]">Aún no hay participantes.</td>
							</tr>
						) : (
							registros.map((r) => {
								const estado = estadoFila(r)
								const restante = msRestantes(r.createdAt, now)
								return (
									<tr key={r.id} className="border-b border-[#f2f2f4] last:border-0">
										<td className="px-4 py-3 text-black">{r.correo}</td>
										<td className="px-4 py-3 font-mono text-black">{r.codigo}</td>
										<td className="px-4 py-3 font-semibold text-black">{r.descuento}%</td>
										<td className="px-4 py-3 text-[#6c6e78] whitespace-nowrap tabular-nums">
											{estado === "disponible" ? formatoRestante(restante) : "—"}
										</td>
										<td className="px-4 py-3">
											{estado === "usado" ? (
												<span className="text-red-600 font-semibold">Usado</span>
											) : estado === "finalizado" ? (
												<span className="text-[#6c6e78] font-semibold">Finalizado</span>
											) : (
												<div className="flex items-center gap-3">
													<span className="text-green-600 font-semibold">Disponible</span>
													<button
														onClick={() => verificar(r.codigo)}
														disabled={verificando === r.codigo}
														className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-3.5 py-1.5 text-[12px] disabled:opacity-50"
													>
														{verificando === r.codigo ? "Verificando…" : "Verificar"}
													</button>
												</div>
											)}
										</td>
										<td className="px-4 py-3 text-[#6c6e78] whitespace-nowrap">{fecha(r.createdAt)}</td>
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

function Tarjeta({ label, valor, destacado }: { label: string; valor: number; destacado?: boolean }) {
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
