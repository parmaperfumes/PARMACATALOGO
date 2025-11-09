"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProductCard, type Product } from "@/components/ProductCard"
import { Upload } from "lucide-react"

const schema = z.object({
	name: z.string().min(2),
	subtitle: z.string().optional(),
	gender: z.enum(["HOMBRE", "MUJER", "UNISEX"]).default("HOMBRE"),
	mainImage: z.string().url(),
	stock: z.coerce.number().int().nonnegative().default(0),
	highlight: z.boolean().optional(),
	active: z.boolean().default(true),
	volumen: z.string().optional(),
	size30: z.boolean().default(true),
	size50: z.boolean().default(true),
	size100: z.boolean().default(true),
	usoPorDefecto: z.enum(["DIA", "NOCHE", "AMBOS"]).optional(),
})

type FormT = z.infer<typeof schema>

export default function EditPerfumePage() {
	const params = useParams<{ id: string }>()
	const router = useRouter()
	const form = useForm<FormT>({ resolver: zodResolver(schema) })
	const [uploading, setUploading] = useState(false)
	const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
	const [imageFile, setImageFile] = useState<File | null>(null)

	useEffect(() => {
		async function load() {
			try {
				const res = await fetch(`/api/perfumes/${params.id}`)
				if (!res.ok) {
					const errorText = await res.text()
					console.error("Error al cargar perfume:", res.status, errorText)
					let errorMessage = "No se pudo cargar el perfume"
					if (res.status === 501 || errorText.includes("DB no configurada") || errorText.includes("DATABASE_URL")) {
						errorMessage = `Error de configuración (${res.status}): ${errorText}\n\nPor favor, verifica:\n1. Que DATABASE_URL esté en .env.local\n2. Que el servidor se haya reiniciado después de agregar la variable\n3. Abre http://localhost:3001/api/test-db para verificar la conexión`
					} else if (res.status === 404 || errorText.includes("No encontrado") || errorText.includes("404")) {
						errorMessage = "Perfume no encontrado"
					} else if (errorText.includes("Can't reach") || errorText.includes("connection")) {
						errorMessage = "No se puede conectar a la base de datos. Verifica que el proyecto de Supabase esté activo (no pausado)."
					} else {
						errorMessage = `Error (${res.status}): ${errorText}`
					}
					alert(errorMessage)
					return
				}
				const p = await res.json()
			// Cargar los tamaños desde la base de datos
			const sizes = p.sizes || []
			form.reset({
				name: p.nombre || "",
				subtitle: p.subtitulo || "",
				gender: (p.genero as any) || "HOMBRE",
				mainImage: p.imagenPrincipal || "",
				stock: p.stock || 0,
				highlight: !!p.destacado,
				active: !!p.activo,
				volumen: p.volumen || "",
				size30: sizes.includes(30),
				size50: sizes.includes(50),
				size100: sizes.includes(100),
				usoPorDefecto: (p.usoPorDefecto as "DIA" | "NOCHE") || "DIA",
			})
			} catch (error: any) {
				console.error("Error al cargar perfume:", error)
				alert(`Error al cargar el perfume: ${error.message || "Error desconocido"}`)
			}
		}
		load()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params.id])

	async function handleFileUpload(file: File) {
		setUploading(true)
		setImageFile(file)
		
		try {
			const formData = new FormData()
			formData.append("file", file)

			const res = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			})

			if (!res.ok) {
				const errorText = await res.text()
				let errorData
				try {
					errorData = JSON.parse(errorText)
				} catch {
					errorData = { message: errorText }
				}

				// Si hay error de RLS o políticas
				if (errorData.needsManualSetup || errorText.includes("row-level security") || errorText.includes("policy") || errorText.includes("RLS")) {
					alert(`Error de políticas de seguridad.\n\nPor favor, ejecuta el archivo 'supabase-storage-policies.sql' en Supabase Dashboard > SQL Editor.`)
					throw new Error("Políticas de seguridad no configuradas")
				}
				
				// Si el bucket no existe, intentar crearlo
				if (errorData.needsSetup || errorText.includes("bucket") || errorText.includes("Bucket")) {
					const setupRes = await fetch("/api/setup-bucket", {
						method: "POST",
					})
					
					const setupData = await setupRes.json()
					
					if (setupRes.ok && setupData.success) {
						// Reintentar la subida
						const retryRes = await fetch("/api/upload", {
							method: "POST",
							body: formData,
						})
						
						if (retryRes.ok) {
							const retryData = await retryRes.json()
							setUploadedImageUrl(retryData.url)
							form.setValue("mainImage", retryData.url)
							return
						} else {
							const retryError = await retryRes.text()
							throw new Error(`Error después de crear el bucket: ${retryError}`)
						}
					} else {
						throw new Error(setupData.message || "No se pudo crear el bucket. Por favor, créalo manualmente desde el dashboard de Supabase.")
					}
				} else {
					throw new Error(errorData.message || errorText || "Error al subir la imagen")
				}
			}

			const data = await res.json()
			setUploadedImageUrl(data.url)
			form.setValue("mainImage", data.url)
		} catch (error: any) {
			alert(`Error al subir imagen: ${error.message}`)
			setImageFile(null)
		} finally {
			setUploading(false)
		}
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		if (file) {
			handleFileUpload(file)
		}
	}

	function handleDrop(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault()
		const file = e.dataTransfer.files?.[0]
		if (file && file.type.startsWith("image/")) {
			handleFileUpload(file)
		}
	}

	function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault()
	}

	const preview: Product = useMemo(() => {
		const v = form.getValues()
		const sizes: Product["sizes"] = [v.size30 && 30, v.size50 && 50, v.size100 && 100].filter(Boolean) as any
		// Priorizar la imagen subida sobre la URL del formulario
		const imageUrl = uploadedImageUrl || v.mainImage || ""
		return {
			id: "edit",
			name: (v.name || "").toUpperCase(),
			subtitle: v.subtitle || undefined, // Si está vacío (NADA), no mostrar subtítulo
			brand: "Parma",
			gender: v.gender,
			images: imageUrl ? [imageUrl] : [],
			sizes: sizes.length ? sizes : [30, 50, 100],
		}
	}, [form.watch(), uploadedImageUrl])
	
	const formValues = form.watch()
	const defaultUse = formValues.usoPorDefecto || "DIA"

	async function onSubmit(data: FormT) {
		// Obtener el slug del perfume actual para no perderlo
		const currentPerfume = await fetch(`/api/perfumes/${params.id}`).then(r => r.json()).catch(() => null)
		const payload: any = {
			name: data.name,
			slug: currentPerfume?.slug || data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
			precio: currentPerfume?.precio || 0, // Mantener el precio existente o usar 0 por defecto
			imagenPrincipal: data.mainImage,
			imagenes: [data.mainImage],
			stock: data.stock,
			destacado: !!data.highlight,
			activo: !!data.active,
			genero: data.gender,
			subtitulo: data.subtitle || null,
			volumen: data.volumen,
			sizes: [data.size30 && 30, data.size50 && 50, data.size100 && 100].filter(Boolean),
			usoPorDefecto: data.usoPorDefecto || null,
		}
		const res = await fetch(`/api/perfumes/${params.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		})
		if (res.ok) router.push("/admin")
		else alert(await res.text())
	}

	return (
		<div className="container mx-auto px-4 py-8 grid gap-8 lg:grid-cols-2">
			<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
				<h1 className="text-2xl font-bold">Editar perfume</h1>
				<label className="block text-sm font-medium">Nombre</label>
				<Input {...form.register("name")} />
				<label className="block text-sm font-medium">Subtítulo/Tipo</label>
				<select className="border rounded-md h-10 px-3 w-full" {...form.register("subtitle")}>
					<option value="">NADA</option>
					<option value="EAU DE PARFUM">EAU DE PARFUM</option>
					<option value="EAU DE TOILETTE">EAU DE TOILETTE</option>
					<option value="EAU DE COLOGNE">EAU DE COLOGNE</option>
				</select>
				<label className="block text-sm font-medium">Género</label>
				<select className="border rounded-md h-10 px-3" {...form.register("gender")}>
					<option value="HOMBRE">HOMBRE</option>
					<option value="MUJER">MUJER</option>
					<option value="UNISEX">UNISEX</option>
				</select>
				<div>
					<label className="block text-sm font-medium mb-2">Imagen Principal</label>
					
					{/* Opción de subir archivo */}
					<div 
						className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4 hover:border-gray-400 transition-colors"
						onDrop={handleDrop}
						onDragOver={handleDragOver}
					>
						<Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
						<p className="text-sm text-gray-600 mb-2">
							Arrastra una imagen aquí o haz clic para seleccionar
						</p>
						<label className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer">
							{uploading ? "Subiendo..." : "Seleccionar archivo"}
							<input
								type="file"
								accept="image/*"
								onChange={handleFileChange}
								className="hidden"
								disabled={uploading}
							/>
						</label>
						{imageFile && (
							<p className="text-xs text-gray-500 mt-2">Archivo: {imageFile.name}</p>
						)}
					</div>

					{/* O URL de imagen */}
					<div>
						<label className="block text-sm font-medium mb-1">O URL de imagen</label>
						<Input {...form.register("mainImage")} placeholder="https://..." />
						{form.formState.errors.mainImage && (
							<p className="text-xs text-red-500 mt-1">{form.formState.errors.mainImage.message}</p>
						)}
						{(uploadedImageUrl || form.getValues("mainImage")) && (
							<p className="text-xs text-gray-500 mt-1">
								La imagen subida tiene prioridad sobre la URL
							</p>
						)}
					</div>
				</div>
				<div className="grid grid-cols-3 gap-3">
					<label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("size30")} /> 30 ML</label>
					<label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("size50")} /> 50 ML</label>
					<label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("size100")} /> 100 ML</label>
				</div>
				<div className="grid grid-cols-3 gap-4">
					<div>
						<label className="block text-sm font-medium">Stock</label>
						<Input type="number" {...form.register("stock")} />
					</div>
					<label className="flex items-center gap-2 text-sm mt-6"><input type="checkbox" {...form.register("highlight")} /> Destacado</label>
					<label className="flex items-center gap-2 text-sm mt-6"><input type="checkbox" {...form.register("active")} /> Activo</label>
				</div>
				<div className="space-y-4 border-t pt-4">
					<h3 className="text-sm font-semibold">Configuración de Uso (DIA/NOCHE)</h3>
					<div>
						<label className="block text-sm font-medium mb-2">Uso por Defecto</label>
						<select className="border rounded-md h-10 px-3 w-full" {...form.register("usoPorDefecto")}>
							<option value="DIA">DIA</option>
							<option value="NOCHE">NOCHE</option>
							<option value="AMBOS">AMBOS</option>
						</select>
					</div>
				</div>
				<div className="pt-2"><Button type="submit">Guardar cambios</Button></div>
			</form>
			<div>
				<h2 className="text-sm font-medium mb-2">Vista previa</h2>
				<div className="max-w-sm mx-auto w-full">
					<ProductCard product={preview} defaultUse={defaultUse} />
				</div>
			</div>
		</div>
	)
}
