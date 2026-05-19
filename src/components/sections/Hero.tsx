'use client'

import Image from 'next/image'
import { ChevronDown } from 'lucide-react'

const beneficios = [
  { emoji: '🍝✨', texto: 'Pastas artesanales' },
  { emoji: '🚚💛', texto: 'Envío GRATIS con seña' },
  { emoji: '⭐', texto: 'Opiniones reales' },
  { emoji: '👨‍🍳❤️', texto: 'Hecho a mano con amor' },
  { emoji: '🚪🏠', texto: 'De puerta en puerta' },
]

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Parallax Background */}
      <div
        className="parallax-bg absolute inset-0 z-0"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />

      {/* Dark Overlay - 50% black for legibility */}
      <div className="absolute inset-0 z-1 bg-black/50" />

      {/* Content - pushed lower with pt-32 */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-32 sm:pt-36 md:pt-40 pb-20">
        {/* 1. Logo grande (3x) */}
        <div className="mb-2">
          <Image
            src="/images/logo.png"
            alt="Pastas Orlando"
            width={480}
            height={480}
            className="h-56 w-56 sm:h-72 sm:w-72 md:h-80 md:w-80 lg:h-96 lg:w-96 object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* 2. Línea dorada decorativa debajo del logo */}
        <div className="gold-line-animate h-1.5 bg-mostaza w-48 sm:w-64 md:w-72 lg:w-80 mx-auto rounded-full" />

        {/* 3. Espacio */}
        <div className="h-6 sm:h-8" />

        {/* 4. Título principal */}
        <h1 className="text-gold-glow text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-mostaza mb-3">
          Pastas artesanales
        </h1>

        {/* 5. Subtítulo */}
        <p className="text-crema text-lg sm:text-xl md:text-2xl font-light mb-10">
          Hechas con amor y tradición
        </p>

        {/* 6. Íconos de beneficios - SIEMPRE horizontal en desktop, 3+2 en mobile */}
        {/* Mobile: grid 3+2 */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:hidden max-w-sm mx-auto mb-6">
          {beneficios.map((b, i) => (
            <div
              key={i}
              className={`flex flex-col items-center gap-2 ${i >= 3 ? 'col-start-1' : ''}`}
              style={i === 3 ? { gridColumn: '1 / 2' } : i === 4 ? { gridColumn: '3 / 4' } : undefined}
            >
              <span
                className="drop-shadow-lg select-none"
                style={{ fontSize: '2.5rem', lineHeight: 1 }}
              >
                {b.emoji}
              </span>
              <span
                className="text-crema text-center leading-tight"
                style={{ fontSize: '0.75rem' }}
              >
                {b.texto}
              </span>
            </div>
          ))}
        </div>

        {/* Desktop/Tablet: flex row, SIEMPRE en una sola fila */}
        <div className="hidden sm:flex sm:flex-row sm:flex-nowrap sm:justify-center sm:gap-6 md:gap-8 lg:gap-12 max-w-4xl mx-auto mb-6">
          {beneficios.map((b, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <span
                className="drop-shadow-lg select-none"
                style={{ fontSize: '3rem', lineHeight: 1 }}
              >
                {b.emoji}
              </span>
              <span
                className="text-crema text-center leading-tight max-w-[120px]"
                style={{ fontSize: '0.8rem' }}
              >
                {b.texto}
              </span>
            </div>
          ))}
        </div>

        {/* 8. Flecha hacia abajo */}
        <a
          href="#productos"
          className="animate-bounce-arrow mt-8 text-mostaza/70 hover:text-mostaza transition-colors"
          aria-label="Ver productos"
        >
          <ChevronDown className="h-8 w-8" />
        </a>
      </div>
    </section>
  )
}
