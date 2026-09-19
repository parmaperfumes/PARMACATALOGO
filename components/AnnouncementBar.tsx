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
						{m.text}
						{/* Los aros del logo separan los avisos. El emoji del admin ya no se
						    pinta: brand/parma-manual.html, sección 07. */}
						<svg className="announcement-sep" viewBox="0 0 378 245" aria-hidden="true">
							<mask id={`aros-${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width="378" height="245">
								<rect width="378" height="245" fill="#fff" />
								<circle cx="123" cy="122.5" r="109" fill="none" stroke="#000" strokeWidth="59" />
							</mask>
							<g fill="none" stroke="currentColor">
								<circle cx="268" cy="122" r="95.5" strokeWidth="27" mask={`url(#aros-${i})`} />
								<circle cx="123" cy="122.5" r="109" strokeWidth="26" />
							</g>
						</svg>
					</span>
				))}
			</div>
		</div>
	)
}
