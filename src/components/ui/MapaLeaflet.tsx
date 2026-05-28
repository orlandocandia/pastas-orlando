'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import CapasControl, { useCapaMapa, type CapaKey } from '@/components/ui/CapasControl'

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MapaLeafletProps {
  latitud: number
  longitud: number
  titulo: string
  direccion: string
  altura?: string
  zoom?: number
  /** Initial map layer */
  capaInicial?: CapaKey
  /** Show layer selector control */
  mostrarCapas?: boolean
}

// ---------------------------------------------------------------------------
// TileErrorHandler – detects tile load errors and activates fallback
// ---------------------------------------------------------------------------

function TileErrorHandler({
  onTileError,
}: {
  onTileError: () => void
}) {
  const map = useMap()
  const errorCountRef = useRef(0)
  const triggeredRef = useRef(false)

  useEffect(() => {
    errorCountRef.current = 0
    triggeredRef.current = false

    const handleTileError = () => {
      if (triggeredRef.current) return
      errorCountRef.current += 1
      if (errorCountRef.current >= 3) {
        triggeredRef.current = true
        onTileError()
      }
    }

    map.on('tileerror', handleTileError)
    return () => {
      map.off('tileerror', handleTileError)
    }
  }, [map, onTileError])

  return null
}

// ---------------------------------------------------------------------------
// MapaLeaflet component
// ---------------------------------------------------------------------------

export default function MapaLeaflet({
  latitud,
  longitud,
  titulo,
  direccion,
  altura = '300px',
  zoom = 15,
  capaInicial = 'calle',
  mostrarCapas = true,
}: MapaLeafletProps) {
  const { capaActiva, setCapaActiva, capaUrl, capaAttribution, usandoFallback, activarFallback } = useCapaMapa(capaInicial)

  const layerKey = `${capaActiva}-${usandoFallback}`
  const [tileStatus, setTileStatus] = useState<{ layerKey: string; status: 'loading' | 'loaded' | 'error' }>({
    layerKey,
    status: 'loading',
  })

  // Reset tile status when layer changes (React-recommended pattern for deriving state)
  if (tileStatus.layerKey !== layerKey) {
    setTileStatus({ layerKey, status: 'loading' })
  }

  const tilesLoaded = tileStatus.status === 'loaded'
  const tileError = tileStatus.status === 'error'

  const handleTileError = useCallback(() => {
    if (!usandoFallback) {
      activarFallback()
    } else {
      setTileStatus((prev) => prev.layerKey === layerKey ? { ...prev, status: 'error' } : prev)
    }
  }, [usandoFallback, activarFallback, layerKey])

  return (
    <div className="relative">
      <MapContainer
        center={[latitud, longitud]}
        zoom={zoom}
        style={{ height: altura, width: '100%', borderRadius: '8px', zIndex: 0 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          key={`${capaActiva}-${usandoFallback}`}
          attribution={capaAttribution}
          url={capaUrl}
          eventHandlers={{
            load: () => setTileStatus((prev) => prev.layerKey === layerKey ? { ...prev, status: 'loaded' } : prev),
            tileerror: handleTileError,
          }}
        />

        <TileErrorHandler onTileError={handleTileError} />

        <Marker position={[latitud, longitud]}>
          <Popup>
            <strong>{titulo}</strong>
            <br />
            {direccion}
          </Popup>
        </Marker>
      </MapContainer>

      {/* Loading overlay */}
      {!tilesLoaded && !tileError && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center bg-crema/80 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-mostaza border-t-transparent" />
            <span className="text-sm text-marron font-medium">Cargando mapa...</span>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {tileError && (
        <div className="absolute bottom-2 left-2 z-[999] flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 shadow-md px-3 py-2">
          <span className="text-amber-600 text-sm">⚠️</span>
          <span className="text-xs text-amber-800">
            Error al cargar tiles del mapa. Intentá cambiar de capa.
          </span>
        </div>
      )}

      {mostrarCapas && (
        <CapasControl capaActiva={capaActiva} onCapaChange={setCapaActiva} usandoFallback={usandoFallback} />
      )}
    </div>
  )
}
