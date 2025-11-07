"use client"

import { useState } from "react"
import { ProductCard, type Product } from "@/components/ProductCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function AdminNewPerfumePage() {
	const [form, setForm] = useState<Product>({
		id: "nuevo-perfume",
		name: "BLEU DE CHANEL",
		subtitle: "EAU DE PARFUM",
		brand: "Parma",
		gender: "HOMBRE",
		images: [
			"https://images.unsplash.com/photo-1530639832026-05bafb67fb58?q=80&w=800&auto=format&fit=crop",
			"https://images.unsplash.com/photo-1558862109-d63b5a6c4f3f?q=80&w=800&auto=format&fit=crop",
		],
		sizes: [30, 50, 100],
	})

	return (
		<div className="container mx-auto px-4 py-8 grid gap-8 lg:grid-cols-2">
			<div className="space-y-4">
				<h1 className="text-2xl font-bold">Nuevo perfume</h1>
				<label className="block text-sm font-medium">Nombre</label>
				<Input
					value={form.name}
					onChange={(e) => setForm({ ...form, name: e.target.value })}
				/>
				<label className="block text-sm font-medium">Subtítulo</label>
				<Input
					value={form.subtitle}
					onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
				/>
				<label className="block text-sm font-medium">Imagen 1 (URL)</label>
				<Input
					value={form.images[0]}
					onChange={(e) => setForm({ ...form, images: [e.target.value, form.images[1] ?? ""] })}
				/>
				<label className="block text-sm font-medium">Imagen 2 (URL)</label>
				<Input
					value={form.images[1] ?? ""}
					onChange={(e) => setForm({ ...form, images: [form.images[0], e.target.value] })}
				/>
				<div className="pt-2">
					<Button>Guardar (demo)</Button>
				</div>
			</div>

			<div>
				<h2 className="text-sm font-medium mb-2">Vista previa</h2>
				<ProductCard product={form} />
			</div>
		</div>
	)
}
