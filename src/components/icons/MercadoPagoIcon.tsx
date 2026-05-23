interface MercadoPagoIconProps {
  className?: string
}

/**
 * Ícono SVG de Mercado Pago.
 * Representa el isotipo oficial: círculo celeste (#009EE3) con las figuras
 * abstractas blancas que simbolizan la conexión entre comprador y vendedor.
 */
export function MercadoPagoIcon({ className = 'w-8 h-8' }: MercadoPagoIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Círculo principal */}
      <circle cx="24" cy="24" r="24" fill="#009EE3" />
      {/* Figura izquierda (persona abstracta) */}
      <ellipse cx="17" cy="17" rx="4" ry="4.5" fill="white" />
      <path
        d="M10 30c0-4.5 3-8 7-8s7 3.5 7 8"
        fill="white"
      />
      {/* Figura derecha (persona abstracta) */}
      <ellipse cx="31" cy="17" rx="4" ry="4.5" fill="white" />
      <path
        d="M24 30c0-4.5 3-8 7-8s7 3.5 7 8"
        fill="white"
      />
      {/* Manos / apretón central */}
      <path
        d="M20 27c1.5 1.5 3.5 2 4.5 1.5s1.5-2 0-3.5"
        stroke="#009EE3"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M28 27c-1.5 1.5-3.5 2-4.5 1.5s-1.5-2 0-3.5"
        stroke="#009EE3"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
