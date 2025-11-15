import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function borrarVisitasHoy() {
  try {
    // Definir el rango del día 15/11/2025
    const inicioDelDia = new Date('2025-11-15T00:00:00')
    const finDelDia = new Date('2025-11-15T23:59:59')
    
    console.log('🗑️  Borrando visitas del día 15/11/2025...')
    console.log(`Rango: ${inicioDelDia.toISOString()} a ${finDelDia.toISOString()}`)
    
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
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

borrarVisitasHoy()

