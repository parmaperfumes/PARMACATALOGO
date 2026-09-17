import { NextResponse } from "next/server"
import { obtenerSesion } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { revisarRebotes } from "@/lib/rebotes"

// Revisa la bandeja por rebotes y marca como "rebotado" los códigos cuyos
// correos no existen (destinatario no encontrado). Esos dejan de mostrarse.
export async function POST() {
	const session = await obtenerSesion()
	if (!session?.user) {
		return NextResponse.json({ error: "No autorizado" }, { status: 401 })
	}

	try {
		const { correosRebotados, revisados } = await revisarRebotes()

		let marcados = 0
		if (correosRebotados.length > 0) {
			const ph = correosRebotados.map((_, i) => `$${i + 1}`).join(",")
			try {
				marcados = await prisma.$executeRawUnsafe(
					`UPDATE "RuletaDescuento"
					 SET "rebotado" = true, "rebotadoEn" = NOW()
					 WHERE lower("correo") IN (${ph}) AND "rebotado" = false`,
					...correosRebotados
				)
			} catch (e: any) {
				if (e.message?.includes("rebotado") || e.message?.includes("does not exist")) {
					return NextResponse.json(
						{ error: "Falta la columna 'rebotado'. Ejecuta scripts/agregar_columna_rebotado.sql en Supabase." },
						{ status: 500 }
					)
				}
				throw e
			}
		}

		return NextResponse.json({ revisados, detectados: correosRebotados.length, marcados })
	} catch (e: any) {
		console.error("Error en /api/ruleta/rebotes:", e)
		return NextResponse.json({ error: e?.message || "Error al revisar rebotes" }, { status: 500 })
	}
}
