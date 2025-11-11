import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import * as dotenv from "dotenv"
import { resolve } from "path"

// Cargar variables de entorno
dotenv.config({ path: resolve(__dirname, "../.env.local") })

// Crear una instancia de Prisma para el script
const prisma = new PrismaClient()

async function updatePassword() {
	const email = "parma01@gmail.com"
	const newPassword = "parma0405"
	
	if (!process.env.DATABASE_URL) {
		console.error("❌ Error: DATABASE_URL no está configurada en las variables de entorno")
		console.log("Por favor, asegúrate de tener un archivo .env.local con DATABASE_URL configurada")
		process.exit(1)
	}
	
	try {
		console.log("🔍 Buscando usuario...")
		
		// Intentar usar SQL raw primero para evitar problemas con Prisma
		const emailLower = email.toLowerCase()
		const hashedPassword = await bcrypt.hash(newPassword, 10)
		
		// Verificar si el usuario existe usando SQL raw
		const existingUser = await prisma.$queryRawUnsafe<Array<any>>(
			`SELECT id, email, role FROM "User" WHERE email = $1`,
			emailLower
		)
		
		if (existingUser.length === 0) {
			console.log("📝 Usuario no encontrado. Creando nuevo usuario...")
			// Crear el usuario usando SQL raw
			const result = await prisma.$executeRawUnsafe(
				`INSERT INTO "User" (id, email, name, "passwordHash", role, "createdAt", "updatedAt")
				 VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())`,
				emailLower,
				"Admin",
				hashedPassword,
				"ADMIN"
			)
			console.log("✅ Usuario creado exitosamente!")
			console.log(`   Email: ${emailLower}`)
		} else {
			console.log("📝 Usuario encontrado. Actualizando contraseña...")
			// Actualizar la contraseña usando SQL raw
			await prisma.$executeRawUnsafe(
				`UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE email = $2`,
				hashedPassword,
				emailLower
			)
			console.log("✅ Contraseña actualizada exitosamente!")
			console.log(`   Email: ${existingUser[0].email}`)
			console.log(`   ID: ${existingUser[0].id}`)
			console.log(`   Rol: ${existingUser[0].role}`)
		}
	} catch (error: any) {
		console.error("❌ Error:", error.message)
		if (error.message?.includes("Can't reach database") || error.message?.includes("fetch failed")) {
			console.error("   No se puede conectar a la base de datos.")
			console.error("   Verifica que DATABASE_URL esté correctamente configurada en .env.local")
			console.error("   Asegúrate de usar la URL de Session Pooler (puerto 6543) para Vercel")
		}
		process.exit(1)
	} finally {
		await prisma.$disconnect()
	}
}

updatePassword()
