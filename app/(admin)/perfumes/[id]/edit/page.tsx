"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProductCard, type Product } from "@/components/ProductCard"
import { Upload, X } from "lucide-react"

const schema = z.object({
	name: z.string().min(2),
	sku: z.string().optional(),
	subtitle: z.string().optional(),
	gender: z.enum(["HOMBRE", "MUJER", "UNISEX"]),
	mainImage: z.string().url(),
	stock: z.coerce.number().int().nonnegative(),
	highlight: z.boolean().optional(),
	active: z.boolean(),
	volumen: z.string().optional(),
	size30: z.boolean(),
	size50: z.boolean(),
	precio30: z.string().optional(),
	precio50: z.string().optional(),
	usoPorDefecto: z.enum(["DIA", "NOCHE", "AMBOS"]).optional(),
	tipoLanzamiento: z.enum(["NUEVO", "RESTOCK", "LANZAMIENTO", "NINGUNO"]).optional(),
	fijado: z.boolean().optional(),
	ordenFijado: z.coerce.number().int().nonnegative().optional(),
})

type FormT = {
	name: string
	sku?: string
	subtitle?: string
	gender: "HOMBRE" | "MUJER" | "UNISEX"
	mainImage: string
	stock: number
	highlight?: boolean
	active: boolean
	volumen?: string
	size30: boolean
	size50: boolean
	precio30?: string
	precio50?: string
	usoPorDefecto?: "DIA" | "NOCHE" | "AMBOS"
	tipoLanzamiento?: "NUEVO" | "RESTOCK" | "LANZAMIENTO" | "NINGUNO"
	fijado?: boolean
	ordenFijado?: number
}

