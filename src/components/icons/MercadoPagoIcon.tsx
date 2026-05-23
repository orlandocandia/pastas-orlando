interface MercadoPagoIconProps {
  className?: string
}

/**
 * Ícono SVG de Mercado Pago.
 * Representa el isotipo oficial: óvalo azul celeste (#009EE3) con dos manos
 * blancas estrechándose en un apretón de manos.
 */
export function MercadoPagoIcon({ className = 'w-8 h-8' }: MercadoPagoIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fondo ovalado azul */}
      <rect x="0" y="0" width="48" height="40" rx="20" fill="#009EE3" />

      {/* Brazo izquierdo (muñeca que viene desde la izquierda) */}
      <path
        d="M2,22 L9,17 C10,16.5 11.5,17 12,18 L12,22 C12,23 11,24 10,23.5 L5,21.5 L2,22Z"
        fill="white"
      />

      {/* Mano izquierda (4 dedos que se extienden hacia la derecha) */}
      <path
        d="M10,15 C11.5,14 13.5,14 15,15 L18,17.5 C18.5,18 18.5,19 18,19.5 L14,22 C12.5,23 10.5,23 9,22 L9,18.5 C9,17 9.5,15.5 10,15Z"
        fill="white"
      />

      {/* Brazo derecho (muñeca que viene desde la derecha) */}
      <path
        d="M46,18 L39,23 C38,23.5 36.5,23 36,22 L36,18 C36,17 37,16 38,16.5 L43,18.5 L46,18Z"
        fill="white"
      />

      {/* Mano derecha (4 dedos que se extienden hacia la izquierda) */}
      <path
        d="M38,25 C36.5,26 34.5,26 33,25 L30,22.5 C29.5,22 29.5,21 30,20.5 L34,18 C35.5,17 37.5,17 39,18 L39,21.5 C39,23 38.5,24.5 38,25Z"
        fill="white"
      />

      {/* Pulgar izquierdo (se curva sobre la mano derecha) */}
      <path
        d="M12,14.5 C13,13.5 14.5,13.5 15.5,14.5 L18,17 C18.5,17.5 18,18.5 17.5,18 L14.5,16 C14,15.5 13,15.5 12.5,16 L12,14.5Z"
        fill="white"
        opacity="0.9"
      />

      {/* Pulgar derecho (se curva sobre la mano izquierda) */}
      <path
        d="M36,25.5 C35,26.5 33.5,26.5 32.5,25.5 L30,23 C29.5,22.5 30,21.5 30.5,22 L33.5,24 C34,24.5 35,24.5 35.5,24 L36,25.5Z"
        fill="white"
        opacity="0.9"
      />

      {/* Líneas de separación entre dedos (mano izquierda) */}
      <line x1="12" y1="16.5" x2="15" y2="19.5" stroke="#009EE3" strokeWidth="0.6" opacity="0.5" />
      <line x1="14" y1="15.5" x2="16.5" y2="18.5" stroke="#009EE3" strokeWidth="0.6" opacity="0.5" />

      {/* Líneas de separación entre dedos (mano derecha) */}
      <line x1="36" y1="23.5" x2="33" y2="20.5" stroke="#009EE3" strokeWidth="0.6" opacity="0.5" />
      <line x1="34" y1="24.5" x2="31.5" y2="21.5" stroke="#009EE3" strokeWidth="0.6" opacity="0.5" />
    </svg>
  )
}
