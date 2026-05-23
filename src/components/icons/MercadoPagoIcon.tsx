interface MercadoPagoIconProps {
  className?: string
}

/**
 * Ícono SVG de Mercado Pago.
 * Círculo azul celeste (#009EE3) con dos manos blancas
 * estrechándose en un apretón de manos.
 */
export function MercadoPagoIcon({ className = 'w-12 h-12' }: MercadoPagoIconProps) {
  return (
    <div
      className={`${className} bg-[#009EE3] rounded-full shadow-md flex items-center justify-center hover:scale-105 hover:shadow-lg transition-all duration-300`}
    >
      <svg
        viewBox="0 0 48 48"
        className="w-[65%] h-[65%]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Mano izquierda (viene desde abajo-izquierda, palma hacia arriba) */}
        <path
          d="M4,30 C4,30 6,26 8,24 C9,23 10,23 11,24 L14,27 C14.5,27.5 15.5,27.5 16,27 L20,23 C20.5,22.5 20.5,21.5 20,21 L18,19 C17,18 17,16 18,15 L22,11 C23,10 24.5,10 25.5,11 L27,12.5"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Mano derecha (viene desde arriba-derecha, palma hacia abajo) */}
        <path
          d="M44,18 C44,18 42,22 40,24 C39,25 38,25 37,24 L34,21 C33.5,20.5 32.5,20.5 32,21 L28,25 C27.5,25.5 27.5,26.5 28,27 L30,29 C31,30 31,32 30,33 L26,37 C25,38 23.5,38 22.5,37 L21,35.5"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Punto de apretón central */}
        <circle cx="24" cy="24" r="2.5" fill="white" />
      </svg>
    </div>
  )
}
