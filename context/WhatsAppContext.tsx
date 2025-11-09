"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

export type CartItem = {
	name: string
	size: number
	use: "DIA" | "NOCHE"
}

type WhatsAppContextType = {
	items: CartItem[]
	addItem: (item: CartItem) => void
	clearItems: () => void
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined)

export function WhatsAppProvider({ children }: { children: ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([])

	const addItem = (item: CartItem) => {
		setItems((prev) => [...prev, item])
	}

	const clearItems = () => {
		setItems([])
	}

	return (
		<WhatsAppContext.Provider value={{ items, addItem, clearItems }}>
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
			clearItems: () => {},
		}
	}
	return context
}

