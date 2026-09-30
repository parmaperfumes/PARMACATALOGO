"use client"

import { useState, useRef, useEffect } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Search, Eye, EyeOff, Pencil } from "lucide-react"

// El panel siempre pide datos frescos: la API deja cachear la lista unos segundos
// (pensado para el catálogo público) y tras eliminar volvía la copia vieja.
const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json())

function SkuEditor({ perfumeId, currentSku, onSaved }: { perfumeId: string; currentSku: string | null; onSaved: (newSku: string | null) => void }) {
	const [editing, setEditing] = useState(false)
	const [val, setVal] = useState(currentSku || "")
	const [saving, setSaving] = useState(false)
	const [justSaved, setJustSaved] = useState(false)
	const valRef = useRef(val)
	valRef.current = val

	useEffect(() => {
		if (!editing) setVal(currentSku || "")
	}, [currentSku, editing])

	async function save(e?: React.MouseEvent) {
		if (e) e.stopPropagation()
		const newSku = valRef.current.trim() || null
		setSaving(true)
		try {
			const res = await fetch("/api/perfumes", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: perfumeId, sku: newSku }),
			})
			if (!res.ok) throw new Error(await res.text())
			setEditing(false)
			setJustSaved(true)
			setTimeout(() => setJustSaved(false), 1500)
			onSaved(newSku)
		} catch (error: any) {
			alert("Error al guardar SKU: " + (error?.message || "Error desconocido"))
		}
		setSaving(false)
	}

	if (editing) {
		return (
			<div className="flex items-center gap-1">
				<input
					type="text"
					value={val}
					onChange={(e) => setVal(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") { e.preventDefault(); save() }
						if (e.key === "Escape") setEditing(false)
					}}
					className="border rounded px-2 py-1 text-sm font-mono font-semibold text-gray-900 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
					autoFocus
					placeholder="PAR-00"
					disabled={saving}
				/>
				<button type="button" onClick={save} disabled={saving} className="p-1.5 text-green-600 hover:bg-green-50 rounded text-base leading-none" title="Guardar">✓</button>
				<button type="button" onClick={() => setEditing(false)} disabled={saving} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded text-base leading-none" title="Cancelar">✕</button>
			</div>
		)
	}

	return (
		<div className="flex items-center gap-1.5">
			{justSaved ? (
				<span className="font-mono text-xs font-semibold text-green-600">Guardado</span>
			) : (
				<span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 rounded-md px-2 py-1">{currentSku || "—"}</span>
			)}
			<button onClick={() => { setVal(currentSku || ""); setEditing(true) }} className="p-1 rounded text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="Editar SKU">
				<Pencil className="h-3 w-3" />
			</button>
		</div>
	)
}

