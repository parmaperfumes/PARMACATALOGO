import type { Metadata } from "next"

// El login es un componente de cliente y no puede declarar metadata: la pone este layout.
export const metadata: Metadata = {
	title: "Entrar",
	robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return children
}
