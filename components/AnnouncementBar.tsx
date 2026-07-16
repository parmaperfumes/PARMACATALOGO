"use client"

import { useEffect, useState } from "react"

type Announcement = { emoji: string; text: string }

const DEFAULTS: Announcement[] = [
	{ emoji: "🚚", text: "ENVÍO GRATIS (ZONA METROPOLITANA)" },
	{ emoji: "💵", text: "PAGO CONTRA ENTREGA" },
]

export function AnnouncementBar() {
	const [messages, setMessages] = useState<Announcement[]>(DEFAULTS)

	useEffect(() => {
		let cancelled = false
		fetch("/api/header")
			.then((r) => (r.ok ? r.json() : null))
			.then((data) => {
				if (cancelled || !data) return
				const arr: Announcement[] = Array.isArray(data.announcements)
					? data.announcements.filter((a: any) => a && (a.text || a.emoji))
					: []
				if (arr.length > 0) setMessages(arr)
			})
			.catch(() => {})
		return () => {
			cancelled = true
		}
	}, [])

	// Repetimos el set para llenar pantallas anchas y luego duplicamos la mitad
	// completa para lograr un loop sin salto con translateX(-50%).
	const half = Array.from({ length: 4 }, () => messages).flat()
	const track = [...half, ...half]

	return (
		<div className="announcement-bar" role="region" aria-label="Anuncios">
			<div className="announcement-track" aria-hidden="false">
				{track.map((m, i) => (
					<span className="announcement-item" key={i}>
						{m.emoji && <span className="announcement-emoji">{m.emoji}</span>}
						{m.text}
					</span>
				))}
			</div>
		</div>
	)
}
