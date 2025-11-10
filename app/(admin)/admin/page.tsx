"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Eye, EyeOff } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminDashboardPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [showHidden, setShowHidden] = useState(false)
	const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())
	const [localData, setLocalData] = useState<any[] | null>(null)
	const { data, mutate, isLoading, error } = useSWR(
		`/api/perfumes?includeInactive=true`, 
		fetcher
	)
	
	// Sincronizar localData con data de SWR
	useEffect(() => {
		if (data) {
			setLocalData(data)
		}
	}, [data])
	
	// Usar localData si está disponible, sino usar data
	const displayData = localData ?? data ?? []

	async function handleDelete(id: string) {
		if (!confirm("¿Eliminar este perfume?")) return
		const res = await fetch(`/api/perfumes/${id}`, { method: "DELETE" })
		if (res.ok) mutate()
		else alert(await res.text())
	}

	async function handleToggleActive(id: string, currentActive: boolean) {
		// Prevenir múltiples clics
		if (togglingIds.has(id)) return
		
		// Agregar ID a la lista de elementos que se están actualizando
		setTogglingIds(prev => new Set(prev).add(id))
		
		// Actualizar el estado local INMEDIATAMENTE (sin esperar al servidor)
		const newActive = !currentActive
		setLocalData(prev => {
			if (!prev) return prev
			return prev.map((p: any) => 
				p.id === id ? { ...p, activo: newActive } : p
			)
		})
		
		// Enviar la petición al servidor en segundo plano
		fetch("/api/perfumes", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id, activo: newActive })
		})
		.then(async (res) => {
			if (!res.ok) {
				const errorText = await res.text()
				console.error("Error en PATCH:", errorText)
				// Si falla, revertir el cambio local
				setLocalData(prev => {
					if (!prev) return prev
					return prev.map((p: any) => 
						p.id === id ? { ...p, activo: currentActive } : p
					)
				})
				alert(`Error al cambiar el estado del perfume: ${errorText}`)
			} else {
				// Si tiene éxito, revalidar los datos del servidor en segundo plano
				mutate()
			}
		})
		.catch((error: any) => {
			console.error("Error al cambiar estado:", error)
			// Si hay un error, revertir el cambio local
			setLocalData(prev => {
				if (!prev) return prev
				return prev.map((p: any) => 
					p.id === id ? { ...p, activo: currentActive } : p
				)
			})
			alert(`Error al cambiar el estado del perfume: ${error?.message || "Error desconocido"}`)
		})
		.finally(() => {
			// Remover el ID de la lista de elementos que se están actualizando
			setTogglingIds(prev => {
				const newSet = new Set(prev)
				newSet.delete(id)
				return newSet
			})
		})
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
				<h1 className="text-2xl font-bold">Perfumes</h1>
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
							<th className="px-4 py-2 text-left">Stock</th>
							<th className="px-4 py-2 text-left">Estado</th>
							<th className="px-4 py-2 text-right">Acciones</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr><td className="px-4 py-6" colSpan={4}>Cargando...</td></tr>
						) : error ? (
							<tr><td className="px-4 py-6 text-red-500" colSpan={4}>Error al cargar</td></tr>
						) : filteredPerfumes.length === 0 ? (
							<tr>
								<td className="px-4 py-6 text-muted-foreground" colSpan={4}>
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
