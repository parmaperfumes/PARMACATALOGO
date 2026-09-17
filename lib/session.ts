import { auth } from "@/auth"

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
