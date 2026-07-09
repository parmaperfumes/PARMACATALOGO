import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { path, visitorId } = body

		// Actualización de duración (enviada con sendBeacon al salir de la página).
		// Si viene un id y una duración, actualizamos la visita existente en lugar de crear una nueva.
		if (body.id && typeof body.duracion === "number") {
			const duracion = Math.max(0, Math.min(Math.round(body.duracion), 3600)) // tope 1h por seguridad
			const existente = await prisma.visita.findUnique({
				where: { id: body.id },
				select: { duracion: true },
			})
			if (existente) {
				await prisma.visita.update({
					where: { id: body.id },
					// Nos quedamos con la duración mayor (por si llegan varios beacons)
					data: { duracion: Math.max(existente.duracion || 0, duracion) },
				})
			}
			return NextResponse.json({ success: true }, { status: 200 })
		}

		// Obtener información del visitante
		const userAgent = req.headers.get("user-agent") || ""
		const referrer = req.headers.get("referer") || req.headers.get("referrer") || ""
		
		// Obtener IP
		const ip = req.headers.get("x-forwarded-for") || 
		           req.headers.get("x-real-ip") || 
		           "unknown"

		// Detectar tipo de dispositivo
		let dispositivo = "desktop"
		if (userAgent) {
			if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
				dispositivo = "mobile"
			} else if (/tablet|ipad/i.test(userAgent)) {
				dispositivo = "tablet"
			}
		}

		// Intentar obtener ubicación usando el IP (usando un servicio gratuito)
		let pais = null
		let ciudad = null
		
		try {
			if (ip && ip !== "unknown" && !ip.includes("127.0.0.1") && !ip.includes("localhost")) {
				const ipToUse = ip.split(",")[0].trim() // En caso de múltiples IPs
				const geoResponse = await fetch(`http://ip-api.com/json/${ipToUse}?fields=country,city`)
				if (geoResponse.ok) {
					const geoData = await geoResponse.json()
					pais = geoData.country || null
					ciudad = geoData.city || null
				}
			}
		} catch (geoError) {
			// Si falla la geolocalización, continuamos sin ella
			console.error("Error obteniendo geolocalización:", geoError)
		}

	// Guardar la visita en la base de datos
	const visita = await prisma.visita.create({
		data: {
			path,
			userAgent,
			referrer: referrer || null,
			ip: ip || null,
			pais,
			ciudad,
			dispositivo,
			visitorId: visitorId || null,
		},
	})

	return NextResponse.json({ success: true, id: visita.id }, { status: 201 })
	} catch (error) {
		console.error("Error registrando visita:", error)
		return NextResponse.json({ success: false, error: "Error registrando visita" }, { status: 500 })
	}
}

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url)
		const dias = parseInt(searchParams.get("dias") || "30")
		const path = searchParams.get("path")

		// Calcular fecha de inicio
		const fechaInicio = new Date()
		fechaInicio.setDate(fechaInicio.getDate() - dias)

		// Construir filtros
		const where: any = {
			createdAt: {
				gte: fechaInicio,
			},
		}

		if (path) {
			where.path = path
		}

		// Obtener estadísticas
		const visitas = await prisma.visita.findMany({
			where,
			orderBy: {
				createdAt: "desc",
			},
		})

	// Estadísticas agregadas
	const totalVisitas = visitas.length

	// Visitantes únicos: usamos el visitorId estable (localStorage) y, para las
	// visitas antiguas que no lo tienen, caemos en la huella IP + userAgent.
	const clavesUnicas = new Set(
		visitas.map((v) => v.visitorId || `${v.ip || "?"}|${v.userAgent || "?"}`)
	)
	const visitantesUnicos = clavesUnicas.size
	const promedioVisitasPorUsuario =
		visitantesUnicos > 0 ? (totalVisitas / visitantesUnicos).toFixed(2) : "0"

	// Tiempo promedio en la página: promediamos las duraciones registradas (> 0s)
	const duraciones = visitas
		.map((v) => v.duracion)
		.filter((d): d is number => typeof d === "number" && d > 0)
	const tiempoPromedioSegundos =
		duraciones.length > 0
			? Math.round(duraciones.reduce((a, b) => a + b, 0) / duraciones.length)
			: 0
	const visitasPorDia = visitas.reduce((acc: any, visita) => {
		// Usar fecha local en lugar de UTC para evitar problemas de zona horaria
		const fecha = new Date(visita.createdAt)
		const year = fecha.getFullYear()
		const month = String(fecha.getMonth() + 1).padStart(2, '0')
		const day = String(fecha.getDate()).padStart(2, '0')
		const fechaStr = `${year}-${month}-${day}`
		
		acc[fechaStr] = (acc[fechaStr] || 0) + 1
		return acc
	}, {})

		const visitasPorDispositivo = visitas.reduce((acc: any, visita) => {
			acc[visita.dispositivo || "unknown"] = (acc[visita.dispositivo || "unknown"] || 0) + 1
			return acc
		}, {})

		const visitasPorPagina = visitas.reduce((acc: any, visita) => {
			acc[visita.path] = (acc[visita.path] || 0) + 1
			return acc
		}, {})

		const visitasPorPais = visitas.reduce((acc: any, visita) => {
			if (visita.pais) {
				acc[visita.pais] = (acc[visita.pais] || 0) + 1
			}
			return acc
		}, {})

		return NextResponse.json({
			success: true,
			periodo: `Últimos ${dias} días`,
			totalVisitas,
			visitantesUnicos,
			promedioVisitasPorUsuario,
			tiempoPromedioSegundos,
			visitasPorDia,
			visitasPorDispositivo,
			visitasPorPagina,
			visitasPorPais,
			visitasRecientes: visitas.slice(0, 10), // Las 10 más recientes
		})
	} catch (error) {
		console.error("Error obteniendo estadísticas:", error)
		return NextResponse.json({ success: false, error: "Error obteniendo estadísticas" }, { status: 500 })
	}
}


