import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE() {
	try {
		// Definir el rango del día 15/11/2025 en UTC
		const inicioDelDia = new Date('2025-11-15T00:00:00.000Z')
		const finDelDia = new Date('2025-11-15T23:59:59.999Z')
		
		console.log('🗑️  Borrando visitas del día 15/11/2025...')
		
		// Eliminar todas las visitas de ese día
		const resultado = await prisma.visita.deleteMany({
			where: {
				createdAt: {
					gte: inicioDelDia,
					lte: finDelDia,
				},
			},
		})
		
		console.log(`✅ Se eliminaron ${resultado.count} visitas del día 15/11/2025`)
		
		return NextResponse.json({ 
			success: true, 
			mensaje: `Se eliminaron ${resultado.count} visitas del día 15/11/2025`,
			count: resultado.count 
		})
	} catch (error) {
		console.error('❌ Error borrando visitas:', error)
		return NextResponse.json({ 
			success: false, 
			error: "Error al borrar visitas" 
		}, { status: 500 })
	}
}

