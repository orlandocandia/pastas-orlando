'use client'

import { useEffect, useState } from 'react'
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

// Custom green marker icon for providers
const greenMarkerIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42">
    <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.716 23.284 0 15 0z" fill="#16a34a"/>
    <circle cx="15" cy="14" r="6" fill="white"/>
  </svg>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -42],
  className: '',
})

interface Proveedor {
  id: number
  nombre: string
  apellido: string
  latitud: number | null
  longitud: number | null
  direccion_mapa: string | null
  contactos: { tipo: string; valor: string; es_principal: boolean }[]
}

export default function MapaProveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProveedores() {
      try {
        const res = await fetch('/api/logistica/mapa/proveedores')
        if (res.ok) {
          const data = await res.json()
          setProveedores(data)
        }
      } catch {
        // API may not exist yet, silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchProveedores()
  }, [])

  const proveedoresConUbicacion = proveedores.filter(
    (p) => p.latitud != null && p.longitud != null
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '400px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        <span className="ml-3 text-muted-foreground">Cargando mapa de proveedores...</span>
      </div>
    )
  }

  if (proveedoresConUbicacion.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No hay proveedores con ubicación registrada aún.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Los proveedores aparecerán en el mapa cuando se les asigne una ubicación.
        </p>
      </div>
    )
  }

  const center: [number, number] = [-27.3666, -55.8969] // Posadas, Misiones

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full bg-green-600" />
        <p className="text-sm text-muted-foreground">
          <strong>{proveedoresConUbicacion.length}</strong> proveedor
          {proveedoresConUbicacion.length !== 1 ? 'es' : ''} con ubicación registrada
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
        {proveedoresConUbicacion.map((prov) => {
          const telefono = prov.contactos?.find((c) =>
            c.tipo?.toLowerCase().includes('tel')
          )?.valor
          const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${prov.latitud},${prov.longitud}`

          return (
            <Marker
              key={prov.id}
              position={[prov.latitud!, prov.longitud!]}
              icon={greenMarkerIcon}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <strong className="text-sm">
                    {prov.nombre} {prov.apellido}
                  </strong>
                  {prov.direccion_mapa && (
                    <>
                      <br />
                      <span className="text-xs text-gray-600">{prov.direccion_mapa}</span>
                    </>
                  )}
                  {telefono && (
                    <>
                      <br />
                      <span className="text-xs">📞 {telefono}</span>
                    </>
                  )}
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
    </div>
  )
}
