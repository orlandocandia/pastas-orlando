'use client'

import { useState } from 'react'

// ==================== Definiciones de capas ====================
// Orden: Satélite (más clara) → Calles → Relieve → Ciclismo

export const MAPAS_CAPAS = {
  satelite: {
    nombre: 'Satélite',
    emoji: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    fallbackUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    fallbackAttribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  },
  calle: {
    nombre: 'Calles',
    emoji: '🗺️',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://www.hotosm.org/">HOT</a>',
    fallbackUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    fallbackAttribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  },
  topografico: {
    nombre: 'Relieve',
    emoji: '⛰️',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap | SRTM | OpenTopoMap',
    fallbackUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    fallbackAttribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  },
  ciclismo: {
    nombre: 'Ciclismo',
    emoji: '🚴',
    url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    attribution: '&copy; CyclOSM | OpenStreetMap',
    fallbackUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    fallbackAttribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  },
} as const

export type CapaKey = keyof typeof MAPAS_CAPAS

// ==================== Componente selector de capas ====================

interface CapasControlProps {
  capaActiva: CapaKey
  onCapaChange: (capa: CapaKey) => void
  /** Compact mode: show only emojis, full label on hover */
  compact?: boolean
  /** Whether fallback is currently active */
  usandoFallback?: boolean
}

export default function CapasControl({
  capaActiva,
  onCapaChange,
  compact = false,
  usandoFallback = false,
}: CapasControlProps) {
  return (
    <div className="absolute top-2 right-2 z-[1000] flex flex-col gap-1 rounded-lg bg-white/95 shadow-md p-1 backdrop-blur-sm border border-marron/10">
      <div className="flex gap-1">
        {Object.entries(MAPAS_CAPAS).map(([key, capa]) => (
          <button
            type="button"
            key={key}
            onClick={() => onCapaChange(key as CapaKey)}
            className={`px-2 py-1 text-xs rounded-md transition-all ${
              capaActiva === key
                ? 'bg-mostaza text-marron font-semibold shadow-sm'
                : 'bg-transparent text-gray-600 hover:bg-muted'
            }`}
            title={capa.nombre}
          >
            {compact ? (
              <span>{capa.emoji}</span>
            ) : (
              <span>
                {capa.emoji} {capa.nombre}
              </span>
            )}
          </button>
        ))}
      </div>
      {usandoFallback && (
        <div className="text-[10px] text-amber-700 bg-amber-50 rounded px-2 py-0.5 text-center">
          Capa alternativa activa
        </div>
      )}
    </div>
  )
}

// ==================== Hook para manejar capas ====================

export function useCapaMapa(initial: CapaKey = 'satelite') {
  const [capaActiva, setCapaActiva] = useState<CapaKey>(initial)
  const [usandoFallback, setUsandoFallback] = useState(false)

  const capaConfig = MAPAS_CAPAS[capaActiva]

  const handleCapaChange = (capa: CapaKey) => {
    setCapaActiva(capa)
    setUsandoFallback(false) // Reset fallback when changing layers
  }

  const activarFallback = () => {
    setUsandoFallback(true)
  }

  return {
    capaActiva,
    setCapaActiva: handleCapaChange,
    capaUrl: usandoFallback ? capaConfig.fallbackUrl : capaConfig.url,
    capaAttribution: usandoFallback ? capaConfig.fallbackAttribution : capaConfig.attribution,
    usandoFallback,
    activarFallback,
  }
}
