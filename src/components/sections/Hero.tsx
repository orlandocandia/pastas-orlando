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

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 py-20">
        {/* Enlarged Logo */}
        <div className="mb-2">
          <Image
            src="/images/logo.png"
            alt="Pastas Orlando"
            width={240}
            height={240}
            className="h-44 w-44 sm:h-52 sm:w-52 md:h-60 md:w-60 object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Animated golden line under the logo (subrayado) */}
        <div className="gold-line-animate h-1 bg-mostaza w-48 sm:w-56 md:w-64 mx-auto mb-8 rounded-full" />

        {/* Main Title */}
        <h1 className="text-gold-glow text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-mostaza mb-3">
          Pastas artesanales
        </h1>

        {/* Subtitle */}
        <p className="text-crema text-lg sm:text-xl md:text-2xl font-light mb-10">
          Hechas con amor y tradición
        </p>

        {/* Benefit Icons */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-6 sm:gap-x-8 md:gap-x-10 max-w-2xl mx-auto mb-6">
          {beneficios.map((b, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 w-[90px] sm:w-auto"
            >
              <span
                className="drop-shadow-lg select-none"
                style={{ fontSize: '3rem', lineHeight: 1 }}
              >
                {b.emoji}
              </span>
              <span
                className="text-crema text-center leading-tight"
                style={{ fontSize: '0.8rem' }}
              >
                {b.texto}
              </span>
            </div>
          ))}
        </div>

        {/* Bouncing Arrow */}
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
