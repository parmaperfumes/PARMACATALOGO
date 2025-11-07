"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export type ProductSizeMl = 30 | 50 | 100

export type Product = {
	id: string
	name: string // e.g. BLEU DE CHANEL
	subtitle?: string // e.g. EAU DE PARFUM
	brand?: string // e.g. Parma
	gender?: "HOMBRE" | "MUJER" | "UNISEX"
	images: string[] // at least one
	sizes: ProductSizeMl[]
}

export type ProductCardProps = {
	product: Product
	onAdd?: (payload: { productId: string; size: ProductSizeMl; use: "DIA" | "NOCHE" }) => void
	className?: string
}

export function ProductCard({ product, onAdd, className }: ProductCardProps) {
	const [selectedUse, setSelectedUse] = useState<"DIA" | "NOCHE">("DIA")
	const [selectedSize, setSelectedSize] = useState<ProductSizeMl>(product.sizes[0])

	return (
		<div className={`rounded-2xl overflow-hidden border bg-white ${className ?? ""}`}>
			{/* Header visual sin imágenes */}
			<div className="relative bg-[#2c2f43] text-white p-4 h-24 flex items-start">
				{product.brand ? (
					<div className="text-sm opacity-90 flex items-center gap-2">
						<span className="font-semibold">{product.brand}</span>
					</div>
				) : null}
			</div>

			{/* Info y controles */}
			<div className="p-4 space-y-3">
				<div className="flex items-center gap-2">
					<h3 className="text-xl font-extrabold leading-tight uppercase">
						{product.name}
					</h3>
				</div>
				<div className="flex items-center gap-2">
					<p className="text-sm tracking-wide text-gray-600 uppercase">
						{product.subtitle || "EAU DE PARFUM"}
					</p>
					{product.gender ? (
						<span className="text-[10px] font-bold uppercase bg-red-500 text-white px-2 py-1 rounded-md">
							{product.gender}
						</span>
					) : null}
				</div>

				{/* Uso: Día/Noche */}
				<div className="flex items-center gap-3 text-xs font-semibold">
					<button
						onClick={() => setSelectedUse("DIA")}
						className={`px-3 py-1 rounded-md border ${selectedUse === "DIA" ? "bg-black text-white" : "bg-white"}`}
					>
						DIA
					</button>
					<button
						onClick={() => setSelectedUse("NOCHE")}
						className={`px-3 py-1 rounded-md border ${selectedUse === "NOCHE" ? "bg-black text-white" : "bg-white"}`}
					>
						NOCHE
					</button>
				</div>

				{/* Tamaños */}
				<div className="flex flex-wrap gap-3">
					{product.sizes.map((s) => (
						<button
							key={s}
							onClick={() => setSelectedSize(s)}
							className={`h-10 rounded-full border px-4 text-sm ${selectedSize === s ? "bg-black text-white" : "bg-white"}`}
						>
							{s} ML
						</button>
					))}
				</div>

				{/* CTA */}
				<div className="pt-1">
					<Button
						onClick={() => onAdd?.({ productId: product.id, size: selectedSize, use: selectedUse })}
						className="w-full h-11 rounded-xl text-base"
					>
						AGREGAR
					</Button>
				</div>
			</div>
		</div>
	)
}
