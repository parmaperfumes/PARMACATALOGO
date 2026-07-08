const MESSAGES = [
	{ emoji: "🚚", text: "ENVÍO GRATIS (ZONA METROPOLITANA)" },
	{ emoji: "💵", text: "PAGO CONTRA ENTREGA" },
]

// Repetimos el set base para llenar pantallas anchas, y luego duplicamos
// la mitad completa para lograr un loop sin salto con translateX(-50%).
const HALF = Array.from({ length: 4 }, () => MESSAGES).flat()
const TRACK = [...HALF, ...HALF]

export function AnnouncementBar() {
	return (
		<div className="announcement-bar" role="region" aria-label="Anuncios">
			<div className="announcement-track" aria-hidden="false">
				{TRACK.map((m, i) => (
					<span className="announcement-item" key={i}>
						<span className="announcement-emoji">{m.emoji}</span>
						{m.text}
					</span>
				))}
			</div>
		</div>
	)
}