export default function EditPerfumePage() {
	const params = useParams<{ id: string }>()
	const router = useRouter()
	const form = useForm<FormT>({ 
		resolver: zodResolver(schema) as any,
		defaultValues: {
			name: "",
			sku: "",
			gender: "HOMBRE" as const,
			mainImage: "",
			stock: 0,
			active: true,
			size30: true,
			size50: true,
			precio30: "850 RD",
			precio50: "1,350 RD",
			fijado: false,
			ordenFijado: 0,
		}
	})
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
				sku: p.sku || "",
				subtitle: p.subtitulo || "",
				gender: (p.genero as any) || "HOMBRE",
				mainImage: p.imagenPrincipal || "",
				stock: p.stock || 0,
				highlight: !!p.destacado,
				active: !!p.activo,
				volumen: p.volumen || "",
				size30: sizes.includes(30),
				size50: sizes.includes(50),
				precio30: p.precio30 || "850 RD",
				precio50: p.precio50 || "1,350 RD",
				usoPorDefecto: (p.usoPorDefecto as "DIA" | "NOCHE" | "AMBOS") || "DIA",
				tipoLanzamiento: (p.tipoLanzamiento as "NUEVO" | "RESTOCK") || "NINGUNO",
				fijado: !!p.fijado,
				ordenFijado: p.ordenFijado || 0,
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

	function clearImage() {
		setImageFile(null)
		setUploadedImageUrl(null)
	}

	const preview: Product = useMemo(() => {
		const v = form.getValues()
		const sizes: Product["sizes"] = [v.size30 && 30, v.size50 && 50].filter(Boolean) as any
		// Priorizar la imagen subida sobre la URL del formulario
		const imageUrl = uploadedImageUrl || v.mainImage || ""
		return {
			id: "edit",
			name: (v.name || "").toUpperCase(),
			subtitle: v.subtitle || undefined,
			brand: "Parma",
			gender: v.gender,
			images: imageUrl ? [imageUrl] : [],
			sizes: sizes.length ? sizes : [30, 50],
			precio30: v.precio30 || null,
			precio50: v.precio50 || null,
			tipoLanzamiento: (v.tipoLanzamiento && v.tipoLanzamiento !== "NINGUNO" ? v.tipoLanzamiento : null) as "NUEVO" | "RESTOCK" | "LANZAMIENTO" | null,
		}
	}, [form.watch(), uploadedImageUrl])
	
	const formValues = form.watch()
	const defaultUse = formValues.usoPorDefecto || "DIA"

	async function onSubmit(data: FormT) {
		// Obtener el slug del perfume actual para no perderlo
		const currentPerfume = await fetch(`/api/perfumes/${params.id}`).then(r => r.json()).catch(() => null)
		const payload: any = {
			name: data.name,
			sku: data.sku || null,
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
			sizes: [data.size30 && 30, data.size50 && 50].filter(Boolean),
			precio30: data.precio30 || null,
			precio50: data.precio50 || null,
			usoPorDefecto: data.usoPorDefecto || null,
			tipoLanzamiento: data.tipoLanzamiento && data.tipoLanzamiento !== "NINGUNO" ? data.tipoLanzamiento : null,
			fijado: !!data.fijado,
			ordenFijado: data.ordenFijado || 0,
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
		<div className="container mx-auto px-4 py-8 max-w-7xl">
			<h1 className="text-2xl font-bold mb-6">Editar perfume</h1>

			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="bg-white border border-[#ececef] rounded-[18px] p-6 md:p-8">
					<div className="grid gap-8 lg:grid-cols-3">
						{/* Contenido del formulario (2/3) */}
						<div className="lg:col-span-2">
							{/* Información Básica — ancho completo, 3 columnas */}
							<div>
								<h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900 mb-3">Información Básica</h2>
								<div className="grid gap-4 md:grid-cols-3">
									<div>
										<label className="block text-sm font-medium mb-1">Nombre del Perfume *</label>
										<Input {...form.register("name")} placeholder="Ej: BLEU DE CHANEL" />
										{form.formState.errors.name && (
											<p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">SKU (Código único)</label>
										<Input {...form.register("sku")} placeholder="Ej: PF-001" />
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">Subtítulo/Tipo</label>
										<select className="border rounded-md h-10 px-3 w-full" {...form.register("subtitle")}>
											<option value="">NADA</option>
											<option value="EAU DE PARFUM">EAU DE PARFUM</option>
											<option value="EAU DE TOILETTE">EAU DE TOILETTE</option>
											<option value="EAU DE COLOGNE">EAU DE COLOGNE</option>
										</select>
									</div>
								</div>
							</div>

							{/* Dos columnas internas */}
							<div className="grid gap-8 md:grid-cols-2 mt-8">
								{/* Columna izquierda: Clasificación + Imagen */}
								<div className="space-y-5">
									<h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">Clasificación</h2>

									<div>
										<label className="block text-sm font-medium mb-1">Género *</label>
										<div className="flex w-full rounded-lg border border-gray-200 bg-gray-100 p-1">
											{(["HOMBRE", "MUJER", "UNISEX"] as const).map((g) => (
												<button
													key={g}
													type="button"
													onClick={() => form.setValue("gender", g)}
													className={`flex-1 h-9 rounded-md text-sm font-medium transition-colors ${
														formValues.gender === g
															? "bg-black text-white shadow-sm"
															: "bg-transparent text-gray-600 hover:text-black"
													}`}
												>
													{g}
												</button>
											))}
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium mb-1">Volumen</label>
											<Input {...form.register("volumen")} placeholder="Ej: 50ml, 100ml" />
										</div>
										<div>
											<label className="block text-sm font-medium mb-1">Stock</label>
											<Input type="number" {...form.register("stock")} />
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium mb-1">Uso por Defecto</label>
											<select className="border rounded-md h-10 px-3 w-full" {...form.register("usoPorDefecto")}>
												<option value="DIA">DIA</option>
												<option value="NOCHE">NOCHE</option>
												<option value="AMBOS">AMBOS</option>
											</select>
										</div>
										<div>
											<label className="block text-sm font-medium mb-1">Etiqueta</label>
											<select className="border rounded-md h-10 px-3 w-full" {...form.register("tipoLanzamiento")}>
												<option value="NINGUNO">Ninguna</option>
												<option value="NUEVO">🔴 MÁS VENDIDO</option>
												<option value="RESTOCK">🔵 RE-STOCK</option>
												<option value="LANZAMIENTO">NUEVO</option>
											</select>
										</div>
									</div>

									{/* Imagen */}
									<div className="pt-1">
										<h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900 mb-3">Imagen</h2>
										{!uploadedImageUrl ? (
											<div
												className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
												onDrop={handleDrop}
												onDragOver={handleDragOver}
											>
												<input
													type="file"
													accept="image/jpeg,image/jpg,image/png,image/webp"
													onChange={handleFileChange}
													disabled={uploading}
													className="hidden"
													id="image-upload"
												/>
												<label
													htmlFor="image-upload"
													className="cursor-pointer flex flex-col items-center gap-2"
												>
													<Upload className="h-8 w-8 text-gray-400" />
													<span className="text-sm text-gray-600">
														{uploading ? "Subiendo..." : "Arrastra una imagen aquí o haz clic para seleccionar"}
													</span>
													<span className="text-xs text-gray-500">
														JPEG, PNG o WEBP (máx. 5MB)
													</span>
												</label>
												{imageFile && (
													<p className="text-xs text-gray-500 mt-2">Archivo: {imageFile.name}</p>
												)}
											</div>
										) : (
											<div className="relative">
												<div className="relative w-full h-48 rounded-lg overflow-hidden border">
													<img
														src={uploadedImageUrl}
														alt="Vista previa"
														className="w-full h-full object-cover"
													/>
													<button
														type="button"
														onClick={clearImage}
														className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
														aria-label="Eliminar imagen"
													>
														<X className="h-4 w-4" />
													</button>
												</div>
												<p className="text-xs text-gray-500 mt-2">Imagen subida correctamente</p>
											</div>
										)}

										<div className="mt-3">
											<label className="block text-sm font-medium mb-1">O usar URL de imagen</label>
											<Input {...form.register("mainImage")} placeholder="https://..." />
											{form.formState.errors.mainImage && (
												<p className="text-xs text-red-500 mt-1">{form.formState.errors.mainImage.message}</p>
											)}
											{uploadedImageUrl && (
												<p className="text-xs text-gray-500 mt-1">
													La imagen subida tiene prioridad sobre la URL
												</p>
											)}
										</div>
									</div>
								</div>

								{/* Columna derecha: Tamaños y Precios + Fijar */}
								<div className="space-y-5">
									<h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">Tamaños y Precios</h2>

									{/* 30 ML */}
									<div className="p-4 border rounded-lg">
										<label className="flex items-center gap-2 cursor-pointer">
											<input type="checkbox" {...form.register("size30")} />
											<span className="text-sm font-bold">30 ML</span>
										</label>
										{form.watch("size30") && (
											<div className="mt-3">
												<label className="block text-sm font-medium mb-1 text-gray-600">Precio (texto visible en la tarjeta)</label>
												<Input
													{...form.register("precio30")}
													placeholder="Ej: 850 RD"
												/>
											</div>
										)}
									</div>

									{/* 50 ML */}
									<div className="p-4 border rounded-lg">
										<label className="flex items-center gap-2 cursor-pointer">
											<input type="checkbox" {...form.register("size50")} />
											<span className="text-sm font-bold">50 ML</span>
										</label>
										{form.watch("size50") && (
											<div className="mt-3">
												<label className="block text-sm font-medium mb-1 text-gray-600">Precio (texto visible en la tarjeta)</label>
												<Input
													{...form.register("precio50")}
													placeholder="Ej: 1,350 RD"
												/>
											</div>
										)}
									</div>

									{/* Fijar en Catálogo */}
									<div>
										<h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900 mb-3">Fijar en Catálogo</h2>
										<label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
											<input type="checkbox" {...form.register("fijado")} className="w-5 h-5 accent-blue-600" />
											<div>
												<span className="text-sm font-bold">📌 Fijar este perfume</span>
												<p className="text-xs text-gray-500">Aparecerá siempre al inicio del catálogo y no se mueve de posición</p>
											</div>
										</label>
										{form.watch("fijado") && (
											<div className="mt-3">
												<label className="block text-sm font-medium mb-1 text-gray-600">Orden de posición (menor = más arriba)</label>
												<Input
													type="number"
													{...form.register("ordenFijado")}
													placeholder="Ej: 1, 2, 3..."
													min={0}
												/>
												<p className="text-xs text-gray-400 mt-1">Los perfumes fijados se ordenan por este número (1 primero, 2 segundo, etc.)</p>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Vista Previa (columna derecha, junto a Información Básica) */}
						<div>
							<h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900 mb-3">Vista Previa</h2>
							<div className="bg-gray-50 p-4 rounded-lg lg:sticky lg:top-4">
								<div className="max-w-sm mx-auto w-full">
									<ProductCard product={preview} defaultUse={defaultUse} fixedUse={true} />
								</div>
							</div>
						</div>
					</div>

					{/* Botones */}
					<div className="border-t border-[#ececef] mt-8 pt-5 flex justify-end gap-3">
						<Button type="button" variant="outline" onClick={() => router.push("/admin")} disabled={uploading}>
							Cancelar
						</Button>
						<Button
							type="submit"
							className="bg-black hover:bg-gray-800 text-white"
							disabled={uploading}
						>
							{uploading ? "Guardando..." : "Guardar cambios"}
						</Button>
					</div>
				</div>
			</form>
		</div>
	)
}
