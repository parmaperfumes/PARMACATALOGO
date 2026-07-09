"use client"

import { useWhatsApp, type CartItem } from "@/context/WhatsAppContext"
import { useRef, useEffect, type CSSProperties } from "react"

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

	const buildMessage = () => {
		if (items.length === 0) {
			return "Buenas 👋, me gustaria ordenar este perfume:"
		}
		if (groupedItems.length === 1 && groupedItems[0].quantity === 1) {
			const item = groupedItems[0]
			return `Buenas 👋, me gustaria ordenar este perfume:\n\n${item.name} - ${item.size} ML`
		}
		let message = "Buenas 👋, me gustaria ordenar estos perfumes:\n\n"
		groupedItems.forEach((item) => {
			message += `${item.name} - ${item.size} ML${item.quantity > 1 ? ` x${item.quantity}` : ""}\n`
		})
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

	// ---- Estilos (valores exactos del diseño) ----
	const NAVY = "linear-gradient(160deg, #16255c 0%, #0d1b3d 100%)"

	const pillBase: CSSProperties = {
		display: "inline-flex",
		alignItems: "center",
		borderRadius: 999,
		fontSize: 9.5,
		fontWeight: 700,
		lineHeight: 1,
		padding: "4px 9px",
		letterSpacing: ".02em",
		whiteSpace: "nowrap",
	}

	const qtyBtn: CSSProperties = {
		width: 26,
		height: 26,
		borderRadius: 999,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		fontSize: 16,
		lineHeight: 1,
		cursor: "pointer",
		flexShrink: 0,
		userSelect: "none",
	}

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 200,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: 16,
			}}
		>
			{/* Backdrop */}
			<div
				onClick={handleClose}
				style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
			/>

			{/* Modal */}
			<div
				style={{
					position: "relative",
					width: 440,
					maxWidth: "calc(100vw - 32px)",
					maxHeight: "92vh",
					background: "#fff",
					borderRadius: 4,
					overflow: "hidden",
					boxShadow: "0 24px 60px -12px rgba(0,0,0,.35)",
					display: "flex",
					flexDirection: "column",
					fontFamily: "Inter, system-ui, sans-serif",
					color: "#111",
				}}
			>
				{/* Header */}
				<div style={{ position: "relative", background: NAVY, padding: "26px 28px 22px", flexShrink: 0 }}>
					<div style={{ fontSize: 24, fontWeight: 700, color: "#fff", lineHeight: 1.15 }}>
						Perfumes Seleccionados
					</div>
					<button
						onClick={handleClose}
						aria-label="Cerrar"
						style={{
							position: "absolute",
							top: 22,
							right: 24,
							width: 32,
							height: 32,
							borderRadius: 999,
							background: "rgba(255,255,255,.12)",
							color: "#fff",
							border: "none",
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 15,
							lineHeight: 1,
						}}
					>
						✕
					</button>
				</div>

				{/* Lista de productos (scroll) */}
				<div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
					{groupedItems.length === 0 ? (
						<div style={{ padding: "40px 28px", textAlign: "center", color: "#9aa0ab", fontSize: 14 }}>
							No hay perfumes seleccionados
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
									style={{
										display: "flex",
										alignItems: "flex-start",
										gap: 14,
										padding: "20px 28px",
										borderBottom: "1px solid #eef0f4",
									}}
								>
									{/* Thumbnail */}
									<div
										style={{
											position: "relative",
											width: 58,
											height: 58,
											borderRadius: 8,
											background: NAVY,
											flexShrink: 0,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											overflow: "hidden",
										}}
									>
										{item.image ? (
											<img
												src={thumbUrl(item.image)}
												alt={item.name}
												style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
												loading="lazy"
												decoding="async"
											/>
										) : (
											<div style={{ width: 20, height: 32, borderRadius: 3, background: "rgba(6,12,32,.75)" }} />
										)}
										{item.tipoLanzamiento && (
											<span
												style={{
													position: "absolute",
													top: 4,
													right: 4,
													background: "#1fb15b",
													color: "#fff",
													fontSize: 7,
													fontWeight: 700,
													letterSpacing: ".03em",
													padding: "2px 4px",
													borderRadius: 4,
													lineHeight: 1,
												}}
											>
												NUEVO
											</span>
										)}
									</div>

									{/* Info */}
									<div style={{ flex: 1, minWidth: 0 }}>
										<div
											style={{
												fontSize: 15,
												fontWeight: 700,
												color: "#111",
												lineHeight: 1.2,
												whiteSpace: "nowrap",
												overflow: "hidden",
												textOverflow: "ellipsis",
											}}
										>
											{item.name}
										</div>

										{/* Pills */}
										<div style={{ display: "flex", gap: 6, margin: "8px 0 10px", flexWrap: "wrap" }}>
											{item.gender && (
												<span style={{ ...pillBase, background: "#fff", color: "#111", border: "1px solid #111" }}>
													{item.gender}
												</span>
											)}
											<span style={{ ...pillBase, background: "#111", color: "#fff", border: "1px solid #111" }}>
												{item.size} ML
											</span>
										</div>

										{/* Selector de cantidad */}
										<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
											<button
												onClick={() => removeItem(item)}
												aria-label="Quitar una unidad"
												style={{ ...qtyBtn, background: "#fff", color: "#111", border: "1px solid #d5d8e0" }}
											>
												−
											</button>
											<span style={{ minWidth: 18, textAlign: "center", fontSize: 14, fontWeight: 700, color: "#111" }}>
												{item.quantity}
											</span>
											<button
												onClick={() => addItem(item)}
												aria-label="Agregar una unidad"
												style={{ ...qtyBtn, background: "#111", color: "#fff", border: "1px solid #111" }}
											>
												+
											</button>
										</div>
									</div>

									{/* Precio + eliminar */}
									<div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
										<div style={{ textAlign: "right" }}>
											{lineOriginal > lineTotal && (
												<div style={{ fontSize: 11.5, color: "#9aa0ab", textDecoration: "line-through", lineHeight: 1.2 }}>
													{formatPrice(lineOriginal)}
												</div>
											)}
											<div style={{ fontSize: 15, fontWeight: 700, color: "#1fb15b", lineHeight: 1.2 }}>
												{formatPrice(lineTotal)}
											</div>
										</div>
										<button
											onClick={() => {
												// Elimina todas las unidades de este ítem
												for (let i = 0; i < item.quantity; i++) removeItem(item)
											}}
											aria-label="Eliminar producto"
											style={{ background: "none", border: "none", color: "#d84a3e", fontSize: 15, lineHeight: 1, cursor: "pointer", padding: 2 }}
										>
											✕
										</button>
									</div>
								</div>
							)
						})
					)}
				</div>

				{/* Beneficios */}
				<div style={{ padding: "18px 28px", display: "flex", flexDirection: "column", gap: 14, flexShrink: 0 }}>
					<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
						<span style={{ width: 30, height: 30, borderRadius: 9, background: "#fdeceb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>🚚</span>
						<span style={{ fontSize: 13.5, fontWeight: 500, color: "#333" }}>Envío gratis (ZONA METROPOLITANA)</span>
					</div>
					<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
						<span style={{ width: 30, height: 30, borderRadius: 9, background: "#fbf3dd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>💵</span>
						<span style={{ fontSize: 13.5, fontWeight: 500, color: "#333" }}>Pago contra entrega</span>
					</div>
					<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
						<span style={{ width: 30, height: 30, borderRadius: 9, background: "#e4f6ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>✅</span>
						<span style={{ fontSize: 13.5, fontWeight: 500, color: "#333" }}>Garantía de devolución de tu dinero</span>
					</div>
				</div>

				{/* Footer */}
				<div style={{ borderTop: "1px solid #eef0f4", padding: "18px 28px 22px", flexShrink: 0 }}>
					{/* Subtotal */}
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
						<span style={{ fontSize: 13, color: "#555" }}>
							Subtotal ({totalUnits} producto{totalUnits !== 1 ? "s" : ""})
						</span>
						<span style={{ fontSize: 20, fontWeight: 700, color: "#1fb15b" }}>{formatPrice(subtotal)}</span>
					</div>

					{/* Borrar todo */}
					{groupedItems.length > 0 && (
						<div style={{ textAlign: "center", marginBottom: 14 }}>
							<button
								onClick={() => {
									clearItems()
									handleClose()
								}}
								style={{
									background: "none",
									border: "none",
									color: "#d84a3e",
									fontSize: 11.5,
									fontWeight: 700,
									letterSpacing: ".04em",
									cursor: "pointer",
									textTransform: "uppercase",
								}}
							>
								🗑 Borrar todo
							</button>
						</div>
					)}

					{/* CTA */}
					<button
						onClick={handleContinue}
						disabled={items.length === 0}
						className="cart-cta"
						style={{
							width: "100%",
							border: "none",
							borderRadius: 999,
							padding: "14px 22px",
							background: items.length === 0 ? "#c7d3cc" : "linear-gradient(180deg, #3aa76a, #2f9660)",
							color: "#fff",
							fontSize: 15,
							fontWeight: 700,
							cursor: items.length === 0 ? "not-allowed" : "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: 10,
						}}
					>
						<span>Enviar pedido a WhatsApp</span>
						{/* Ícono genérico de burbuja de chat (no el logo de WhatsApp) */}
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	)
}
