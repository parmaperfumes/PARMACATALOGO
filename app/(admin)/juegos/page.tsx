import Link from "next/link"

// Hub de juegos del sitio. Por ahora: Ruleta. Se irán agregando más (crucigrama, etc.).
const JUEGOS = [
	{
		nombre: "Ruleta de descuentos",
		descripcion: "“Juega y Gana”: el cliente gira y gana un % de descuento.",
		emoji: "🎡",
		href: "/ruleta",
		disponible: true,
	},
	{
		nombre: "Crucigrama",
		descripcion: "El cliente resuelve un crucigrama y gana un % de descuento.",
		emoji: "🧩",
		href: "/crucigrama",
		disponible: true,
	},
	{
		nombre: "Sopa de letras",
		descripcion: "El cliente encuentra las palabras escondidas y gana un % de descuento.",
		emoji: "🔤",
		href: "/sopa",
		disponible: true,
	},
]

export default function JuegosPage() {
	return (
		<div className="px-8 py-8 max-w-5xl mx-auto">
			<h1 className="text-xl font-bold text-black mb-1">Juegos</h1>
			<p className="text-[13px] text-[#6c6e78] mb-6">
				Administra los juegos del sitio. Entra a cada uno para configurarlo.
			</p>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{JUEGOS.map((j) => {
					const contenido = (
						<>
							<div className="text-3xl mb-2">{j.emoji}</div>
							<div className="text-[15px] font-bold text-black">{j.nombre}</div>
							<div className="text-[12px] text-[#6c6e78] mt-1">{j.descripcion}</div>
							{!j.disponible && (
								<span className="inline-block mt-3 text-[11px] font-semibold text-[#9a9ba3] bg-[#f0f0f2] rounded-full px-2.5 py-1">
									Próximamente
								</span>
							)}
						</>
					)

					return j.disponible ? (
						<Link
							key={j.nombre}
							href={j.href}
							className="block border border-[#ececef] rounded-xl p-5 hover:border-[#16255c] hover:shadow-sm transition-all"
						>
							{contenido}
						</Link>
					) : (
						<div
							key={j.nombre}
							className="block border border-dashed border-[#ececef] rounded-xl p-5 opacity-70 cursor-not-allowed"
						>
							{contenido}
						</div>
					)
				})}
			</div>
		</div>
	)
}
