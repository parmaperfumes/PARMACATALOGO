import { NextResponse } from "next/server"
import { exigirSesion } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET() {
	const bloqueo = await exigirSesion()
	if (bloqueo) return bloqueo

	const dbUrl = process.env.DATABASE_URL
	
	if (!dbUrl) {
		return NextResponse.json({ 
			success: false, 
			error: "DATABASE_URL no está configurada",
			dbUrl_exists: false 
		}, { status: 501 })
	}

	try {
		// Intentar una consulta simple para verificar la conexión
		const result = await prisma.$queryRaw`SELECT 1 as test`
		return NextResponse.json({ 
			success: true, 
			message: "Conexión a la base de datos exitosa",
			dbUrl_exists: true,
			dbUrl_preview: dbUrl.substring(0, 50) + "..."
		})
	} catch (e: any) {
		console.error("Error de conexión:", e)
		return NextResponse.json({ 
			success: false, 
			error: e.message || "Error desconocido",
			dbUrl_exists: true,
			dbUrl_preview: dbUrl.substring(0, 50) + "...",
			error_type: e.message?.includes("Can't reach") ? "connection_error" : "other"
		}, { status: 500 })
	}
}

