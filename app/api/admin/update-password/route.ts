import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
	if (!process.env.DATABASE_URL) {
		return NextResponse.json({ error: "DATABASE_URL no configurada" }, { status: 500 })
	}

	try {
		const { email, password } = await req.json()
		
		if (!email || !password) {
			return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
		}

		const emailLower = email.toLowerCase()
		const hashedPassword = await bcrypt.hash(password, 10)

		// Verificar si el usuario existe usando SQL raw
		const existingUser = await prisma.$queryRawUnsafe<Array<any>>(
			`SELECT id, email, role FROM "User" WHERE email = $1`,
			emailLower
		)

		if (existingUser.length === 0) {
			// Crear el usuario si no existe
			await prisma.$executeRawUnsafe(
				`INSERT INTO "User" (id, email, name, "passwordHash", role, "createdAt", "updatedAt")
				 VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())`,
				emailLower,
				"Admin",
				hashedPassword,
				"ADMIN"
			)
			return NextResponse.json({ 
				success: true, 
				message: "Usuario creado exitosamente",
				email: emailLower 
			})
		} else {
			// Actualizar la contraseña
			await prisma.$executeRawUnsafe(
				`UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE email = $2`,
				hashedPassword,
				emailLower
			)
			return NextResponse.json({ 
				success: true, 
				message: "Contraseña actualizada exitosamente",
				email: existingUser[0].email,
				id: existingUser[0].id,
				role: existingUser[0].role
			})
		}
	} catch (error: any) {
		console.error("Error al actualizar contraseña:", error)
		return NextResponse.json({ 
			error: error.message || "Error al actualizar contraseña" 
		}, { status: 500 })
	}
}


