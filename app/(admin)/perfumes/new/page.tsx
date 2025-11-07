"use client"

import { useEffect, useMemo, useState } from "react"
import { ProductCard, type Product } from "@/components/ProductCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const perfumeSchema = z.object({
	name: z.string().min(2),
	slug: z.string().min(2),
	subtitle: z.string().optional(),
	brand: z.string().optional(),
	gender: z.enum(["HOMBRE", "MUJER", "UNISEX"]).default("HOMBRE"),
	description: z.string().optional(),
	price: z.coerce.number().positive(),
	discountPrice: z.coerce.number().positive().optional().or(z.literal(0)).transform(v => (v ? v : undefined)),
	mainImage: z.string().url(),
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
	const form = useForm<PerfumeForm>({
		resolver: zodResolver(perfumeSchema),
		defaultValues: {
			name: "BLEU DE CHANEL",
			slug: "bleu-de-chanel",
			subtitle: "EAU DE PARFUM",
			brand: "Parma",
			gender: "HOMBRE",
			price: 99.9,
			mainImage:
				"https://images.unsplash.com/photo-1530639832026-05bafb67fb58?q=80&w=800&auto=format&fit=crop",
			gallery:
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

		const images = [values.mainImage, ...(values.gallery ? values.gallery.split(",").map(s => s.trim()) : [])].filter(
			(Boolean as unknown) as (v: string) => v is string
		)

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
			imagenes: [data.mainImage, ...(data.gallery ? data.gallery.split(",").map(s => s.trim()) : [])],
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
			alert("Perfume guardado (si hay DB configurada).")
		} else {
			const msg = await res.text()
			alert(`No se pudo guardar: ${msg}`)
		}
	}

	return (
		<div className="container mx-auto px-4 py-8 grid gap-8 lg:grid-cols-2">
			<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
				<h1 className="text-2xl font-bold">Nuevo perfume</h1>

				<div>
					<label className="block text-sm font-medium">Nombre</label>
					<Input {...form.register("name")} />
				</div>

				<div>
					<label className="block text-sm font-medium">Slug</label>
					<Input {...form.register("slug")} />
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium">Subtítulo</label>
						<Input {...form.register("subtitle")} />
					</div>
					<div>
						<label className="block text-sm font-medium">Marca</label>
						<Input {...form.register("brand")} />
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium">Género</label>
						<select className="border rounded-md h-10 px-3" {...form.register("gender")}>
							<option value="HOMBRE">HOMBRE</option>
							<option value="MUJER">MUJER</option>
							<option value="UNISEX">UNISEX</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium">Volumen (texto)</label>
						<Input {...form.register("volumen")} placeholder="50ml, 100ml" />
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium">Descripción</label>
					<textarea className="border rounded-md w-full p-2" rows={4} {...form.register("description")} />
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium">Precio</label>
						<Input type="number" step="0.01" {...form.register("price")} />
					</div>
					<div>
						<label className="block text-sm font-medium">Precio descuento</label>
						<Input type="number" step="0.01" {...form.register("discountPrice")} />
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium">Imagen principal (URL)</label>
						<Input {...form.register("mainImage")} />
					</div>
					<div>
						<label className="block text-sm font-medium">Galería (URLs separadas por coma)</label>
						<Input {...form.register("gallery")} />
					</div>
				</div>

				<div className="grid grid-cols-3 gap-3">
					<label className="flex items-center gap-2 text-sm">
						<input type="checkbox" {...form.register("size30")} /> 30 ML
					</label>
					<label className="flex items-center gap-2 text-sm">
						<input type="checkbox" {...form.register("size50")} /> 50 ML
					</label>
					<label className="flex items-center gap-2 text-sm">
						<input type="checkbox" {...form.register("size100")} /> 100 ML
					</label>
				</div>

				<div className="grid grid-cols-3 gap-4">
					<div>
						<label className="block text-sm font-medium">Stock</label>
						<Input type="number" {...form.register("stock")} />
					</div>
					<label className="flex items-center gap-2 text-sm mt-6">
						<input type="checkbox" {...form.register("highlight")} /> Destacado
					</label>
					<label className="flex items-center gap-2 text-sm mt-6">
						<input type="checkbox" defaultChecked {...form.register("active")} /> Activo
					</label>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium">Notas (separadas por coma)</label>
						<Input {...form.register("notas")} placeholder="cítrico, amaderado" />
					</div>
					<div>
						<label className="block text-sm font-medium">Categoría ID (opcional)</label>
						<Input {...form.register("categoria")} />
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium">Marca ID (opcional)</label>
						<Input {...form.register("marca")} />
					</div>
				</div>

				<div className="pt-2">
					<Button type="submit">Guardar</Button>
				</div>
			</form>

			<div>
				<h2 className="text-sm font-medium mb-2">Vista previa</h2>
				<ProductCard product={preview} />
			</div>
		</div>
	)
}
