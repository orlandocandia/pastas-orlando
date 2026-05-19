'use client'

import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
})

// Custom red marker icon for selection
const selectionIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42">
    <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.716 23.284 0 15 0z" fill="#e11d48"/>
    <circle cx="15" cy="14" r="6" fill="white"/>
  </svg>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -42],
  className: '',
})

interface SelectorUbicacionProps {
  onLocationSelect: (lat: number, lng: number) => void
  latitudInicial?: number
  longitudInicial?: number
}

function LocationMarker({
  position,
  setPosition,
  onLocationSelect,
}: {
  position: [number, number] | null
  setPosition: (pos: [number, number]) => void
  onLocationSelect: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      setPosition([lat, lng])
      onLocationSelect(lat, lng)
    },
  })

  if (!position) return null

  return (
    <Marker position={position} icon={selectionIcon}>
      <Popup>
        <strong>📍 Ubicación seleccionada</strong>
        <br />
        Lat: {position[0].toFixed(6)}
        <br />
        Lng: {position[1].toFixed(6)}
      </Popup>
    </Marker>
  )
}

export default function SelectorUbicacion({
  onLocationSelect,
  latitudInicial,
  longitudInicial,
}: SelectorUbicacionProps) {
  const defaultCenter: [number, number] = [-27.3666, -55.8969] // Posadas, Misiones

  const initialPosition =
    latitudInicial != null && longitudInicial != null
      ? ([latitudInicial, longitudInicial] as [number, number])
      : null

  const [position, setPosition] = useState<[number, number] | null>(initialPosition)

  const center: [number, number] = initialPosition ?? defaultCenter

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">
        📍 Hacé clic en el mapa para marcar la ubicación exacta
      </p>
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '300px', width: '100%', borderRadius: '8px', zIndex: 0 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          position={position}
          setPosition={setPosition}
          onLocationSelect={onLocationSelect}
        />
      </MapContainer>
    </div>
  )
}
