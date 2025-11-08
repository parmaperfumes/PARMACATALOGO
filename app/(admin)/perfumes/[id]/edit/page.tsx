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
	subtitle: z.string().optional(),
	gender: z.enum(["HOMBRE", "MUJER", "UNISEX"]).default("HOMBRE"),
	price: z.coerce.number().positive(),
	mainImage: z.string().url(),
	stock: z.coerce.number().int().nonnegative().default(0),
	highlight: z.boolean().optional(),
	active: z.boolean().default(true),
	volumen: z.string().optional(),
	size30: z.boolean().default(true),
	size50: z.boolean().default(true),
	size100: z.boolean().default(true),
	usoPorDefecto: z.enum(["DIA", "NOCHE"]).optional(),
})

type FormT = z.infer<typeof schema>

export default function EditPerfumePage() {
	const params = useParams<{ id: string }>()
	const router = useRouter()
	const form = useForm<FormT>({ resolver: zodResolver(schema) })

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
				price: Number(p.precio) || 0,
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

	const preview: Product = useMemo(() => {
		const v = form.getValues()
		const sizes: Product["sizes"] = [v.size30 && 30, v.size50 && 50, v.size100 && 100].filter(Boolean) as any
		return {
			id: "edit",
			name: (v.name || "").toUpperCase(),
			subtitle: v.subtitle || undefined, // Si está vacío (NADA), no mostrar subtítulo
			brand: "Parma",
			gender: v.gender,
			images: [v.mainImage],
			sizes: sizes.length ? sizes : [30, 50, 100],
		}
	}, [form.watch()])
	
	const formValues = form.watch()
	const defaultUse = formValues.usoPorDefecto || "DIA"

	async function onSubmit(data: FormT) {
		// Obtener el slug del perfume actual para no perderlo
		const currentPerfume = await fetch(`/api/perfumes/${params.id}`).then(r => r.json()).catch(() => null)
		const payload: any = {
			name: data.name,
			slug: currentPerfume?.slug || data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
			precio: data.price,
			imagenPrincipal: data.mainImage,
			imagenes: [data.mainImage],
			stock: data.stock,
			destacado: !!data.highlight,
			activo: !!data.active,
			genero: data.gender,
			subtitulo: data.subtitle || null,
			volumen: data.volumen,
			sizes: [data.size30 && 30, data.size50 && 50, data.size100 && 100].filter(Boolean),
		}
		// Solo agregar usoPorDefecto si está definido (no lo guardaremos si la columna no existe)
		// El backend manejará si la columna existe o no
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
					<label className="block text-sm font-medium">Precio</label>
					<Input type="number" step="0.01" {...form.register("price")} />
				</div>
				<div>
					<label className="block text-sm font-medium">Imagen principal (URL)</label>
					<Input {...form.register("mainImage")} />
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
