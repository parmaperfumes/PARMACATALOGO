"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { ProductCard, type Product } from "@/components/ProductCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const perfumeSchema = z.object({
	name: z.string().min(2, "El nombre es requerido"),
	slug: z.string().min(2, "El slug es requerido"),
	subtitle: z.string().optional(),
	brand: z.string().optional(),
	collection: z.string().optional(), // Colección (ej: "Colección Hombres")
	gender: z.enum(["HOMBRE", "MUJER", "UNISEX"]).default("HOMBRE"),
	description: z.string().optional(),
	price: z.coerce.number().positive("El precio debe ser mayor a 0"),
	discountPrice: z.coerce.number().positive().optional().or(z.literal(0)).transform(v => (v ? v : undefined)),
	mainImage: z.string().url("URL de imagen válida requerida"),
	secondaryImage: z.string().url().optional().or(z.literal("")), // Imagen secundaria (segunda botella)
	gallery: z.string().optional(), // comma separated URLs
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
	const form = useForm<PerfumeForm>({
		resolver: zodResolver(perfumeSchema),
		defaultValues: {
			name: "BLEU DE CHANEL",
			slug: "bleu-de-chanel",
			subtitle: "EAU DE PARFUM",
			brand: "Parma",
			collection: "Colección Hombres",
			gender: "HOMBRE",
			price: 99.9,
			mainImage:
				"https://images.unsplash.com/photo-1530639832026-05bafb67fb58?q=80&w=800&auto=format&fit=crop",
			secondaryImage:
				"https://images.unsplash.com/photo-1558862109-d63b5a6c4f3f?q=80&w=800&auto=format&fit=crop",
			stock: 0,
			highlight: false,
			active: true,
			size30: true,
			size50: true,
			size100: true,
		},
	})

	const preview: Product = useMemo(() => {
		const values = form.getValues()
		const sizes: Product["sizes"] = [
			values.size30 ? 30 : undefined,
			values.size50 ? 50 : undefined,
			values.size100 ? 100 : undefined,
		].filter(Boolean) as Product["sizes"]

		const images = [
			values.mainImage,
			...(values.secondaryImage ? [values.secondaryImage] : []),
			...(values.gallery ? values.gallery.split(",").map(s => s.trim()) : []),
		].filter(Boolean) as string[]

		return {
			id: values.slug,
			name: values.name.toUpperCase(),
			subtitle: values.subtitle || "EAU DE PARFUM",
			brand: values.brand || "Parma",
			gender: values.gender,
			images: images.length ? images : [values.mainImage],
			sizes: sizes.length ? sizes : [30, 50, 100],
		}
	}, [form.watch()])

	async function onSubmit(data: PerfumeForm) {
		const payload = {
			name: data.name,
			slug: data.slug,
			description: data.description,
			precio: data.price,
			precioDescuento: data.discountPrice,
			imagenPrincipal: data.mainImage,
			imagenes: [
				data.mainImage,
				...(data.secondaryImage ? [data.secondaryImage] : []),
				...(data.gallery ? data.gallery.split(",").map(s => s.trim()) : []),
			],
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
						<label className="block text-sm font-medium mb-1">Slug *</label>
						<Input {...form.register("slug")} placeholder="Ej: bleu-de-chanel" />
						{form.formState.errors.slug && (
							<p className="text-xs text-red-500 mt-1">{form.formState.errors.slug.message}</p>
						)}
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-1">Subtítulo/Tipo</label>
							<Input {...form.register("subtitle")} placeholder="Ej: EAU DE PARFUM" />
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Marca</label>
							<Input {...form.register("brand")} placeholder="Ej: Parma" />
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Colección</label>
						<Input {...form.register("collection")} placeholder="Ej: Colección Hombres" />
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
					<h2 className="text-lg font-semibold">Imágenes</h2>
					
					<div>
						<label className="block text-sm font-medium mb-1">Imagen Principal (Botella 1) *</label>
						<Input {...form.register("mainImage")} placeholder="URL de la imagen" />
						{form.formState.errors.mainImage && (
							<p className="text-xs text-red-500 mt-1">{form.formState.errors.mainImage.message}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Imagen Secundaria (Botella 2)</label>
						<Input {...form.register("secondaryImage")} placeholder="URL de la segunda botella" />
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Galería Adicional</label>
						<Input {...form.register("gallery")} placeholder="URLs separadas por coma" />
					</div>
				</div>

				{/* Precio y Stock */}
				<div className="space-y-4 border-b pb-6">
					<h2 className="text-lg font-semibold">Precio y Stock</h2>
					
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-1">Precio *</label>
							<Input type="number" step="0.01" {...form.register("price")} />
							{form.formState.errors.price && (
								<p className="text-xs text-red-500 mt-1">{form.formState.errors.price.message}</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Precio con Descuento</label>
							<Input type="number" step="0.01" {...form.register("discountPrice")} />
						</div>
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

				{/* Descripción */}
				<div className="space-y-4 border-b pb-6">
					<h2 className="text-lg font-semibold">Descripción</h2>
					<div>
						<label className="block text-sm font-medium mb-1">Descripción del Producto</label>
						<textarea 
							className="border rounded-md w-full p-2 min-h-[100px]" 
							{...form.register("description")} 
							placeholder="Describe el perfume..."
						/>
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
					<Button type="submit" className="flex-1">Guardar Perfume</Button>
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
