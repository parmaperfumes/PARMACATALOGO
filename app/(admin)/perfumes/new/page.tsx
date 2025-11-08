"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ProductCard, type Product } from "@/components/ProductCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Upload, X } from "lucide-react"

const perfumeSchema = z.object({
	name: z.string().min(2, "El nombre es requerido"),
	subtitle: z.string().optional(),
	gender: z.enum(["HOMBRE", "MUJER", "UNISEX"]).default("HOMBRE"),
	price: z.coerce.number().positive("El precio debe ser mayor a 0"),
	mainImage: z.string().min(1, "La imagen es requerida"),
	stock: z.coerce.number().int().nonnegative().default(0),
	highlight: z.boolean().optional(),
	active: z.boolean().default(true),
	volumen: z.string().optional(),
	notas: z.string().optional(), // comma separated
	size30: z.boolean().default(true),
	size50: z.boolean().default(true),
	size100: z.boolean().default(true),
	categoria: z.string().optional(),
	marca: z.string().optional(),
})

type PerfumeForm = z.infer<typeof perfumeSchema>

export default function AdminNewPerfumePage() {
	const router = useRouter()
	const [uploading, setUploading] = useState(false)
	const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
	const [imageFile, setImageFile] = useState<File | null>(null)
	
	const form = useForm<PerfumeForm>({
		resolver: zodResolver(perfumeSchema),
		defaultValues: {
			name: "BLEU DE CHANEL",
			subtitle: "EAU DE PARFUM",
			gender: "HOMBRE",
			price: 99.9,
			mainImage: "",
			stock: 0,
			highlight: false,
			active: true,
			size30: true,
			size50: true,
			size100: true,
		},
	})

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
					alert(`Error de políticas de seguridad.\n\nPor favor, ejecuta el archivo 'supabase-storage-policies.sql' en Supabase Dashboard > SQL Editor.\n\nO ve a CONFIGURAR_POLITICAS_STORAGE.md para instrucciones detalladas.`)
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

	function clearImage() {
		setImageFile(null)
		setUploadedImageUrl(null)
		form.setValue("mainImage", "")
	}

	const preview: Product = useMemo(() => {
		const values = form.getValues()
		const sizes: Product["sizes"] = [
			values.size30 ? 30 : undefined,
			values.size50 ? 50 : undefined,
			values.size100 ? 100 : undefined,
		].filter(Boolean) as Product["sizes"]

		const imageUrl = uploadedImageUrl || values.mainImage || ""
		const images = imageUrl ? [imageUrl] : []

		// Generar slug automáticamente desde el nombre
		const slug = values.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
		
		return {
			id: slug,
			name: values.name.toUpperCase(),
			subtitle: values.subtitle || "EAU DE PARFUM",
			brand: "Parma", // Marca fija
			gender: values.gender,
			images: images.length ? images : ["https://via.placeholder.com/400"],
			sizes: sizes.length ? sizes : [30, 50, 100],
		}
	}, [form.watch(), uploadedImageUrl])

	async function onSubmit(data: PerfumeForm) {
		// Generar slug automáticamente desde el nombre
		const slug = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
		
		const payload = {
			name: data.name,
			slug: slug,
			precio: data.price,
			imagenPrincipal: data.mainImage,
			imagenes: [data.mainImage],
			stock: data.stock,
			destacado: !!data.highlight,
			activo: !!data.active,
			genero: data.gender,
			volumen: data.volumen,
			notas: data.notas ? data.notas.split(",").map(s => s.trim()) : [],
			categoriaId: data.categoria || undefined,
			marcaId: data.marca || undefined,
			sizes: [data.size30 && 30, data.size50 && 50, data.size100 && 100].filter(Boolean),
		}

		const res = await fetch("/api/perfumes", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		})

		if (res.ok) {
			alert("Perfume guardado exitosamente")
			window.location.href = "/admin"
		} else {
			const msg = await res.text()
			alert(`Error: ${msg}`)
		}
	}

	return (
		<div className="container mx-auto px-4 py-8 grid gap-8 lg:grid-cols-2">
			<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
				<h1 className="text-2xl font-bold">Nuevo Perfume</h1>

				{/* Información Básica */}
				<div className="space-y-4 border-b pb-6">
					<h2 className="text-lg font-semibold">Información Básica</h2>
					
					<div>
						<label className="block text-sm font-medium mb-1">Nombre del Perfume *</label>
						<Input {...form.register("name")} placeholder="Ej: BLEU DE CHANEL" />
						{form.formState.errors.name && (
							<p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Subtítulo/Tipo</label>
						<Input {...form.register("subtitle")} placeholder="Ej: EAU DE PARFUM" />
					</div>
				</div>

				{/* Clasificación */}
				<div className="space-y-4 border-b pb-6">
					<h2 className="text-lg font-semibold">Clasificación</h2>
					
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-1">Género *</label>
							<select className="border rounded-md h-10 px-3 w-full" {...form.register("gender")}>
								<option value="HOMBRE">HOMBRE</option>
								<option value="MUJER">MUJER</option>
								<option value="UNISEX">UNISEX</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Volumen</label>
							<Input {...form.register("volumen")} placeholder="Ej: 50ml, 100ml" />
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Notas Olfativas</label>
						<Input {...form.register("notas")} placeholder="Separadas por coma: cítrico, amaderado, floral" />
					</div>
				</div>

				{/* Imágenes */}
				<div className="space-y-4 border-b pb-6">
					<h2 className="text-lg font-semibold">Imagen</h2>
					
					{/* Opción 1: Subir archivo */}
					<div>
						<label className="block text-sm font-medium mb-2">Subir Imagen *</label>
						{!uploadedImageUrl ? (
							<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
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
										{uploading ? "Subiendo..." : "Haz clic para subir una imagen"}
									</span>
									<span className="text-xs text-gray-500">
										JPEG, PNG o WEBP (máx. 5MB)
									</span>
								</label>
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
					</div>

					{/* Opción 2: URL (alternativa) */}
					<div>
						<label className="block text-sm font-medium mb-1">
							O usar URL de imagen
						</label>
						<Input
							{...form.register("mainImage")}
							placeholder="https://ejemplo.com/imagen.jpg"
							disabled={!!uploadedImageUrl}
							onChange={(e) => {
								if (!uploadedImageUrl) {
									form.setValue("mainImage", e.target.value)
								}
							}}
						/>
						{form.formState.errors.mainImage && (
							<p className="text-xs text-red-500 mt-1">{form.formState.errors.mainImage.message}</p>
						)}
						{uploadedImageUrl && (
							<p className="text-xs text-gray-500 mt-1">
								Desactiva la imagen subida para usar una URL
							</p>
						)}
					</div>
				</div>

				{/* Precio y Stock */}
				<div className="space-y-4 border-b pb-6">
					<h2 className="text-lg font-semibold">Precio y Stock</h2>
					
					<div>
						<label className="block text-sm font-medium mb-1">Precio *</label>
						<Input type="number" step="0.01" {...form.register("price")} />
						{form.formState.errors.price && (
							<p className="text-xs text-red-500 mt-1">{form.formState.errors.price.message}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Stock</label>
						<Input type="number" {...form.register("stock")} />
					</div>
				</div>

				{/* Tamaños Disponibles */}
				<div className="space-y-4 border-b pb-6">
					<h2 className="text-lg font-semibold">Tamaños Disponibles</h2>
					<div className="grid grid-cols-3 gap-3">
						<label className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
							<input type="checkbox" {...form.register("size30")} />
							<span className="text-sm font-medium">30 ML</span>
						</label>
						<label className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
							<input type="checkbox" {...form.register("size50")} />
							<span className="text-sm font-medium">50 ML</span>
						</label>
						<label className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
							<input type="checkbox" {...form.register("size100")} />
							<span className="text-sm font-medium">100 ML</span>
						</label>
					</div>
				</div>

				{/* Opciones Adicionales */}
				<div className="space-y-4">
					<h2 className="text-lg font-semibold">Opciones</h2>
					<div className="grid grid-cols-2 gap-4">
						<label className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
							<input type="checkbox" {...form.register("highlight")} />
							<span className="text-sm">Destacado</span>
						</label>
						<label className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
							<input type="checkbox" defaultChecked {...form.register("active")} />
							<span className="text-sm">Activo</span>
						</label>
					</div>
				</div>

				{/* Botones */}
				<div className="flex gap-4 pt-4">
					<Button 
						type="submit" 
						className="flex-1"
						disabled={uploading || (!form.watch("mainImage") && !uploadedImageUrl)}
					>
						{uploading ? "Subiendo..." : "Guardar Perfume"}
					</Button>
					<Button type="button" variant="outline" onClick={() => router.push("/admin")}>
						Cancelar
					</Button>
				</div>
			</form>

			{/* Vista Previa */}
			<div className="sticky top-4">
				<h2 className="text-lg font-semibold mb-4">Vista Previa</h2>
				<div className="bg-gray-50 p-4 rounded-lg">
					<ProductCard product={preview} />
				</div>
			</div>
		</div>
	)
}
