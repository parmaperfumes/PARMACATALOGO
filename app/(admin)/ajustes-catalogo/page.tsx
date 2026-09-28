"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type CatalogPopupConfig = {
	activo: boolean
	mensajeTitulo: string
	mensajeTexto: string
	mensajeWhatsApp: string
}

const DEFAULT_CONFIG: CatalogPopupConfig = {
	activo: true,
	mensajeTitulo: "¿Necesitas ayuda personalizada?",
	mensajeTexto: "Te ayudamos a encontrar el perfume ideal para ti. ¿Hablamos por WhatsApp?",
	mensajeWhatsApp: "Hola 👋, necesito ayuda personalizada para elegir mi perfume.",
}

export default function AjustesCatalogoPage() {
	const [config, setConfig] = useState<CatalogPopupConfig>(DEFAULT_CONFIG)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		async function loadConfig() {
			try {
				const res = await fetch("/api/catalog-popup")
				if (res.ok) {
					const data = await res.json()
					setConfig({
						activo: data.activo !== false,
						mensajeTitulo: data.mensajeTitulo ?? DEFAULT_CONFIG.mensajeTitulo,
						mensajeTexto: data.mensajeTexto ?? DEFAULT_CONFIG.mensajeTexto,
						mensajeWhatsApp: data.mensajeWhatsApp ?? DEFAULT_CONFIG.mensajeWhatsApp,
					})
				}
			} catch (error) {
				console.error("Error al cargar configuración:", error)
			} finally {
				setLoading(false)
			}
		}
		loadConfig()
	}, [])

	async function handleSave() {
		setSaving(true)
		try {
			const res = await fetch("/api/catalog-popup", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(config),
			})

			if (res.ok) {
				alert("Configuración guardada exitosamente")
			} else {
				const errorText = await res.text()
				alert(`Error: ${errorText}`)
			}
		} catch (error) {
			console.error("Error al guardar:", error)
			alert("Error al guardar la configuración")
		} finally {
			setSaving(false)
		}
	}

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<p>Cargando...</p>
			</div>
		)
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-2xl">
			<h1 className="text-2xl font-bold mb-6">Ajustes del Catálogo</h1>
			<p className="text-gray-600 text-sm mb-6">
				Configura el banner de ayuda personalizada que aparece al inicio de /perfumes y el mensaje que se envía por WhatsApp.
			</p>

			<div className="space-y-6 border rounded-lg p-6">
				<div className="flex items-center justify-between gap-4">
					<div>
						<div className="text-sm font-medium">Banner de ayuda personalizada</div>
						<div className="text-xs text-gray-500">
							{config.activo ? "Activado: aparece al inicio de /perfumes." : "Desactivado: no aparece en el sitio."}
						</div>
					</div>
					<button
						type="button"
						role="switch"
						aria-checked={config.activo}
						onClick={() => setConfig((prev) => ({ ...prev, activo: !prev.activo }))}
						className={`relative w-14 h-8 shrink-0 rounded-full transition-colors ${config.activo ? "bg-green-600" : "bg-[#ccced6]"}`}
						aria-label="Activar o desactivar el banner de ayuda personalizada"
					>
						<span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${config.activo ? "translate-x-6" : ""}`} />
					</button>
				</div>

				<div>
					<label className="block text-sm font-medium mb-2">Mensaje predeterminado para WhatsApp</label>
					<textarea
						value={config.mensajeWhatsApp}
						onChange={(e) => setConfig((prev) => ({ ...prev, mensajeWhatsApp: e.target.value }))}
						placeholder="Hola 👋, necesito ayuda personalizada para elegir mi perfume."
						className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						rows={3}
					/>
					<p className="text-xs text-gray-500 mt-1">
						Este texto se escribe automáticamente en WhatsApp cuando el cliente toca &quot;Escríbenos&quot; en el banner.
					</p>
				</div>

				<Button onClick={handleSave} disabled={saving}>
					{saving ? "Guardando..." : "Guardar"}
				</Button>
			</div>
		</div>
	)
}
