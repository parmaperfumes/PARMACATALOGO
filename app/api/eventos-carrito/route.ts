import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Tipos
type EventoTipo = "click_continuar" | "carrito_abandonado"

interface EventoCarritoBody {
	tipo: EventoTipo
	cantidadItems: number
	items?: Array<{
		name: string
		size: number
		use: string
	}>
	dispositivo?: string
}

// POST - Registrar un evento de carrito
export async function POST(request: NextRequest) {
	try {
		const body: EventoCarritoBody = await request.json()

		// Validaciones
		if (!body.tipo || !["click_continuar", "carrito_abandonado"].includes(body.tipo)) {
			return NextResponse.json(
				{ error: "Tipo de evento inválido" },
				{ status: 400 }
			)
		}

		if (typeof body.cantidadItems !== "number" || body.cantidadItems < 0) {
			return NextResponse.json(
				{ error: "Cantidad de items inválida" },
				{ status: 400 }
			)
		}

		// Obtener información del dispositivo y ubicación desde headers
		const userAgent = request.headers.get("user-agent") || ""
		const dispositivo = /mobile/i.test(userAgent) ? "mobile" : "desktop"

		// Obtener ubicación desde headers (si está disponible desde un proxy/CDN como Vercel)
		const pais = request.headers.get("x-vercel-ip-country") || null
		const ciudad = request.headers.get("x-vercel-ip-city") || null

		// Guardar el evento en la base de datos
		await prisma.$executeRaw`
			INSERT INTO eventos_carrito (tipo, cantidad_items, items, dispositivo, pais, ciudad, "createdAt")
			VALUES (
				${body.tipo},
				${body.cantidadItems},
				${JSON.stringify(body.items || [])}::jsonb,
				${dispositivo},
				${pais},
				${ciudad},
				NOW()
			)
		`

		return NextResponse.json(
			{ success: true, message: "Evento registrado correctamente" },
			{ status: 201 }
		)
	} catch (error) {
		console.error("Error al registrar evento de carrito:", error)
		return NextResponse.json(
			{ error: "Error interno del servidor" },
			{ status: 500 }
		)
	}
}

// GET - Obtener estadísticas de eventos de carrito
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const dias = parseInt(searchParams.get("dias") || "30")

		// Calcular fecha límite
		const fechaLimite = new Date()
		fechaLimite.setDate(fechaLimite.getDate() - dias)

		// Obtener estadísticas
		const [
			clicksContinuar,
			carritosAbandonados,
			eventosPorDia,
			itemsPromedioContinuar,
			itemsPromedioAbandonado
		] = await Promise.all([
			// Total de clicks en continuar
			prisma.$queryRaw<[{ count: bigint }]>`
				SELECT COUNT(*) as count
				FROM eventos_carrito
				WHERE tipo = 'click_continuar'
				AND "createdAt" >= ${fechaLimite}
			`,
			// Total de carritos abandonados
			prisma.$queryRaw<[{ count: bigint }]>`
				SELECT COUNT(*) as count
				FROM eventos_carrito
				WHERE tipo = 'carrito_abandonado'
				AND "createdAt" >= ${fechaLimite}
			`,
			// Eventos por día
			prisma.$queryRaw<Array<{ fecha: string; tipo: string; count: bigint }>>`
				SELECT 
					DATE("createdAt") as fecha,
					tipo,
					COUNT(*) as count
				FROM eventos_carrito
				WHERE "createdAt" >= ${fechaLimite}
				GROUP BY DATE("createdAt"), tipo
				ORDER BY fecha DESC
			`,
			// Items promedio en clicks continuar
			prisma.$queryRaw<[{ promedio: number | null }]>`
				SELECT AVG(cantidad_items) as promedio
				FROM eventos_carrito
				WHERE tipo = 'click_continuar'
				AND "createdAt" >= ${fechaLimite}
			`,
			// Items promedio en carritos abandonados
			prisma.$queryRaw<[{ promedio: number | null }]>`
				SELECT AVG(cantidad_items) as promedio
				FROM eventos_carrito
				WHERE tipo = 'carrito_abandonado'
				AND "createdAt" >= ${fechaLimite}
			`
		])

		// Convertir BigInt a Number
		const totalClicksContinuar = Number(clicksContinuar[0]?.count || 0)
		const totalCarritosAbandonados = Number(carritosAbandonados[0]?.count || 0)

		// Procesar eventos por día
		const eventosPorDiaMap: Record<string, { click_continuar: number; carrito_abandonado: number }> = {}
		eventosPorDia.forEach((evento) => {
			const fechaStr = evento.fecha.toString()
			if (!eventosPorDiaMap[fechaStr]) {
				eventosPorDiaMap[fechaStr] = { click_continuar: 0, carrito_abandonado: 0 }
			}
			if (evento.tipo === "click_continuar") {
				eventosPorDiaMap[fechaStr].click_continuar = Number(evento.count)
			} else if (evento.tipo === "carrito_abandonado") {
				eventosPorDiaMap[fechaStr].carrito_abandonado = Number(evento.count)
			}
		})

		// Calcular tasa de conversión
		const totalEventos = totalClicksContinuar + totalCarritosAbandonados
		const tasaConversion = totalEventos > 0
			? ((totalClicksContinuar / totalEventos) * 100).toFixed(1)
			: "0.0"

		return NextResponse.json({
			success: true,
			totalClicksContinuar,
			totalCarritosAbandonados,
			itemsPromedioContinuar: itemsPromedioContinuar[0]?.promedio 
				? Number(itemsPromedioContinuar[0].promedio).toFixed(1) 
				: "0.0",
			itemsPromedioAbandonado: itemsPromedioAbandonado[0]?.promedio
				? Number(itemsPromedioAbandonado[0].promedio).toFixed(1)
				: "0.0",
			tasaConversion,
			eventosPorDia: eventosPorDiaMap,
		})
	} catch (error) {
		console.error("Error al obtener estadísticas de carrito:", error)
		return NextResponse.json(
			{ error: "Error al obtener estadísticas" },
			{ status: 500 }
		)
	}
}

