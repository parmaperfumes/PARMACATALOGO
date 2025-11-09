"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X, Upload } from "lucide-react"

type NavLink = {
	label: string
	href: string
}

type HeaderConfig = {
	logoText: string
	logoImage: string | null
	navLinks: NavLink[]
}

export default function HeaderEditPage() {
	const [config, setConfig] = useState<HeaderConfig>({
		logoText: "parma",
		logoImage: null,
		navLinks: [
			{ label: "Catálogo", href: "/perfumes" },
			{ label: "Garantía", href: "/garantia" },
		],
	})
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [uploading, setUploading] = useState(false)

	useEffect(() => {
		async function loadConfig() {
			try {
				const res = await fetch("/api/header")
				if (res.ok) {
					const data = await res.json()
					setConfig(data)
				}
			} catch (error) {
				console.error("Error al cargar configuración:", error)
			} finally {
				setLoading(false)
			}
		}
		loadConfig()
	}, [])

	async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		if (!file) return

		setUploading(true)
		try {
			const formData = new FormData()
			formData.append("file", file)

			const res = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			})

			if (res.ok) {
				const data = await res.json()
				setConfig((prev) => ({ ...prev, logoImage: data.url }))
			} else {
				alert("Error al subir la imagen")
			}
		} catch (error) {
			console.error("Error al subir imagen:", error)
			alert("Error al subir la imagen")
		} finally {
			setUploading(false)
		}
	}

	function addNavLink() {
		setConfig((prev) => ({
			...prev,
			navLinks: [...prev.navLinks, { label: "", href: "" }],
		}))
	}

	function removeNavLink(index: number) {
		setConfig((prev) => ({
			...prev,
			navLinks: prev.navLinks.filter((_, i) => i !== index),
		}))
	}

	function updateNavLink(index: number, field: "label" | "href", value: string) {
		setConfig((prev) => ({
			...prev,
			navLinks: prev.navLinks.map((link, i) =>
				i === index ? { ...link, [field]: value } : link
			),
		}))
	}

	async function handleSave() {
		setSaving(true)
		try {
			const res = await fetch("/api/header", {
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
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<h1 className="text-2xl font-bold mb-6">Editar Header</h1>

			<div className="space-y-6">
				{/* Logo */}
				<div className="border rounded-lg p-6 space-y-4">
					<h2 className="text-lg font-semibold">Logo</h2>

					{/* Logo Text */}
					<div>
						<label className="block text-sm font-medium mb-2">Texto del Logo</label>
						<Input
							value={config.logoText}
							onChange={(e) => setConfig((prev) => ({ ...prev, logoText: e.target.value }))}
							placeholder="parma"
						/>
					</div>

					{/* Logo Image */}
					<div>
						<label className="block text-sm font-medium mb-2">Imagen del Logo (URL o subir archivo)</label>
						<p className="text-xs text-gray-500 mb-2">
							💡 <strong>Eliminación automática de fondo:</strong> Si subes un logo con fondo blanco, el sistema lo eliminará automáticamente. También puedes subir PNG con transparencia o SVG.
						</p>
						<div className="flex gap-2">
							<Input
								value={config.logoImage || ""}
								onChange={(e) => setConfig((prev) => ({ ...prev, logoImage: e.target.value || null }))}
								placeholder="https://... o sube un archivo"
								className="flex-1"
							/>
							<label className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer flex items-center gap-2">
								<Upload className="w-4 h-4" />
								{uploading ? "Subiendo..." : "Subir"}
								<input
									type="file"
									accept="image/png,image/svg+xml,image/jpeg,image/webp"
									onChange={handleImageUpload}
									className="hidden"
									disabled={uploading}
								/>
							</label>
						</div>
						{config.logoImage && (
							<div className="mt-4 p-4 bg-gray-50 rounded-lg border">
								<p className="text-xs text-gray-600 mb-2">Vista Previa:</p>
								<img 
									src={config.logoImage} 
									alt="Logo preview" 
									className="h-20 w-auto object-contain"
									style={{ maxHeight: '80px' }}
								/>
							</div>
						)}
					</div>
				</div>

				{/* Navegación */}
				<div className="border rounded-lg p-6 space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">Enlaces de Navegación</h2>
						<Button type="button" onClick={addNavLink} variant="outline" size="sm">
							<Plus className="w-4 h-4 mr-2" />
							Agregar Enlace
						</Button>
					</div>

					<div className="space-y-3">
						{config.navLinks.map((link, index) => (
							<div key={index} className="flex gap-2 items-start">
								<div className="flex-1 grid grid-cols-2 gap-2">
									<Input
										placeholder="Etiqueta (ej: Catálogo)"
										value={link.label}
										onChange={(e) => updateNavLink(index, "label", e.target.value)}
									/>
									<Input
										placeholder="URL (ej: /perfumes)"
										value={link.href}
										onChange={(e) => updateNavLink(index, "href", e.target.value)}
									/>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => removeNavLink(index)}
									className="text-red-600 hover:text-red-700"
								>
									<X className="w-4 h-4" />
								</Button>
							</div>
						))}
					</div>
				</div>

				{/* Guardar */}
				<div className="flex justify-end">
					<Button onClick={handleSave} disabled={saving}>
						{saving ? "Guardando..." : "Guardar Cambios"}
					</Button>
				</div>
			</div>
		</div>
	)
}

