"use client"

import { useEffect, useRef, useState } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type OfertaConfig = { activo: boolean; imagen: string; mensajeWhatsApp: string }

const CAMPO_TEXTO =
	"flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

// Sección de Ajustes del Catálogo para el popup de ofertas (components/OfertaModal).
export function OfertaPopupAjustes() {
	const [config, setConfig] = useState<OfertaConfig>({ activo: false, imagen: "", mensajeWhatsApp: "" })
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [subiendo, setSubiendo] = useState(false)
	const inputArchivo = useRef<HTMLInputElement>(null)

	useEffect(() => {
		fetch("/api/oferta-popup", { cache: "no-store" })
			.then((r) => r.json())
			.then((d) => setConfig({ activo: d.activo === true, imagen: d.imagen || "", mensajeWhatsApp: d.mensajeWhatsApp || "" }))
			.catch((e) => console.error("Error al cargar la oferta:", e))
			.finally(() => setLoading(false))
	}, [])

	async function subirImagen(file: File) {
		setSubiendo(true)
		try {
			const formData = new FormData()
			formData.append("file", file)
			const res = await fetch("/api/upload", { method: "POST", body: formData })
			const texto = await res.text()
			if (!res.ok) {
				let mensaje = texto
				try {
					mensaje = JSON.parse(texto).message || texto
				} catch {}
				throw new Error(mensaje)
			}
			setConfig((prev) => ({ ...prev, imagen: JSON.parse(texto).url }))
		} catch (e: any) {
			alert(`Error al subir la imagen: ${e.message}`)
		} finally {
			setSubiendo(false)
			if (inputArchivo.current) inputArchivo.current.value = ""
		}
	}

	async function guardar() {
		setSaving(true)
		try {
			const res = await fetch("/api/oferta-popup", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(config),
			})
			if (res.ok) alert("Oferta guardada exitosamente")
			else alert(`Error: ${await res.text()}`)
		} catch (e) {
			console.error("Error al guardar la oferta:", e)
			alert("Error al guardar la oferta")
		} finally {
			setSaving(false)
		}
	}

	if (loading) return <p className="mt-10">Cargando oferta...</p>

	return (
		<section className="mt-10">
			<h2 className="text-xl font-bold mb-2">Popup de ofertas</h2>
			<p className="text-gray-600 text-sm mb-6">
				Aparece al entrar a /perfumes con la imagen de la oferta y un botón «Pedir oferta» que abre WhatsApp. Cada cliente lo ve una vez por visita; si cambias la imagen, vuelve a salir.
			</p>

			<div className="space-y-6 border rounded-lg p-6">
				<div className="flex items-center justify-between gap-4">
					<div>
						<div className="text-sm font-medium">Popup de ofertas</div>
						<div className="text-xs text-gray-500">
							{config.activo ? "Activado: aparece al entrar a /perfumes." : "Desactivado: no aparece en el sitio."}
						</div>
					</div>
					<button
						type="button"
						role="switch"
						aria-checked={config.activo}
						onClick={() => setConfig((prev) => ({ ...prev, activo: !prev.activo }))}
						className={`relative w-14 h-8 shrink-0 rounded-full transition-colors ${config.activo ? "bg-green-600" : "bg-[#ccced6]"}`}
						aria-label="Activar o desactivar el popup de ofertas"
					>
						<span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${config.activo ? "translate-x-6" : ""}`} />
					</button>
				</div>

				<div>
					<label className="block text-sm font-medium mb-2">Imagen de la oferta</label>
					{config.imagen ? (
						<div className="relative w-full max-w-xs">
							<img src={config.imagen} alt="Vista previa de la oferta" className="w-full rounded-xl border" />
							<button
								type="button"
								onClick={() => setConfig((prev) => ({ ...prev, imagen: "" }))}
								className="absolute top-2 right-2 grid place-items-center w-8 h-8 rounded-full bg-black/55 text-white hover:bg-black/70"
								aria-label="Quitar imagen"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					) : (
						<button
							type="button"
							onClick={() => inputArchivo.current?.click()}
							disabled={subiendo}
							className="w-full max-w-xs flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors disabled:opacity-60"
						>
							<Upload className="w-6 h-6" />
							<span className="text-sm">{subiendo ? "Subiendo..." : "Haz clic para subir la imagen"}</span>
							<span className="text-xs">JPEG, PNG o WEBP (máx. 10MB)</span>
						</button>
					)}
					<input
						ref={inputArchivo}
						type="file"
						accept="image/jpeg,image/png,image/webp"
						className="hidden"
						onChange={(e) => e.target.files?.[0] && subirImagen(e.target.files[0])}
					/>
					<label className="block text-xs text-gray-500 mt-3 mb-1">O pega la URL de la imagen</label>
					<Input
						value={config.imagen}
						onChange={(e) => setConfig((prev) => ({ ...prev, imagen: e.target.value }))}
						placeholder="https://..."
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-2">Mensaje para WhatsApp</label>
					<textarea
						value={config.mensajeWhatsApp}
						onChange={(e) => setConfig((prev) => ({ ...prev, mensajeWhatsApp: e.target.value }))}
						placeholder="Hola 👋, quiero pedir la oferta que vi en el catálogo."
						className={CAMPO_TEXTO}
						rows={3}
					/>
					<p className="text-xs text-gray-500 mt-1">
						Este texto se escribe automáticamente en WhatsApp cuando el cliente toca &quot;Pedir oferta&quot;.
					</p>
				</div>

				<Button onClick={guardar} disabled={saving || subiendo}>
					{saving ? "Guardando..." : "Guardar oferta"}
				</Button>
			</div>
		</section>
	)
}
