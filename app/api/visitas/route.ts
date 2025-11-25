import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { path } = body

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


