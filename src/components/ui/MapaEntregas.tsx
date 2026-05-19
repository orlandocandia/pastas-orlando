'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { isToday, isTomorrow, parseISO } from 'date-fns'

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
})

// Custom colored marker icons for deliveries
function createColoredIcon(color: string): L.DivIcon {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42">
      <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.716 23.284 0 15 0z" fill="${color}"/>
      <circle cx="15" cy="14" r="6" fill="white"/>
    </svg>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42],
    className: '',
  })
}

const redIcon = createColoredIcon('#dc2626')     // Today
const yellowIcon = createColoredIcon('#eab308')   // Tomorrow
const greenIcon = createColoredIcon('#16a34a')    // Other

interface Entrega {
  id: number
  nombre: string
  latitud: number | null
  longitud: number | null
  direccion: string
  fecha_entrega: string
  estado: string
}

function getMarkerIcon(fechaEntrega: string): L.DivIcon {
  try {
    const fecha = parseISO(fechaEntrega)
    if (isToday(fecha)) return redIcon
    if (isTomorrow(fecha)) return yellowIcon
    return greenIcon
  } catch {
    return greenIcon
  }
}

export default function MapaEntregas() {
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEntregas() {
      try {
        const res = await fetch('/api/logistica/mapa/entregas')
        if (res.ok) {
          const data = await res.json()
          setEntregas(data)
        }
      } catch {
        // API may not exist yet, silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchEntregas()
  }, [])

  const entregasConUbicacion = entregas.filter(
    (e) => e.latitud != null && e.longitud != null
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '400px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        <span className="ml-3 text-muted-foreground">Cargando mapa de entregas...</span>
      </div>
    )
  }

  // Since there are no PedidoCliente models yet, show placeholder
  if (entregas.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <span className="text-4xl">📦</span>
        </div>
        <p className="text-muted-foreground font-medium">
          Mapa de Entregas
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Las entregas aparecerán en el mapa cuando se registren pedidos con fecha de entrega.
        </p>
        <p className="text-xs text-muted-foreground mt-3">
          Los marcadores se colorearán según la fecha de entrega:
        </p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="flex items-center gap-1 text-xs">
            <span className="inline-block w-3 h-3 rounded-full bg-red-600" /> Hoy
          </span>
          <span className="flex items-center gap-1 text-xs">
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500" /> Mañana
          </span>
          <span className="flex items-center gap-1 text-xs">
            <span className="inline-block w-3 h-3 rounded-full bg-green-600" /> Otros
          </span>
        </div>
      </div>
    )
  }

  const center: [number, number] = [-27.3666, -55.8969] // Posadas, Misiones

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          <strong>{entregasConUbicacion.length}</strong> entrega
          {entregasConUbicacion.length !== 1 ? 's' : ''} en el mapa
        </p>
      </div>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '400px', width: '100%', borderRadius: '8px', zIndex: 0 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {entregasConUbicacion.map((ent) => {
          const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${ent.latitud},${ent.longitud}`
          const icon = getMarkerIcon(ent.fecha_entrega)

          return (
            <Marker
              key={ent.id}
              position={[ent.latitud!, ent.longitud!]}
              icon={icon}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <strong className="text-sm">{ent.nombre}</strong>
                  <br />
                  <span className="text-xs text-gray-600">{ent.direccion}</span>
                  <br />
                  <span className="text-xs">
                    📅 {new Date(ent.fecha_entrega).toLocaleDateString('es-AR')}
                  </span>
                  <br />
                  <span className="text-xs">
                    Estado: <strong>{ent.estado}</strong>
                  </span>
                  <br />
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    📍 Cómo llegar
                  </a>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-4">
        <span className="flex items-center gap-1 text-xs">
          <span className="inline-block w-3 h-3 rounded-full bg-red-600" /> 🔴 Hoy
        </span>
        <span className="flex items-center gap-1 text-xs">
          <span className="inline-block w-3 h-3 rounded-full bg-yellow-500" /> 🟡 Mañana
        </span>
        <span className="flex items-center gap-1 text-xs">
          <span className="inline-block w-3 h-3 rounded-full bg-green-600" /> 🟢 Otros días
        </span>
      </div>
    </div>
  )
}
