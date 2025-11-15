import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
	try {
		// Obtener todas las visitas
		const todasVisitas = await prisma.visita.findMany({
			orderBy: {
				createdAt: 'desc'
			},
			take: 100
		})
		
		// Agrupar por día
		const visitasPorDia: Record<string, number> = {}
		todasVisitas.forEach(visita => {
			const fecha = new Date(visita.createdAt)
			const year = fecha.getFullYear()
			const month = String(fecha.getMonth() + 1).padStart(2, '0')
			const day = String(fecha.getDate()).padStart(2, '0')
			const fechaStr = `${year}-${month}-${day}`
			
			visitasPorDia[fechaStr] = (visitasPorDia[fechaStr] || 0) + 1
		})
		
		return NextResponse.json({ 
			success: true, 
			visitasPorDia,
			totalVisitas: todasVisitas.length,
			primerasVisitas: todasVisitas.slice(0, 5).map(v => ({
				id: v.id,
				createdAt: v.createdAt,
				path: v.path
			}))
		})
	} catch (error) {
		console.error('❌ Error:', error)
		return NextResponse.json({ 
			success: false, 
			error: "Error" 
		}, { status: 500 })
	}
}

