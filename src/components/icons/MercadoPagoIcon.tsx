interface MercadoPagoIconProps {
  className?: string
}

/**
 * Ícono SVG de Mercado Pago.
 * Representa el isotipo oficial: círculo azul celeste (#009EE3) con dos manos
 * blancas estrechándose en un apretón de manos firme y claro.
 */
export function MercadoPagoIcon({ className = 'w-8 h-8' }: MercadoPagoIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Círculo de fondo azul celeste */}
      <circle cx="24" cy="24" r="24" fill="#009EE3" />

      {/* Brazo izquierdo (muñeca que ingresa desde la izquierda) */}
      <path
        d="M0,28 L8,24 C9,23.5 10,24 10.5,25 L10.5,28 C10.5,29 9.5,30 8.5,29.5 L0,28Z"
        fill="white"
      />

      {/* Mano izquierda: palma y dedos que envuelven por debajo */}
      <path
        d="M8,22 C10,20.5 13,20 15.5,21 L22,24 C23,24.5 23,26 22,26.5 L15,29 C13,29.8 10.5,29 9,27.5 L8,26.5 C7,25.5 7,23 8,22Z"
        fill="white"
      />

      {/* Brazo derecho (muñeca que ingresa desde la derecha) */}
      <path
        d="M48,20 L40,24 C39,24.5 38,24 37.5,23 L37.5,20 C37.5,19 38.5,18 39.5,18.5 L48,20Z"
        fill="white"
      />

      {/* Mano derecha: palma y dedos que envuelven por arriba */}
      <path
        d="M40,26 C38,27.5 35,28 32.5,27 L26,24 C25,23.5 25,22 26,21.5 L33,19 C35,18.2 37.5,19 39,20.5 L40,21.5 C41,22.5 41,25 40,26Z"
        fill="white"
      />

      {/* Dedos de la mano izquierda (líneas de separación) */}
      <path d="M12,22.5 C13,21.5 14.5,21.5 15.5,22.5" stroke="#009EE3" strokeWidth="0.7" opacity="0.4" />
      <path d="M14,23.5 C15,22.5 16.5,22.5 17.5,23.5" stroke="#009EE3" strokeWidth="0.7" opacity="0.4" />
      <path d="M16,24.5 C17,23.5 18.5,23.5 19.5,24.5" stroke="#009EE3" strokeWidth="0.7" opacity="0.4" />

      {/* Dedos de la mano derecha (líneas de separación) */}
      <path d="M36,25.5 C35,26.5 33.5,26.5 32.5,25.5" stroke="#009EE3" strokeWidth="0.7" opacity="0.4" />
      <path d="M34,24.5 C33,25.5 31.5,25.5 30.5,24.5" stroke="#009EE3" strokeWidth="0.7" opacity="0.4" />
      <path d="M32,23.5 C31,24.5 29.5,24.5 28.5,23.5" stroke="#009EE3" strokeWidth="0.7" opacity="0.4" />
    </svg>
  )
}
