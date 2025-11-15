"use client"

import { useEffect, useState } from "react"
import { BarChart3, Smartphone, Monitor, Globe, Calendar, Eye } from "lucide-react"

interface Estadisticas {
	totalVisitas: number
	visitasPorDia: Record<string, number>
	visitasPorDispositivo: Record<string, number>
	visitasPorPagina: Record<string, number>
	visitasPorPais: Record<string, number>
	visitasRecientes: Array<{
		id: string
		path: string
		dispositivo: string
		pais: string | null
		ciudad: string | null
		createdAt: string
	}>
}

export default function EstadisticasPage() {
	const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState("")
	const [diasSeleccionados, setDiasSeleccionados] = useState(30)

	useEffect(() => {
		cargarEstadisticas()
	}, [diasSeleccionados])

	const cargarEstadisticas = async () => {
		setIsLoading(true)
		setError("")
		try {
			const response = await fetch(`/api/visitas?dias=${diasSeleccionados}`)
			const data = await response.json()
			
			if (data.success) {
				setEstadisticas(data)
			} else {
				setError("Error al cargar estadísticas")
			}
		} catch (err) {
			setError("Error de conexión")
		} finally {
			setIsLoading(false)
		}
	}

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-2xl font-bold mb-6">Estadísticas de Visitas</h1>
				<p className="text-gray-500">Cargando...</p>
			</div>
		)
	}

	if (error || !estadisticas) {
		return (
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-2xl font-bold mb-6">Estadísticas de Visitas</h1>
				<p className="text-red-500">{error || "No se pudieron cargar las estadísticas"}</p>
			</div>
		)
	}

	const obtenerPorcentaje = (valor: number) => {
		return ((valor / estadisticas.totalVisitas) * 100).toFixed(1)
	}

	const formatearFecha = (fecha: string) => {
		return new Date(fecha).toLocaleDateString("es-ES", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		})
	}

	const formatearFechaHora = (fecha: string) => {
		return new Date(fecha).toLocaleString("es-ES", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		})
	}

	return (
		<div className="container mx-auto px-4 py-8 space-y-6">
			{/* Header con selector de período */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-2xl font-bold">Estadísticas de Visitas</h1>
				<div className="flex gap-2">
					{[7, 15, 30, 60, 90].map((dias) => (
						<button
							key={dias}
							onClick={() => setDiasSeleccionados(dias)}
							className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
								diasSeleccionados === dias
									? "bg-green-600 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							{dias} días
						</button>
					))}
				</div>
			</div>

			{/* Tarjetas de resumen */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Total de visitas */}
				<div className="bg-white border rounded-lg p-6 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500 mb-1">Total de Visitas</p>
							<p className="text-3xl font-bold">{estadisticas.totalVisitas}</p>
						</div>
						<Eye className="h-10 w-10 text-green-600" />
					</div>
				</div>

				{/* Visitas móvil */}
				<div className="bg-white border rounded-lg p-6 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500 mb-1">Móvil</p>
							<p className="text-3xl font-bold">
								{estadisticas.visitasPorDispositivo["mobile"] || 0}
							</p>
							<p className="text-xs text-gray-400 mt-1">
								{obtenerPorcentaje(estadisticas.visitasPorDispositivo["mobile"] || 0)}%
							</p>
						</div>
						<Smartphone className="h-10 w-10 text-blue-600" />
					</div>
				</div>

				{/* Visitas desktop */}
				<div className="bg-white border rounded-lg p-6 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500 mb-1">Desktop</p>
							<p className="text-3xl font-bold">
								{estadisticas.visitasPorDispositivo["desktop"] || 0}
							</p>
							<p className="text-xs text-gray-400 mt-1">
								{obtenerPorcentaje(estadisticas.visitasPorDispositivo["desktop"] || 0)}%
							</p>
						</div>
						<Monitor className="h-10 w-10 text-purple-600" />
					</div>
				</div>

				{/* Países únicos */}
				<div className="bg-white border rounded-lg p-6 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500 mb-1">Países</p>
							<p className="text-3xl font-bold">
								{Object.keys(estadisticas.visitasPorPais).length}
							</p>
						</div>
						<Globe className="h-10 w-10 text-orange-600" />
					</div>
				</div>
			</div>

			{/* Gráfico de visitas por día */}
			<div className="bg-white border rounded-lg p-6 shadow-sm">
				<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
					<BarChart3 className="h-5 w-5" />
					Visitas por Día
				</h2>
				<div className="space-y-2">
					{Object.entries(estadisticas.visitasPorDia)
						.sort(([a], [b]) => b.localeCompare(a))
						.slice(0, 15)
						.map(([fecha, visitas]) => {
							const porcentaje = (visitas / estadisticas.totalVisitas) * 100
							return (
								<div key={fecha} className="flex items-center gap-3">
									<span className="text-sm text-gray-600 w-24 flex-shrink-0">
										{formatearFecha(fecha)}
									</span>
									<div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
										<div
											className="h-full bg-green-500 flex items-center justify-end pr-2"
											style={{ width: `${Math.max(porcentaje, 5)}%` }}
										>
											<span className="text-white text-sm font-medium">{visitas}</span>
										</div>
									</div>
								</div>
							)
						})}
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Páginas más visitadas */}
				<div className="bg-white border rounded-lg p-6 shadow-sm">
					<h2 className="text-lg font-semibold mb-4">Páginas Más Visitadas</h2>
					<div className="space-y-3">
						{Object.entries(estadisticas.visitasPorPagina)
							.sort(([, a], [, b]) => b - a)
							.slice(0, 10)
							.map(([path, visitas]) => (
								<div key={path} className="flex items-center justify-between">
									<span className="text-sm text-gray-700 truncate flex-1">
										{path === "/" ? "Inicio" : path}
									</span>
									<div className="flex items-center gap-2">
										<span className="text-sm font-medium">{visitas}</span>
										<span className="text-xs text-gray-400">
											({obtenerPorcentaje(visitas)}%)
										</span>
									</div>
								</div>
							))}
					</div>
				</div>

				{/* Visitantes por país */}
				<div className="bg-white border rounded-lg p-6 shadow-sm">
					<h2 className="text-lg font-semibold mb-4">Visitantes por País</h2>
					<div className="space-y-3">
						{Object.entries(estadisticas.visitasPorPais)
							.sort(([, a], [, b]) => b - a)
							.slice(0, 10)
							.map(([pais, visitas]) => (
								<div key={pais} className="flex items-center justify-between">
									<span className="text-sm text-gray-700">{pais}</span>
									<div className="flex items-center gap-2">
										<span className="text-sm font-medium">{visitas}</span>
										<span className="text-xs text-gray-400">
											({obtenerPorcentaje(visitas)}%)
										</span>
									</div>
								</div>
							))}
					</div>
				</div>
			</div>

			{/* Visitas recientes */}
			<div className="bg-white border rounded-lg p-6 shadow-sm">
				<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
					<Calendar className="h-5 w-5" />
					Visitas Recientes
				</h2>
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-2 text-left">Fecha y Hora</th>
								<th className="px-4 py-2 text-left">Página</th>
								<th className="px-4 py-2 text-left">Dispositivo</th>
								<th className="px-4 py-2 text-left">Ubicación</th>
							</tr>
						</thead>
						<tbody>
							{estadisticas.visitasRecientes.map((visita) => (
								<tr key={visita.id} className="border-t">
									<td className="px-4 py-2 text-gray-600">
										{formatearFechaHora(visita.createdAt)}
									</td>
									<td className="px-4 py-2 truncate max-w-xs">
										{visita.path === "/" ? "Inicio" : visita.path}
									</td>
									<td className="px-4 py-2">
										<span className="inline-flex items-center gap-1">
											{visita.dispositivo === "mobile" && <Smartphone className="h-4 w-4" />}
											{visita.dispositivo === "desktop" && <Monitor className="h-4 w-4" />}
											<span className="capitalize">{visita.dispositivo}</span>
										</span>
									</td>
									<td className="px-4 py-2 text-gray-600">
										{visita.ciudad && visita.pais
											? `${visita.ciudad}, ${visita.pais}`
											: visita.pais || "Desconocido"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}


