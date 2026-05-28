'use client'

import { useState } from 'react'

// ==================== Definiciones de capas ====================

export const MAPAS_CAPAS = {
  calle: {
    nombre: 'Calles',
    emoji: '🗺️',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satelite: {
    nombre: 'Satélite',
    emoji: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
  topografico: {
    nombre: 'Relieve',
    emoji: '⛰️',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap | SRTM | OpenTopoMap',
  },
  ciclismo: {
    nombre: 'Ciclismo',
    emoji: '🚴',
    url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    attribution: '&copy; CyclOSM | OpenStreetMap',
  },
} as const

export type CapaKey = keyof typeof MAPAS_CAPAS

// ==================== Componente selector de capas ====================

interface CapasControlProps {
  capaActiva: CapaKey
  onCapaChange: (capa: CapaKey) => void
  /** Compact mode: show only emojis, full label on hover */
  compact?: boolean
}

export default function CapasControl({
  capaActiva,
  onCapaChange,
  compact = false,
}: CapasControlProps) {
  return (
    <div className="absolute top-2 right-2 z-[1000] flex gap-1 rounded-lg bg-white/95 shadow-md p-1 backdrop-blur-sm border border-marron/10">
      {Object.entries(MAPAS_CAPAS).map(([key, capa]) => (
        <button
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
  )
}

// ==================== Hook para manejar capas ====================

export function useCapaMapa(initial: CapaKey = 'calle') {
  const [capaActiva, setCapaActiva] = useState<CapaKey>(initial)

  const capaConfig = MAPAS_CAPAS[capaActiva]

  return {
    capaActiva,
    setCapaActiva,
    capaUrl: capaConfig.url,
    capaAttribution: capaConfig.attribution,
  }
}
