"use client"

import { useEffect, useState } from "react"
import { BarChart3, Smartphone, Monitor, Globe, Calendar, Eye, ShoppingCart, XCircle, CheckCircle2, Users, Repeat, Clock } from "lucide-react"

interface Estadisticas {
	totalVisitas: number
	visitantesUnicos: number
	promedioVisitasPorUsuario: string
	tiempoPromedioSegundos: number
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

interface EstadisticasCarrito {
	totalClicksContinuar: number
	totalCarritosAbandonados: number
	itemsPromedioContinuar: string
	itemsPromedioAbandonado: string
	tasaConversion: string
	eventosPorDia: Record<string, { click_continuar: number; carrito_abandonado: number }>
}

export default function EstadisticasPage() {
	const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
	const [estadisticasCarrito, setEstadisticasCarrito] = useState<EstadisticasCarrito | null>(null)
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
			// Cargar estadísticas de visitas y carrito en paralelo
			const [responseVisitas, responseCarrito] = await Promise.all([
				fetch(`/api/visitas?dias=${diasSeleccionados}`),
				fetch(`/api/eventos-carrito?dias=${diasSeleccionados}`)
			])
			
			const dataVisitas = await responseVisitas.json()
			const dataCarrito = await responseCarrito.json()
			
			console.log("📈 DATOS RECIBIDOS DEL API:", {
				totalVisitas: dataVisitas.totalVisitas,
				visitasPorDia: dataVisitas.visitasPorDia,
				diasConVisitas: Object.keys(dataVisitas.visitasPorDia || {}).length,
				carritoClicksContinuar: dataCarrito.totalClicksContinuar,
				carritoAbandonados: dataCarrito.totalCarritosAbandonados,
			})
			
			if (dataVisitas.success) {
				setEstadisticas(dataVisitas)
			} else {
				setError("Error al cargar estadísticas de visitas")
			}

			if (dataCarrito.success) {
				setEstadisticasCarrito(dataCarrito)
			} else {
				console.warn("Error al cargar estadísticas de carrito, continuando sin ellas")
			}
		} catch (err) {
			setError("Error de conexión")
			console.error("Error cargando estadísticas:", err)
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

	// Formatea segundos como "2m 43s" (o "43s" si es menos de un minuto)
	const formatearDuracion = (segundos: number) => {
		if (!segundos || segundos <= 0) return "0s"
		const min = Math.floor(segundos / 60)
		const seg = segundos % 60
		return min > 0 ? `${min}m ${seg}s` : `${seg}s`
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

	// Generar todos los días del período seleccionado
	const generarTodosLosDias = () => {
		const dias: Array<{ fecha: string; visitas: number }> = []
		
		// Usar fecha local en lugar de UTC para evitar problemas de zona horaria
		for (let i = 0; i < diasSeleccionados; i++) {
			const fecha = new Date()
			fecha.setDate(fecha.getDate() - i)
			fecha.setHours(0, 0, 0, 0) // Normalizar a medianoche
			
			const year = fecha.getFullYear()
			const month = String(fecha.getMonth() + 1).padStart(2, '0')
			const day = String(fecha.getDate()).padStart(2, '0')
			const fechaStr = `${year}-${month}-${day}`
			
			const visitas = estadisticas.visitasPorDia[fechaStr] || 0
			
			dias.push({
				fecha: fechaStr,
				visitas: visitas,
			})
		}
		
		return dias
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

			{/* Audiencia: visitantes únicos, recurrencia y tiempo en página */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{/* Visitantes únicos */}
				<div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-6 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-indigo-700 font-medium mb-1">Visitantes Únicos</p>
							<p className="text-3xl font-bold text-indigo-900">{estadisticas.visitantesUnicos}</p>
							<p className="text-xs text-indigo-600 mt-2">
								de {estadisticas.totalVisitas} visitas totales
							</p>
						</div>
						<Users className="h-10 w-10 text-indigo-600" />
					</div>
				</div>

				{/* Promedio de visitas por usuario */}
				<div className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-lg p-6 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-teal-700 font-medium mb-1">Visitas por Usuario</p>
							<p className="text-3xl font-bold text-teal-900">{estadisticas.promedioVisitasPorUsuario}</p>
							<p className="text-xs text-teal-600 mt-2">
								Promedio de veces que vuelven
							</p>
						</div>
						<Repeat className="h-10 w-10 text-teal-600" />
					</div>
				</div>

				{/* Tiempo promedio en la página */}
				<div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-6 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-amber-700 font-medium mb-1">Tiempo Promedio</p>
							<p className="text-3xl font-bold text-amber-900">
								{formatearDuracion(estadisticas.tiempoPromedioSegundos)}
							</p>
							<p className="text-xs text-amber-600 mt-2">
								{estadisticas.tiempoPromedioSegundos > 0
									? "En la página del catálogo"
									: "Aún sin datos de duración"}
							</p>
						</div>
						<Clock className="h-10 w-10 text-amber-600" />
					</div>
				</div>
			</div>

			{/* Tarjetas de estadísticas de carrito */}
			{estadisticasCarrito && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Clicks en continuar pedido */}
					<div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6 shadow-sm">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-green-700 font-medium mb-1">Pedidos Continuados</p>
								<p className="text-3xl font-bold text-green-900">{estadisticasCarrito.totalClicksContinuar}</p>
								<p className="text-xs text-green-600 mt-2">
									Promedio: {estadisticasCarrito.itemsPromedioContinuar} items
								</p>
							</div>
							<CheckCircle2 className="h-10 w-10 text-green-600" />
						</div>
					</div>

					{/* Carritos abandonados */}
					<div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-6 shadow-sm">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-red-700 font-medium mb-1">Carritos Abandonados</p>
								<p className="text-3xl font-bold text-red-900">{estadisticasCarrito.totalCarritosAbandonados}</p>
								<p className="text-xs text-red-600 mt-2">
									Promedio: {estadisticasCarrito.itemsPromedioAbandonado} items
								</p>
							</div>
							<XCircle className="h-10 w-10 text-red-600" />
						</div>
					</div>

					{/* Tasa de conversión */}
					<div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 shadow-sm">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-blue-700 font-medium mb-1">Tasa de Conversión</p>
								<p className="text-3xl font-bold text-blue-900">{estadisticasCarrito.tasaConversion}%</p>
								<p className="text-xs text-blue-600 mt-2">
									De carrito a pedido
								</p>
							</div>
							<ShoppingCart className="h-10 w-10 text-blue-600" />
						</div>
					</div>
				</div>
			)}

			{/* Gráfico de visitas por día */}
			<div className="bg-white border rounded-lg p-4 sm:p-6 shadow-sm">
				<h2 className="text-lg font-semibold mb-4 sm:mb-6 flex items-center gap-2 text-blue-700">
					<BarChart3 className="h-5 w-5" />
					Visitas por Día
				</h2>
				<div className="relative overflow-x-auto">
					{(() => {
						const todosLosDias = generarTodosLosDias()
						// Mostrar menos días en móvil para mejor visualización
						const diasMostrar = todosLosDias.slice(0, 15).reverse()
						const maxVisitas = Math.max(...diasMostrar.map(d => d.visitas), 1)
						
						// Calcular escala del eje Y (redondear hacia arriba)
						const escalaY = Math.ceil(maxVisitas / 5) * 5
						const lineasGrid = 6
						
						return (
							<div className="min-w-[500px] sm:min-w-0">
								{/* Eje Y con cuadrícula */}
								<div className="flex gap-2 sm:gap-4">
									{/* Números del eje Y */}
									<div className="flex flex-col-reverse justify-between h-60 sm:h-80 py-4 text-[10px] sm:text-xs text-gray-600 font-medium w-6 sm:w-8">
										{Array.from({ length: lineasGrid }, (_, i) => {
											const valor = Math.round((escalaY / (lineasGrid - 1)) * i)
											return (
												<div key={i} className="h-0 flex items-center justify-end">
													{valor}
												</div>
											)
										})}
									</div>
									
									{/* Área del gráfico */}
									<div className="flex-1 relative">
										{/* Líneas de cuadrícula horizontal */}
										<div className="absolute inset-0 flex flex-col justify-between py-4">
											{Array.from({ length: lineasGrid }, (_, i) => (
												<div key={i} className="border-t border-dotted border-gray-300" />
											))}
										</div>
										
										{/* Barras con fechas */}
										<div className="relative h-60 sm:h-80 flex items-end justify-between gap-[2px] sm:gap-1 px-1 sm:px-2 py-4 pb-0">
											{diasMostrar.map(({ fecha, visitas }) => {
												const alturaPorcentaje = escalaY > 0 ? (visitas / escalaY) * 100 : 0
												
												// Parsear fecha manualmente para evitar problemas de zona horaria
												const [year, month, day] = fecha.split('-')
												const fechaCorta = `${parseInt(day)}/${parseInt(month)}`
												
												return (
													<div key={fecha} className="flex-1 flex flex-col items-center h-full justify-end group relative min-w-[20px] sm:min-w-0">
														{/* Número encima de la barra - Siempre visible */}
														{visitas > 0 && (
															<span className="text-[8px] sm:text-xs font-semibold text-gray-700 mb-1">
																{visitas}
															</span>
														)}
														{/* Barra */}
														<div
															className="w-full bg-blue-600 active:bg-blue-800 sm:hover:bg-blue-700 transition-all rounded-t shadow-sm cursor-pointer max-w-[30px] sm:max-w-none mx-auto"
															style={{ 
																height: `${alturaPorcentaje}%`,
																minHeight: visitas > 0 ? '4px' : '0px'
															}}
															title={`${visitas} visitas el ${fechaCorta}`}
														/>
													</div>
												)
											})}
										</div>
										
										{/* Eje X */}
										<div className="border-t-2 border-gray-800" />
									</div>
								</div>
								
								{/* Etiquetas del eje X */}
								<div className="flex gap-2 sm:gap-4 mt-1">
									<div className="w-6 sm:w-8" /> {/* Espacio para alinear con eje Y */}
									<div className="flex-1 flex justify-between gap-[2px] sm:gap-1 px-1 sm:px-2">
										{diasMostrar.map(({ fecha }) => {
											// Parsear fecha manualmente para evitar problemas de zona horaria
											const [year, month, day] = fecha.split('-')
											const fechaCorta = `${parseInt(day)}/${parseInt(month)}`
											
											return (
												<div key={fecha} className="flex-1 text-center min-w-[20px] sm:min-w-0">
													<span className="text-[8px] sm:text-xs text-gray-600 font-medium whitespace-nowrap">
														{fechaCorta}
													</span>
												</div>
											)
										})}
									</div>
								</div>
								
								{/* Etiqueta del eje X */}
								<div className="text-center mt-3 sm:mt-3">
									<span className="text-xs sm:text-sm text-gray-500 font-medium">Fecha</span>
								</div>
							</div>
						)
					})()}
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


