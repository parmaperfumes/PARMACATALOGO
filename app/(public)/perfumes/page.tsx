import { ProductCard, type Product } from "@/components/ProductCard"

const demoProduct: Product = {
	id: "bleu-chanel",
	name: "BLEU DE CHANEL",
	subtitle: "EAU DE PARFUM",
	brand: "Parma",
	gender: "HOMBRE",
	images: [
		"https://images.unsplash.com/photo-1530639832026-05bafb67fb58?q=80&w=800&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1558862109-d63b5a6c4f3f?q=80&w=800&auto=format&fit=crop",
	],
	sizes: [30, 50, 100],
}

export default function PerfumesPage() {
	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-6">Catálogo de Perfumes</h1>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				<ProductCard product={demoProduct} />
				<ProductCard product={{ ...demoProduct, id: "bleu-2" }} />
				<ProductCard product={{ ...demoProduct, id: "bleu-3" }} />
			</div>
		</div>
	)
}

