'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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
}

export default function MapaLeaflet({
  latitud,
  longitud,
  titulo,
  direccion,
  altura = '300px',
}: MapaLeafletProps) {
  return (
    <MapContainer
      center={[latitud, longitud]}
      zoom={15}
      style={{ height: altura, width: '100%', borderRadius: '8px', zIndex: 0 }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitud, longitud]}>
        <Popup>
          <strong>{titulo}</strong>
          <br />
          {direccion}
        </Popup>
      </Marker>
    </MapContainer>
  )
}
