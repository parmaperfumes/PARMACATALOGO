"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function DiagnosticoPage() {
	const [resultado, setResultado] = useState<any>(null)
	const [cargando, setCargando] = useState(false)

	async function probarConexion() {
		setCargando(true)
		setResultado(null)
		
		try {
			const res = await fetch("/api/test-db")
			const data = await res.json()
			setResultado({
				success: res.ok,
				status: res.status,
				data: data
			})
		} catch (error: any) {
			setResultado({
				success: false,
				error: error.message
			})
		} finally {
			setCargando(false)
		}
	}

	async function probarListarPerfumes() {
		setCargando(true)
		setResultado(null)
		
		try {
			const res = await fetch("/api/perfumes")
			const data = await res.json()
			setResultado({
				success: res.ok,
				status: res.status,
				data: Array.isArray(data) ? `${data.length} perfumes encontrados` : data
			})
		} catch (error: any) {
			setResultado({
				success: false,
				error: error.message
			})
		} finally {
			setCargando(false)
		}
	}

	async function probarObtenerPerfume(id: string) {
		setCargando(true)
		setResultado(null)
		
		try {
			const res = await fetch(`/api/perfumes/${id}`)
			const text = await res.text()
			let data
			try {
				data = JSON.parse(text)
			} catch {
				data = text
			}
			setResultado({
				success: res.ok,
				status: res.status,
				data: data
			})
		} catch (error: any) {
			setResultado({
				success: false,
				error: error.message
			})
		} finally {
			setCargando(false)
		}
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold mb-6">Diagnóstico de Base de Datos</h1>
			
			<div className="space-y-4 mb-6">
				<Button onClick={probarConexion} disabled={cargando}>
					{cargando ? "Probando..." : "Probar Conexión a BD"}
				</Button>
				<Button onClick={probarListarPerfumes} disabled={cargando} variant="outline">
					{cargando ? "Probando..." : "Listar Perfumes"}
				</Button>
				<div className="flex gap-2">
					<input
						type="text"
						placeholder="ID del perfume a probar"
						className="border rounded px-3 py-2"
						id="perfume-id-input"
					/>
					<Button 
						onClick={() => {
							const input = document.getElementById("perfume-id-input") as HTMLInputElement
							if (input.value) probarObtenerPerfume(input.value)
						}} 
						disabled={cargando}
						variant="outline"
					>
						Probar Obtener Perfume
					</Button>
				</div>
			</div>

			{resultado && (
				<div className={`p-4 rounded-lg border ${resultado.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
					<h2 className="font-semibold mb-2">
						{resultado.success ? "✅ Éxito" : "❌ Error"}
					</h2>
					{resultado.status && (
						<p className="text-sm mb-2">Status: {resultado.status}</p>
					)}
					<pre className="text-xs bg-white p-3 rounded overflow-auto">
						{JSON.stringify(resultado.data || resultado.error, null, 2)}
					</pre>
				</div>
			)}
		</div>
	)
}

