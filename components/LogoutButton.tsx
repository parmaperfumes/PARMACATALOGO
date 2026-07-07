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
		<button
			onClick={handleLogout}
			className="rounded-full border-[1.4px] border-[#e3e4e9] px-[14px] py-[7px] text-[13px] font-bold text-black bg-white hover:bg-gray-50 transition-colors"
		>
			Salir
		</button>
	)
}

