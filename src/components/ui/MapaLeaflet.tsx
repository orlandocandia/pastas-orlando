'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
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
  const { capaActiva, setCapaActiva, capaUrl, capaAttribution } = useCapaMapa(capaInicial)

  return (
    <div className="relative">
      <MapContainer
        center={[latitud, longitud]}
        zoom={zoom}
        style={{ height: altura, width: '100%', borderRadius: '8px', zIndex: 0 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          key={capaActiva}
          attribution={capaAttribution}
          url={capaUrl}
        />
        <Marker position={[latitud, longitud]}>
          <Popup>
            <strong>{titulo}</strong>
            <br />
            {direccion}
          </Popup>
        </Marker>
      </MapContainer>

      {mostrarCapas && (
        <CapasControl capaActiva={capaActiva} onCapaChange={setCapaActiva} />
      )}
    </div>
  )
}
