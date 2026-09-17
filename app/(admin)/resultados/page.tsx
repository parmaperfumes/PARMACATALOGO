"use client"

import { useEffect, useState } from "react"

type Registro = {
	id: string
	codigo: string
	correo: string
	descuento: number
	premio: string | null
	juego: string
	usado: boolean
	vencido: boolean
	usadoEn: string | null
	createdAt: string
}

const MS_VALIDEZ = 24 * 60 * 60 * 1000

function msRestantes(createdAt: string, now: number): number {
	return new Date(createdAt).getTime() + MS_VALIDEZ - now
}
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

const JUEGO_LABEL: Record<string, string> = {
	ruleta: "Ruleta",
	sopa: "Sopa de letras",
	crucigrama: "Crucigrama",
}
const JUEGO_COLOR: Record<string, string> = {
	ruleta: "bg-[#eef1f9] text-[#16255c]",
	sopa: "bg-[#e4f7ec] text-[#1e9e57]",
	crucigrama: "bg-[#fdf0e6] text-[#b8620f]",
}

export default function ResultadosPage() {
	const [registros, setRegistros] = useState<Registro[]>([])
	const [juego, setJuego] = useState("todos")
	const [loading, setLoading] = useState(true)
	const [verificando, setVerificando] = useState<string | null>(null)

	const [now, setNow] = useState(() => Date.now())
	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), 1000)
		return () => clearInterval(id)
	}, [])

	async function cargar() {
		setLoading(true)
		try {
			const q = juego === "todos" ? "" : `?juego=${juego}`
			const res = await fetch(`/api/juegos/resultados${q}`)
			const data = await res.json()
			setRegistros(data.registros ?? [])
		} catch {
			// noop
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		cargar()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [juego])

	async function verificar(cod: string) {
		const c = cod.trim().toUpperCase()
		if (!c) return
		setVerificando(c)
		try {
			const res = await fetch("/api/ruleta/marcar-usado", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ codigo: c }),
			})
			if (res.ok) cargar()
		} catch {
			// noop
		} finally {
			setVerificando(null)
		}
	}

	function estadoFila(r: Registro): "usado" | "finalizado" | "disponible" {
		if (r.usado) return "usado"
		if (msRestantes(r.createdAt, now) <= 0) return "finalizado"
		return "disponible"
	}

	const disponibles = registros.filter((r) => estadoFila(r) === "disponible").length

	return (
		<div className="px-8 py-8 max-w-6xl mx-auto">
			<div className="flex items-center gap-2 text-[12px] text-[#9a9ba3] mb-1">
				<a href="/juegos" className="hover:text-black">Juegos</a>
				<span>/</span>
				<span className="text-[#6c6e78]">Resultados</span>
			</div>
			<h1 className="text-xl font-bold text-black mb-1">Resultados de los juegos</h1>
			<p className="text-[13px] text-[#6c6e78] mb-6">
				Códigos ganados por los clientes. Verifica y marca los que ya se usaron.
			</p>

			{/* Filtro por juego */}
			<div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
				<div className="flex gap-1">
					{(["todos", "ruleta", "sopa", "crucigrama"] as const).map((j) => (
						<button
							key={j}
							onClick={() => setJuego(j)}
							className={`text-[12px] font-semibold rounded-full px-3 py-1.5 transition-colors ${
								juego === j ? "bg-black text-white" : "bg-[#f0f0f2] text-[#6c6e78] hover:bg-[#e6e6e9]"
							}`}
						>
							{j === "todos" ? "Todos" : JUEGO_LABEL[j]}
						</button>
					))}
				</div>
				<span className="text-[12px] text-[#6c6e78]">
					<strong className="text-green-600">{disponibles}</strong> disponible{disponibles === 1 ? "" : "s"}
				</span>
			</div>

			<div className="border border-[#ececef] rounded-xl overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="text-left text-[12px] text-[#6c6e78] border-b border-[#ececef]">
							<th className="px-4 py-3 font-semibold">Correo</th>
							<th className="px-4 py-3 font-semibold">Código</th>
							<th className="px-4 py-3 font-semibold">Juego</th>
							<th className="px-4 py-3 font-semibold">Premio</th>
							<th className="px-4 py-3 font-semibold">Vence en</th>
							<th className="px-4 py-3 font-semibold">Estado</th>
							<th className="px-4 py-3 font-semibold">Fecha</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td colSpan={7} className="px-4 py-8 text-center text-[#9a9ba3]">Cargando…</td></tr>
						) : registros.length === 0 ? (
							<tr><td colSpan={7} className="px-4 py-8 text-center text-[#9a9ba3]">Aún no hay resultados.</td></tr>
						) : (
							registros.map((r) => {
								const estado = estadoFila(r)
								const restante = msRestantes(r.createdAt, now)
								const premioTxt = r.premio && r.premio.trim() ? r.premio : `${r.descuento}%`
								return (
									<tr key={r.id} className="border-b border-[#f2f2f4] last:border-0">
										<td className="px-4 py-3 text-black">{r.correo}</td>
										<td className="px-4 py-3 font-mono text-black">{r.codigo}</td>
										<td className="px-4 py-3">
											<span className={`inline-block text-[11px] font-semibold rounded-full px-2.5 py-1 ${JUEGO_COLOR[r.juego] ?? "bg-[#f0f0f2] text-[#6c6e78]"}`}>
												{JUEGO_LABEL[r.juego] ?? r.juego}
											</span>
										</td>
										<td className="px-4 py-3 font-semibold text-black">{premioTxt}</td>
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
														{verificando === r.codigo ? "Marcando…" : "Marcar usado"}
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
