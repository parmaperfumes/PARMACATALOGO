"use client"

import { SessionProvider } from "next-auth/react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
	if (process.env.NEXT_PUBLIC_ENABLE_AUTH !== "1") {
		return <>{children}</>
	}
	return (
		<SessionProvider basePath="/api/auth" refetchInterval={0} refetchOnWindowFocus={false}>
			{children}
		</SessionProvider>
	)
}

