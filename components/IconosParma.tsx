// Los íconos propios de Parma (brand/parma-manual.html, sección 10). Trazo parejo,
// puntas redondas y formas hechas de aros, como el logo. No se mezclan con
// íconos de librería en la misma fila.

type IconoProps = { className?: string }

const Trazo = ({ className, children }: IconoProps & { children: React.ReactNode }) => (
	<svg
		viewBox="0 0 24 24"
		className={className ?? "w-4 h-4"}
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		{children}
	</svg>
)

export const IconoDia = (p: IconoProps) => (
	<Trazo {...p}>
		<circle cx="12" cy="12" r="4.5" />
		<path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
	</Trazo>
)

// La misma media luna que se forma en el logo donde el aro chico cruza al grande.
export const IconoNoche = (p: IconoProps) => (
	<Trazo {...p}>
		<path d="M9.1 5.23A8 8 0 1 0 18.77 14.9 7 7 0 0 1 9.1 5.23Z" />
	</Trazo>
)

// Un aro con su pico: el globo de conversación, en el trazo de la casa.
export const IconoWhatsApp = (p: IconoProps) => (
	<Trazo {...p}>
		<path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.9L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5Z" />
	</Trazo>
)

export const IconoHombre = (p: IconoProps) => (
	<Trazo {...p}>
		<circle cx="10" cy="14" r="6" />
		<path d="M14.3 9.7 20 4M15 4h5v5" />
	</Trazo>
)

export const IconoMujer = (p: IconoProps) => (
	<Trazo {...p}>
		<circle cx="12" cy="9" r="6" />
		<path d="M12 15v6.5M9 18.5h6" />
	</Trazo>
)

export const IconoUnisex = (p: IconoProps) => (
	<Trazo {...p}>
		<circle cx="11" cy="11.5" r="5" />
		<path d="M14.6 7.9 19.5 3M15.5 3h4v4M11 16.5v5M8.5 19h5" />
	</Trazo>
)

// --- Carrito ---

export const IconoCerrar = (p: IconoProps) => (
	<Trazo {...p}>
		<path d="M6 6l12 12M18 6 6 18" />
	</Trazo>
)

export const IconoEnvio = (p: IconoProps) => (
	<Trazo {...p}>
		<path d="M2.5 6.5h11v10h-11zM13.5 9.5h4l3 3.5v3.5h-7" />
		<circle cx="7" cy="17.5" r="2" />
		<circle cx="17" cy="17.5" r="2" />
	</Trazo>
)

export const IconoPago = (p: IconoProps) => (
	<Trazo {...p}>
		<rect x="2.5" y="6.5" width="19" height="11" rx="2" />
		<circle cx="12" cy="12" r="2.5" />
		<path d="M6 12h.01M18 12h.01" />
	</Trazo>
)

export const IconoGarantia = (p: IconoProps) => (
	<Trazo {...p}>
		<circle cx="12" cy="12" r="9" />
		<path d="m8 12.5 2.8 2.8L16 9.5" />
	</Trazo>
)
