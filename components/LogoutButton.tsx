"use client"

import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export function LogoutButton() {
	const router = useRouter()
	
	const handleLogout = async () => {
		await signOut({ redirect: false })
		router.push("/perfumes")
	}
	
	return (
		<button onClick={handleLogout} className="text-sm underline">
			Salir
		</button>
	)
}

