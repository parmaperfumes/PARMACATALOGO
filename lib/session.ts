import { auth } from "@/auth"
import { NextResponse } from "next/server"

// En DESARROLLO (localhost) permitimos entrar al admin sin pedir login, para
// poder avanzar rápido. En PRODUCCIÓN (Render) siempre se exige sesión real.
//
// El bypass solo aplica cuando NODE_ENV !== "production" (o sea, `next dev`).
// En Render el build corre en modo producción, así que ahí nunca se salta.
const BYPASS_LOCAL = process.env.NODE_ENV !== "production"

const SESION_DEV = {
	user: {
		id: "dev-local",
		name: "Dev (localhost)",
		email: "dev@localhost",
		role: "ADMIN",
	},
} as any

/**
 * Devuelve la sesión actual. En localhost (desarrollo) devuelve una sesión
 * de admin ficticia para no tener que iniciar sesión. En producción usa auth().
 */
export async function obtenerSesion() {
	if (BYPASS_LOCAL) return SESION_DEV
	return await auth()
}

/**
 * Candado de las rutas de administración. Devuelve la respuesta 401 si no hay
 * sesión, o null si se puede seguir:
 *
 *   const bloqueo = await exigirSesion()
 *   if (bloqueo) return bloqueo
 *
 * Toda ruta de /api que escriba datos o muestre configuración lo lleva. Hasta el
 * 2026-09-19 faltaba en nueve: cualquiera podía editar o borrar perfumes, subir
 * imágenes y crear un usuario administrador sin iniciar sesión.
 */
export async function exigirSesion(): Promise<NextResponse | null> {
	const sesion = await obtenerSesion()
	if (!sesion?.user) {
		return NextResponse.json({ error: "No autorizado" }, { status: 401 })
	}
	return null
}
