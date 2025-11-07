"use client"

import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProductCard, type Product } from "@/components/ProductCard"

const schema = z.object({
	name: z.string().min(2),
	slug: z.string().min(2),
	subtitle: z.string().optional(),
	brand: z.string().optional(),
	gender: z.enum(["HOMBRE", "MUJER", "UNISEX"]).default("HOMBRE"),
	description: z.string().optional(),
	price: z.coerce.number().positive(),
	discountPrice: z.coerce.number().positive().optional().or(z.literal(0)).transform(v => (v ? v : undefined)),
	mainImage: z.string().url(),
	gallery: z.string().optional(),
	stock: z.coerce.number().int().nonnegative().default(0),
	highlight: z.boolean().optional(),
	active: z.boolean().default(true),
	volumen: z.string().optional(),
	notas: z.string().optional(),
	size30: z.boolean().default(true),
	size50: z.boolean().default(true),
	size100: z.boolean().default(true),
})

type FormT = z.infer<typeof schema>

export default function EditPerfumePage() {
	const params = useParams<{ id: string }>()
	const router = useRouter()
	const form = useForm<FormT>({ resolver: zodResolver(schema) })

	useEffect(() => {
		async function load() {
			const res = await fetch(`/api/perfumes/${params.id}`)
			if (!res.ok) {
				alert("No se pudo cargar el perfume (¿tienes DB configurada?)")
				return
			}
			const p = await res.json()
			form.reset({
				name: p.nombre,
				slug: p.slug,
				subtitle: undefined,
				brand: undefined,
				gender: (p.genero as any) || "HOMBRE",
				description: p.descripcion || "",
				price: Number(p.precio),
				discountPrice: p.precioDescuento || undefined,
				mainImage: p.imagenPrincipal,
				gallery: (p.imagenes || []).slice(1).join(", "),
				stock: p.stock || 0,
				highlight: !!p.destacado,
				active: !!p.activo,
				volumen: p.volumen || "",
				notas: (p.notas || []).join(", "),
				size30: true,
				size50: true,
				size100: true,
			})
		}
		load()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params.id])

	const preview: Product = useMemo(() => {
		const v = form.getValues()
		const sizes: Product["sizes"] = [v.size30 && 30, v.size50 && 50, v.size100 && 100].filter(Boolean) as any
		const images = [v.mainImage, ...(v.gallery ? v.gallery.split(",").map((s) => s.trim()) : [])].filter(Boolean) as string[]
		return {
			id: v.slug || "edit",
			name: (v.name || "").toUpperCase(),
			subtitle: v.subtitle || "EAU DE PARFUM",
			brand: v.brand || "Parma",
			gender: v.gender,
			images: images.length ? images : [v.mainImage],
			sizes: sizes.length ? sizes : [30, 50, 100],
		}
	}, [form.watch()])

	async function onSubmit(data: FormT) {
		const payload = {
			name: data.name,
			slug: data.slug,
			description: data.description,
			precio: data.price,
			precioDescuento: data.discountPrice,
			imagenPrincipal: data.mainImage,
			imagenes: [data.mainImage, ...(data.gallery ? data.gallery.split(",").map((s) => s.trim()) : [])],
			stock: data.stock,
			destacado: !!data.highlight,
			activo: !!data.active,
			genero: data.gender,
			volumen: data.volumen,
			notas: data.notas ? data.notas.split(",").map((s) => s.trim()) : [],
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
				<label className="block text-sm font-medium">Slug</label>
				<Input {...form.register("slug")} />
				<label className="block text-sm font-medium">Subtítulo</label>
				<Input {...form.register("subtitle")} />
				<label className="block text-sm font-medium">Marca</label>
				<Input {...form.register("brand")} />
				<label className="block text-sm font-medium">Género</label>
				<select className="border rounded-md h-10 px-3" {...form.register("gender")}>
					<option value="HOMBRE">HOMBRE</option>
					<option value="MUJER">MUJER</option>
					<option value="UNISEX">UNISEX</option>
				</select>
				<label className="block text-sm font-medium">Descripción</label>
				<textarea className="border rounded-md w-full p-2" rows={4} {...form.register("description")} />
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
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium">Notas (coma)</label>
						<Input {...form.register("notas")} />
					</div>
				</div>
				<div className="pt-2"><Button type="submit">Guardar cambios</Button></div>
			</form>
			<div>
				<h2 className="text-sm font-medium mb-2">Vista previa</h2>
				<ProductCard product={preview} />
			</div>
		</div>
	)
}