export default function AdminDashboardPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [showHidden, setShowHidden] = useState(false)
	const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())
	const { data, mutate, isLoading, error } = useSWR(
		`/api/perfumes?includeInactive=true`,
		fetcher,
		{ revalidateOnFocus: false }
	)

	const displayData = data ?? []

	async function handleDelete(id: string) {
		if (!confirm("¿Eliminar este perfume?")) return
		const res = await fetch(`/api/perfumes/${id}`, { method: "DELETE" })
		if (res.ok) mutate((actual: any[] | undefined) => actual?.filter((p) => p.id !== id))
		else alert(await res.text())
	}

	async function handleToggleActive(id: string, currentActive: boolean) {
		if (togglingIds.has(id)) return
		
		setTogglingIds(prev => new Set(prev).add(id))
		
		const newActive = !currentActive
		const optimisticData = data?.map((p: any) =>
			p.id === id ? { ...p, activo: newActive } : p
		)

		try {
			await mutate(
				async () => {
					const res = await fetch("/api/perfumes", {
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ id, activo: newActive })
					})
					if (!res.ok) {
						throw new Error(await res.text())
					}
					return optimisticData
				},
				{
					optimisticData,
					rollbackOnError: true,
					revalidate: false,
				}
			)
		} catch (error: any) {
			alert(`Error al cambiar el estado: ${error?.message || "Error desconocido"}`)
		} finally {
			setTogglingIds(prev => {
				const newSet = new Set(prev)
				newSet.delete(id)
				return newSet
			})
		}
	}

	function guardarSkuLocal(id: string, newSku: string | null) {
		mutate((current: any) => current?.map((item: any) => (item.id === id ? { ...item, sku: newSku } : item)), { revalidate: false })
	}

	// Ocultar/mostrar, Editar y Eliminar: igual en la tabla y en las tarjetas del teléfono.
	function acciones(p: any) {
		return (
			<>
				<button
					onClick={() => handleToggleActive(p.id, p.activo)}
					disabled={togglingIds.has(p.id)}
					className={`p-2 rounded-lg border border-[#e3e4e9] bg-white transition-colors ${
						togglingIds.has(p.id)
							? "opacity-50 cursor-not-allowed"
							: p.activo
							? "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
							: "text-blue-600 hover:bg-blue-50 hover:text-blue-800"
					}`}
					title={p.activo ? "Ocultar perfume" : "Mostrar perfume"}
					aria-label={p.activo ? "Ocultar perfume" : "Mostrar perfume"}
				>
					{p.activo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
				</button>
				<Link className="text-blue-600 text-sm font-bold hover:text-blue-800 px-2 py-1" href={`/perfumes/${p.id}/edit`}>
					Editar
				</Link>
				<button className="text-red-600 text-sm font-bold hover:text-red-800 px-2 py-1" onClick={() => handleDelete(p.id)}>
					Eliminar
				</button>
			</>
		)
	}

	function estado(p: any) {
		return (
			<span className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold ${p.activo ? "bg-[#e4f7ec] text-[#1e9e57]" : "bg-gray-100 text-gray-500"}`}>
				{p.activo ? "Visible" : "Oculto"}
			</span>
		)
	}

	const mensajeVacio =
		searchQuery.trim() !== ""
			? `No se encontraron perfumes que coincidan con "${searchQuery}"`
			: showHidden
				? "No hay perfumes ocultos"
				: "No hay perfumes activos"

	// Filtrar perfumes según búsqueda y estado
	const filteredPerfumes = displayData.filter((p: any) => {
		// Filtro por búsqueda
		if (searchQuery.trim() !== "") {
			const searchLower = searchQuery.toLowerCase().trim()
			const nombreLower = p.nombre?.toLowerCase() || ""
			if (!nombreLower.includes(searchLower)) {
				return false
			}
		}
		// Filtro por estado (ocultos/visibles)
		if (showHidden) {
			return !p.activo // Solo mostrar ocultos
		} else {
			return p.activo // Solo mostrar activos
		}
	})

	return (
		<div className="container mx-auto px-4 py-8 space-y-4">
			{/* Header: título + acciones */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-2xl font-bold text-black">
					Perfumes {!isLoading && <span className="text-lg text-gray-400 font-normal">({filteredPerfumes.length})</span>}
				</h1>
				<div className="flex items-center gap-3 w-full sm:w-auto">
					<button
						onClick={() => setShowHidden(!showHidden)}
						className={`flex-1 sm:flex-none justify-center whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
							showHidden
								? "bg-gray-800 text-white border-gray-800"
								: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
						}`}
					>
						{showHidden ? (
							<>
								<EyeOff className="h-4 w-4" />
								Ver ocultos
							</>
						) : (
							<>
								<Eye className="h-4 w-4" />
								Ver activos
							</>
						)}
					</button>
					<Link
						href="/perfumes/new"
						className="flex-1 sm:flex-none justify-center whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold shadow-sm hover:bg-gray-800 transition-colors"
					>
						+ Agregar perfume
					</Link>
				</div>
			</div>

			{/* Buscador */}
			<div className="relative">
				<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
				<input
					type="text"
					placeholder="Buscar perfumes..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full pl-10 pr-4 py-3 bg-white border border-[#e3e4e9] rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent"
				/>
			</div>

			{/* Teléfono: una tarjeta por perfume, sin deslizar hacia los lados */}
			<div className="md:hidden space-y-3">
				{isLoading ? (
					<p className="px-1 py-6 text-sm">Cargando...</p>
				) : error ? (
					<p className="px-1 py-6 text-sm text-red-500">Error al cargar</p>
				) : filteredPerfumes.length === 0 ? (
					<p className="px-1 py-6 text-sm text-muted-foreground">{mensajeVacio}</p>
				) : (
					filteredPerfumes.map((p: any) => (
						<div key={p.id} className={`bg-white border border-[#ececef] rounded-2xl p-4 ${!p.activo ? "opacity-60" : ""}`}>
							<div className="flex items-start justify-between gap-3">
								<span className={`font-semibold leading-snug ${!p.activo ? "text-gray-500" : "text-black"}`}>{p.nombre}</span>
								{estado(p)}
							</div>
							<div className="mt-3 flex items-center justify-between gap-2">
								<SkuEditor perfumeId={p.id} currentSku={p.sku} onSaved={(newSku: string | null) => guardarSkuLocal(p.id, newSku)} />
								<div className="flex items-center gap-1">{acciones(p)}</div>
							</div>
						</div>
					))
				)}
			</div>

			{/* Tabla de perfumes (tablet y computadora) */}
			<div className="hidden md:block overflow-x-auto bg-white border border-[#ececef] rounded-2xl">
				<table className="min-w-full text-sm">
					<thead className="bg-[#fafafa]">
						<tr>
							<th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Nombre</th>
							<th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">SKU</th>
							<th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Stock</th>
							<th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Estado</th>
							<th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">Acciones</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr><td className="px-4 py-6" colSpan={5}>Cargando...</td></tr>
						) : error ? (
							<tr><td className="px-4 py-6 text-red-500" colSpan={5}>Error al cargar</td></tr>
						) : filteredPerfumes.length === 0 ? (
							<tr>
								<td className="px-4 py-6 text-muted-foreground" colSpan={5}>
									{mensajeVacio}
								</td>
							</tr>
						) : (
							filteredPerfumes.map((p: any) => (
								<tr key={p.id} className={`border-t border-[#f1f1f4] hover:bg-[#fafafa] transition-colors ${!p.activo ? "opacity-60" : ""}`}>
									<td className="px-4 py-3">
										<span className={!p.activo ? "text-gray-500" : "text-black"}>{p.nombre}</span>
									</td>
									<td className="px-4 py-3">
										<SkuEditor perfumeId={p.id} currentSku={p.sku} onSaved={(newSku: string | null) => guardarSkuLocal(p.id, newSku)} />
									</td>
									<td className="px-4 py-3">
										<span className={!p.activo ? "text-gray-500" : "text-gray-900"}>{p.stock}</span>
									</td>
									<td className="px-4 py-3">
										{estado(p)}
									</td>
									<td className="px-4 py-3">
										<div className="flex gap-2 justify-end items-center">{acciones(p)}</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}
