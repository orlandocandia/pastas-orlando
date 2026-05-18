'use client'

import Image from 'next/image'
import { ChevronDown, Phone, Truck } from 'lucide-react'

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

      {/* Dark Overlay */}
      <div className="absolute inset-0 z-1 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 py-20">
        {/* Logo with golden glow */}
        <div className="mb-6">
          <Image
            src="/images/logo.png"
            alt="Pastas Orlando"
            width={160}
            height={160}
            className="h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Title with golden glow */}
        <h1 className="text-gold-glow text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-mostaza mb-4">
          Pastas Orlando
        </h1>

        {/* Animated golden line */}
        <div className="gold-line-animate h-0.5 bg-mostaza max-w-xs mx-auto mb-6" />

        {/* Subtitle */}
        <p className="text-crema text-lg sm:text-xl md:text-2xl font-light mb-3">
          Pastas artesanales hechas con amor y tradición
        </p>

        {/* Additional text */}
        <p className="text-crema/80 text-sm sm:text-base max-w-lg mx-auto mb-8">
          Hecho a mano por una sola persona con amor y maquinaria de verdad
        </p>

        {/* Info Card */}
        <div className="bg-marron/80 backdrop-blur-sm rounded-xl px-6 py-4 sm:px-8 sm:py-5 max-w-md mx-auto border border-mostaza/30">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="h-5 w-5 text-mostaza shrink-0" />
            <span className="text-crema font-medium text-sm sm:text-base">
              Envío gratis dentro de Posadas
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-mostaza shrink-0" />
            <span className="text-crema font-medium text-sm sm:text-base">
              Hacé tu pedido: 3754-419324
            </span>
          </div>
        </div>

        {/* Bouncing Arrow */}
        <a
          href="#productos"
          className="animate-bounce-arrow mt-12 text-mostaza/70 hover:text-mostaza transition-colors"
          aria-label="Ver productos"
        >
          <ChevronDown className="h-8 w-8" />
        </a>
      </div>
    </section>
  )
}
