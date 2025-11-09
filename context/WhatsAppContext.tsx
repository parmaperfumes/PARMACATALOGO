"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

export type CartItem = {
	name: string
	size: number
	use: "DIA" | "NOCHE" | "AMBOS"
}

type WhatsAppContextType = {
	items: CartItem[]
	addItem: (item: CartItem) => void
	removeItem: (item: CartItem) => void
	clearItems: () => void
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined)

export function WhatsAppProvider({ children }: { children: ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([])

	const addItem = (item: CartItem) => {
		setItems((prev) => [...prev, item])
	}

	const removeItem = (itemToRemove: CartItem) => {
		setItems((prev) => 
			prev.filter(
				item => !(
					item.name === itemToRemove.name &&
					item.size === itemToRemove.size &&
					item.use === itemToRemove.use
				)
			)
		)
	}

	const clearItems = () => {
		setItems([])
	}

	return (
		<WhatsAppContext.Provider value={{ items, addItem, removeItem, clearItems }}>
			{children}
		</WhatsAppContext.Provider>
	)
}

export function useWhatsApp() {
	const context = useContext(WhatsAppContext)
	if (context === undefined) {
		// Retornar valores por defecto si el contexto no está disponible
		return {
			items: [],
			addItem: () => {},
			removeItem: () => {},
			clearItems: () => {},
		}
	}
	return context
}

