"use client"

import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Eye, EyeOff, Pencil, Check, X } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminDashboardPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [showHidden, setShowHidden] = useState(false)
	const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())
	const [editingSku, setEditingSku] = useState<string | null>(null)
	const [skuValue, setSkuValue] = useState("")
	const { data, mutate, isLoading, error } = useSWR(
		`/api/perfumes?includeInactive=true`, 
		fetcher
	)
	
	const displayData = data ?? []

	async function handleDelete(id: string) {
		if (!confirm("¿Eliminar este perfume?")) return
		const res = await fetch(`/api/perfumes/${id}`, { method: "DELETE" })
		if (res.ok) mutate()
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

	async function handleSaveSku(id: string) {
		const newSku = skuValue.trim() || null
		const optimisticData = data?.map((p: any) =>
			p.id === id ? { ...p, sku: newSku } : p
		)
		setEditingSku(null)
		try {
			await mutate(
				async () => {
					const res = await fetch("/api/perfumes", {
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ id, sku: newSku }),
					})
					if (!res.ok) throw new Error(await res.text())
					return optimisticData
				},
				{ optimisticData, rollbackOnError: true, revalidate: false }
			)
		} catch (error: any) {
			alert(`Error al guardar SKU: ${error?.message || "Error desconocido"}`)
		}
	}

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
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">
					Perfumes {!isLoading && <span className="text-lg text-gray-500 font-normal">({filteredPerfumes.length})</span>}
				</h1>
				<Button asChild>
					<Link href="/perfumes/new">Agregar perfume</Link>
				</Button>
			</div>

			{/* Barra de búsqueda y filtros */}
			<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
				{/* Búsqueda */}
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
					<input
						type="text"
						placeholder="Buscar perfumes..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
					/>
				</div>

				{/* Toggle para ver ocultos */}
				<div className="flex items-center gap-2">
					<button
						onClick={() => setShowHidden(!showHidden)}
						className={`px-4 py-2 rounded-lg border transition-colors ${
							showHidden
								? "bg-gray-800 text-white border-gray-800"
								: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
						}`}
					>
						{showHidden ? (
							<span className="flex items-center gap-2">
								<EyeOff className="h-4 w-4" />
								Ver Ocultos
							</span>
						) : (
							<span className="flex items-center gap-2">
								<Eye className="h-4 w-4" />
								Ver Activos
							</span>
						)}
					</button>
				</div>
			</div>

			{/* Tabla de perfumes */}
			<div className="overflow-x-auto border rounded-lg">
				<table className="min-w-full text-sm">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-4 py-2 text-left">Nombre</th>
							<th className="px-4 py-2 text-left">SKU</th>
							<th className="px-4 py-2 text-left">Stock</th>
							<th className="px-4 py-2 text-left">Estado</th>
							<th className="px-4 py-2 text-right">Acciones</th>
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
									{searchQuery.trim() !== "" 
										? `No se encontraron perfumes que coincidan con "${searchQuery}"`
										: showHidden
											? "No hay perfumes ocultos"
											: "No hay perfumes activos"}
								</td>
							</tr>
						) : (
							filteredPerfumes.map((p: any) => (
								<tr key={p.id} className={`border-t ${!p.activo ? "bg-gray-50 opacity-75" : ""}`}>
									<td className="px-4 py-2">
										<span className={!p.activo ? "text-gray-500" : ""}>{p.nombre}</span>
									</td>
									<td className="px-4 py-2">
										{editingSku === p.id ? (
											<div className="flex items-center gap-1">
												<input
													type="text"
													value={skuValue}
													onChange={(e) => setSkuValue(e.target.value)}
													onKeyDown={(e) => {
														if (e.key === "Enter") handleSaveSku(p.id)
														if (e.key === "Escape") setEditingSku(null)
													}}
													className="border rounded px-2 py-1 text-xs font-mono w-24 focus:outline-none focus:ring-1 focus:ring-blue-500"
													autoFocus
													placeholder="PF-001"
												/>
												<button onClick={() => handleSaveSku(p.id)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Guardar">
													<Check className="h-3.5 w-3.5" />
												</button>
												<button onClick={() => setEditingSku(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded" title="Cancelar">
													<X className="h-3.5 w-3.5" />
												</button>
											</div>
										) : (
											<button
												onClick={() => { setEditingSku(p.id); setSkuValue(p.sku || "") }}
												className="flex items-center gap-1.5 group"
												title="Editar SKU"
											>
												<span className={`font-mono text-xs font-semibold ${!p.activo ? "text-gray-400" : "text-gray-900"}`}>{p.sku || "—"}</span>
												<Pencil className="h-3 w-3 text-gray-300 group-hover:text-blue-500 transition-colors" />
											</button>
										)}
									</td>
									<td className="px-4 py-2">
										<span className={!p.activo ? "text-gray-500" : ""}>{p.stock}</span>
									</td>
									<td className="px-4 py-2">
										<span className={`px-3 py-1 rounded text-xs font-medium ${
											p.activo
												? "bg-green-100 text-green-700"
												: "bg-gray-200 text-gray-600"
										}`}>
											{p.activo ? "Visible" : "Oculto"}
										</span>
									</td>
									<td className="px-4 py-2">
										<div className="flex gap-2 justify-end items-center">
											<button
												onClick={() => handleToggleActive(p.id, p.activo)}
												disabled={togglingIds.has(p.id)}
												className={`p-2 rounded transition-colors ${
													togglingIds.has(p.id)
														? "opacity-50 cursor-not-allowed"
														: p.activo
														? "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
														: "text-blue-600 hover:bg-blue-50 hover:text-blue-800"
												}`}
												title={p.activo ? "Ocultar perfume" : "Mostrar perfume"}
												aria-label={p.activo ? "Ocultar perfume" : "Mostrar perfume"}
											>
												{p.activo ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</button>
											<Link 
												className="underline text-blue-600 hover:text-blue-800 px-2 py-1" 
												href={`/perfumes/${p.id}/edit`}
											>
												Editar
											</Link>
											<button 
												className="text-red-600 underline hover:text-red-800 px-2 py-1" 
												onClick={() => handleDelete(p.id)}
											>
												Eliminar
											</button>
										</div>
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
