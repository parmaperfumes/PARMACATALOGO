// Devuelve el mensaje de error si el SKU ya lo usa otro perfume, o null si está
// libre. Si la consulta falla, devuelve null: el servidor vuelve a validar al guardar.
export async function skuEnUso(sku: string, excluir?: string): Promise<string | null> {
	const limpio = sku.trim()
	if (!limpio) return null
	try {
		const qs = new URLSearchParams({ sku: limpio, ...(excluir ? { excluir } : {}) })
		const res = await fetch(`/api/perfumes/sku?${qs}`, { cache: "no-store" })
		if (!res.ok) return null
		const d = (await res.json()) as { disponible: boolean; usadoPor: string | null }
		if (d.disponible) return null
		return `El SKU ${limpio} ya está en uso${d.usadoPor ? ` por «${d.usadoPor}»` : ""}.`
	} catch {
		return null
	}
}
