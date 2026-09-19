"use client"

import { useWhatsApp, type CartItem } from "@/context/WhatsAppContext"
import { useRef, useEffect } from "react"
import { nombreDePerfume, precioRD } from "@/lib/formato"
import { IconoCerrar, IconoEnvio, IconoPago, IconoGarantia } from "@/components/IconosParma"

type WhatsAppModalProps = {
	isOpen: boolean
	onClose: () => void
}

// Función para registrar eventos de carrito
async function registrarEventoCarrito(tipo: "click_continuar" | "carrito_abandonado", items: any[]) {
	try {
		await fetch("/api/eventos-carrito", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				tipo,
				cantidadItems: items.length,
				items: items.map(item => ({
					name: item.name,
					size: item.size,
					use: item.use,
				})),
			}),
		})
	} catch (error) {
		console.error("Error al registrar evento de carrito:", error)
	}
}

// Devuelve una miniatura nítida y liviana desde Cloudinary (128px = 58px @2x),
// insertando la transformación tras "/upload/". Si no es Cloudinary, deja la URL igual.
const thumbUrl = (src?: string): string | undefined => {
	if (!src) return src
	const marker = "/upload/"
	const i = src.indexOf(marker)
	if (i === -1) return src
	const after = src.slice(i + marker.length)
	// Evitar duplicar transformación si ya viene con una
	if (/^[a-z]_[^/]+(,[a-z]_[^/]+)*\//.test(after)) return src
	return `${src.slice(0, i + marker.length)}c_fill,w_128,h_128,q_auto,f_auto,dpr_2/${after}`
}

// Precio "1,350 RD" -> 1350
const parsePrice = (s?: string): number => (s ? parseInt(s.replace(/[^\d]/g, ""), 10) || 0 : 0)
// 1350 -> "1,350 RD"
const formatPrice = (n: number): string => `${n.toLocaleString("en-US")} RD`

export function WhatsAppModal({ isOpen, onClose }: WhatsAppModalProps) {
	const { items, addItem, removeItem, clearItems } = useWhatsApp()
	const clickContinuarRef = useRef(false)
	const itemsAlAbrirRef = useRef(0)

	// Guardar la cantidad de items cuando se abre el modal
	useEffect(() => {
		if (isOpen) {
			clickContinuarRef.current = false
			itemsAlAbrirRef.current = items.length
		}
	}, [isOpen, items.length])

	// Detectar cuando se cierra el modal sin hacer clic en continuar
	useEffect(() => {
		return () => {
			if (!isOpen && itemsAlAbrirRef.current > 0 && !clickContinuarRef.current) {
				registrarEventoCarrito("carrito_abandonado", items)
			}
		}
	}, [isOpen, items])

	if (!isOpen) return null

	// Número de WhatsApp: +1 (849) 471-4762
	const phoneNumber = "18494714762"

	// Agrupar items duplicados (mismo nombre, tamaño y uso) mostrando su cantidad
	const groupedItems = items.reduce<Array<CartItem & { quantity: number }>>(
		(acc, item) => {
			const existing = acc.find(g => g.name === item.name && g.size === item.size && g.use === item.use)
			if (existing) {
				existing.quantity += 1
			} else {
				acc.push({ ...item, quantity: 1 })
			}
			return acc
		},
		[]
	)

	const totalUnits = items.length
	const subtotal = groupedItems.reduce((acc, it) => acc + parsePrice(it.price) * it.quantity, 0)

	// Línea de un producto: "Nombre - 100 ML - 1,350 RD  x2"
	const buildItemLine = (item: CartItem & { quantity: number }) => {
		const unit = parsePrice(item.price)
		const priceStr = unit > 0 ? ` - ${formatPrice(unit)}` : ""
		const qtyStr = item.quantity > 1 ? `  x${item.quantity}` : ""
		return `${item.name} - ${item.size} ML${priceStr}${qtyStr}`
	}

	const buildMessage = () => {
		if (items.length === 0) {
			return "Buenas 👋, me gustaria ordenar este perfume:"
		}
		if (groupedItems.length === 1 && groupedItems[0].quantity === 1) {
			return `Buenas 👋, me gustaria ordenar este perfume:\n\n${buildItemLine(groupedItems[0])}\n\n*Total: ${formatPrice(subtotal)}*`
		}
		let message = "Buenas 👋, me gustaria ordenar estos perfumes:\n\n"
		groupedItems.forEach((item) => {
			message += `${buildItemLine(item)}\n`
		})
		message += `\n*Total: ${formatPrice(subtotal)}*`
		return message
	}

	const text = encodeURIComponent(buildMessage())
	const whatsappUrl = `https://wa.me/${phoneNumber}?text=${text}`

	const handleContinue = () => {
		clickContinuarRef.current = true
		registrarEventoCarrito("click_continuar", items).catch(err => {
			console.error("Error al registrar evento (no crítico):", err)
		})
		window.open(whatsappUrl, "_blank")
		clearItems()
		onClose()
	}

	const handleClose = () => {
		if (items.length > 0 && !clickContinuarRef.current) {
			registrarEventoCarrito("carrito_abandonado", items)
		}
		onClose()
	}

	// ---- Vista (brand/parma-manual.html). La lógica de arriba no cambia. ----
	const beneficios = [
		{ icono: <IconoEnvio className="w-5 h-5" />, texto: "Envío gratis en zona metropolitana" },
		{ icono: <IconoPago className="w-5 h-5" />, texto: "Pago contra entrega" },
		{ icono: <IconoGarantia className="w-5 h-5" />, texto: "Garantía de devolución" },
	]

	return (
		// Por encima del botón del juego (z 1000), que antes se metía sobre el total.
		<div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center sm:p-4">
			<div onClick={handleClose} className="pedido-velo absolute inset-0 bg-noche/48 backdrop-blur-sm" />

			{/* En teléfono sube desde abajo como una hoja; en computadora va centrado. */}
			<div className="pedido-hoja relative w-full sm:w-[440px] max-h-[92dvh] bg-white text-noche rounded-t-xl sm:rounded-xl overflow-hidden flex flex-col shadow-[0_-8px_48px_rgba(15,24,33,0.24)]">
				{/* Encabezado */}
				<div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 flex-shrink-0">
					<div>
						<h2 className="font-serif text-2xl font-medium leading-none">Tu pedido</h2>
						<p className="text-xs text-gris mt-2">
							{totalUnits === 0 ? "Todavía vacío" : `${totalUnits} perfume${totalUnits !== 1 ? "s" : ""}`}
						</p>
					</div>
					<button
						onClick={handleClose}
						aria-label="Cerrar"
						className="w-10 h-10 rounded-full bg-niebla flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
					>
						<IconoCerrar />
					</button>
				</div>

				{/* Lista de productos (scroll) */}
				<div className="flex-1 overflow-y-auto min-h-0 border-t border-noche/12">
					{groupedItems.length === 0 ? (
						<div className="px-5 py-12 text-center">
							<p className="font-serif text-xl">Todavía no elegiste perfumes.</p>
							<p className="text-sm text-gris mt-2">Toca «Agregar» en el que te guste y aparece acá.</p>
						</div>
					) : (
						groupedItems.map((item, index) => {
							const unit = parsePrice(item.price)
							const unitOriginal = parsePrice(item.priceOriginal)
							const lineTotal = unit * item.quantity
							const lineOriginal = unitOriginal * item.quantity
							return (
								<div
									key={`${item.name}-${item.size}-${item.use}-${index}`}
									className="flex items-center gap-3 px-5 py-4 border-b border-noche/12 last:border-b-0"
								>
									<div className="w-16 h-16 rounded-xl bg-noche flex-shrink-0 overflow-hidden">
										{item.image ? (
											<img
												src={thumbUrl(item.image)}
												alt=""
												className="w-full h-full object-cover block"
												loading="lazy"
												decoding="async"
											/>
										) : null}
									</div>

									<div className="flex-1 min-w-0">
										<div className="font-serif text-xl font-medium leading-tight truncate">{nombreDePerfume(item.name)}</div>
										<div className="text-xs text-gris mt-1 truncate">
											{[item.gender ? nombreDePerfume(item.gender) : null, `${item.size} ml`].filter(Boolean).join(" · ")}
										</div>

										{/* Un solo control: bajar hasta cero quita el perfume. */}
										<div className="inline-flex items-center gap-1 mt-2 p-0.5 rounded-full bg-niebla">
											<button
												onClick={() => removeItem(item)}
												aria-label={item.quantity === 1 ? "Quitar del pedido" : "Quitar una unidad"}
												className="w-7 h-7 rounded-full bg-white text-noche text-base leading-none flex items-center justify-center active:scale-95 transition-transform"
											>
												−
											</button>
											<span className="min-w-6 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
											<button
												onClick={() => addItem(item)}
												aria-label="Agregar una unidad"
												className="w-7 h-7 rounded-full bg-noche text-white text-base leading-none flex items-center justify-center active:scale-95 transition-transform"
											>
												+
											</button>
										</div>
									</div>

									<div className="text-right flex-shrink-0 tabular-nums">
										{lineOriginal > lineTotal && (
											<div className="text-xs text-gris line-through">{precioRD(formatPrice(lineOriginal))}</div>
										)}
										<div className="text-sm font-semibold">{precioRD(formatPrice(lineTotal))}</div>
									</div>
								</div>
							)
						})
					)}
				</div>

				{/* Beneficios: una sola fila, para dejarle el alto a los perfumes */}
				<div className="grid grid-cols-3 gap-2 px-5 py-4 bg-niebla flex-shrink-0">
					{beneficios.map((b) => (
						<div key={b.texto} className="flex flex-col items-center gap-2 text-center">
							{b.icono}
							<span className="text-xs leading-tight text-noche">{b.texto}</span>
						</div>
					))}
				</div>

				{/* Pie */}
				<div className="px-5 pt-4 pb-[max(16px,env(safe-area-inset-bottom))] flex-shrink-0">
					<div className="flex items-baseline justify-between mb-4">
						<span className="text-sm text-gris">Total</span>
						<span className="text-2xl font-semibold tabular-nums">{precioRD(formatPrice(subtotal))}</span>
					</div>

					<button
						onClick={handleContinue}
						disabled={items.length === 0}
						className={`w-full h-12 rounded-full flex items-center justify-center gap-2 text-sm font-semibold tracking-wide text-white transition-colors ${
							items.length === 0 ? "bg-gris/40 cursor-not-allowed" : "bg-senal hover:bg-senal/90 active:scale-[0.99]"
						}`}
					>
						<span>ENVIAR PEDIDO POR WHATSAPP</span>
						{/* Logo oficial de WhatsApp (asset de marca de Font Awesome brands, sin modificar) */}
						<svg width="20" height="20" viewBox="0 0 448 512" fill="#fff" aria-hidden="true" role="img">
							<path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.2-157zM223.9 438.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
						</svg>
					</button>

					{groupedItems.length > 0 && (
						<button
							onClick={() => {
								clearItems()
								handleClose()
							}}
							className="block mx-auto mt-3 text-xs text-gris underline underline-offset-4"
						>
							Vaciar el pedido
						</button>
					)}
				</div>
			</div>
		</div>
	)
}
