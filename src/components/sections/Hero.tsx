'use client'

import Image from 'next/image'
import { ChevronDown, Sparkles, Truck, Star, Heart, Home } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Beneficio {
  icon: LucideIcon
  texto: string
}

const beneficios: Beneficio[] = [
  { icon: Sparkles, texto: 'Pastas artesanales' },
  { icon: Truck, texto: 'Envío GRATIS con seña' },
  { icon: Star, texto: 'Opiniones reales' },
  { icon: Heart, texto: 'Hecho a mano con amor' },
  { icon: Home, texto: 'De puerta en puerta' },
]

export default function Hero() {
  return (
    <section
      id="inicio"
      className="hero-section relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Parallax Background */}
      <div
        className="parallax-bg absolute inset-0 z-0"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 z-1 bg-black/50" />

      {/* Content */}
      <div className="hero-content relative z-10 flex flex-col items-center text-center px-4 py-16 sm:py-20">
        {/* 1. Logo */}
        <div className="hero-logo mb-3">
          <Image
            src="/images/logo.png"
            alt="Pastas Orlando"
            width={800}
            height={800}
            className="h-96 w-96 sm:h-[28rem] sm:w-[28rem] md:h-[32rem] md:w-[32rem] lg:h-[38rem] lg:w-[38rem] object-contain drop-shadow-2xl hero-logo-img"
            priority
          />
        </div>

        {/* 2. Línea dorada + Título agrupados */}
        <div className="inline-flex flex-col items-center hero-linea-titulo">
          <div className="gold-line-animate h-1.5 bg-mostaza w-full rounded-full hero-linea-dorada" />
          <div className="h-4 sm:h-6 hero-line-gap" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-crema mb-3 whitespace-nowrap hero-titulo">
            Pastas artesanales
          </h1>
        </div>

        {/* 3. Subtítulo */}
        <p className="text-crema/80 text-lg sm:text-xl md:text-2xl font-light mb-10 hero-subtitulo">
          Hechas con amor y tradición
        </p>

        {/* 4. Íconos de beneficios — Mobile: grid 3+2 */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:hidden max-w-sm mx-auto mb-6 hero-iconos-mobile">
          {beneficios.map((b, i) => {
            const Icon = b.icon
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-2 hero-icono-item"
                style={i === 3 ? { gridColumn: '1 / 2' } : i === 4 ? { gridColumn: '3 / 4' } : undefined}
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-mostaza/15 hero-icono-circulo">
                  <Icon className="h-6 w-6 text-mostaza hero-icono-svg" strokeWidth={1.8} />
                </div>
                <span className="text-crema text-center leading-tight text-xs hero-icono-texto">
                  {b.texto}
                </span>
              </div>
            )
          })}
        </div>

        {/* Desktop/Tablet: flex row */}
        <div className="hidden sm:flex sm:flex-row sm:flex-nowrap sm:justify-center sm:gap-6 md:gap-8 lg:gap-12 max-w-4xl mx-auto mb-6 hero-iconos">
          {beneficios.map((b, i) => {
            const Icon = b.icon
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-2.5 flex-shrink-0 hero-icono-item"
              >
                <div className="flex items-center justify-center h-14 w-14 rounded-full bg-mostaza/15 hero-icono-circulo">
                  <Icon className="h-7 w-7 text-mostaza hero-icono-svg" strokeWidth={1.8} />
                </div>
                <span className="text-crema text-center leading-tight max-w-[120px] text-sm hero-icono-texto">
                  {b.texto}
                </span>
              </div>
            )
          })}
        </div>

        {/* 5. Flecha hacia abajo */}
        <a
          href="#productos"
          className="animate-bounce-arrow mt-8 text-mostaza/70 hover:text-mostaza transition-colors hero-flecha"
          aria-label="Ver productos"
        >
          <ChevronDown className="h-8 w-8" />
        </a>
      </div>
    </section>
  )
}
