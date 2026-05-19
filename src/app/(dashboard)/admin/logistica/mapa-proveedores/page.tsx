'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { MapPin, Building2, Phone, ExternalLink, Navigation, Loader2, AlertCircle, List, Map } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ---------------------------------------------------------------------------
// Dynamic import – Leaflet needs the `window` object
// ---------------------------------------------------------------------------

const MapaProveedores = dynamic(
  () => import('@/components/logistica/MapaProveedores'),
  { ssr: false }
)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProveedorMapData {
  id: number
  nombre: string
  apellido: string
  razon_social?: string
  direccion: string | null
  lat: number | null
  lng: number | null
  telefonos: string[]
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MapaProveedoresPage() {
  const [proveedores, setProveedores] = useState<ProveedorMapData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [highlightedId, setHighlightedId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')

  // -----------------------------------------------------------------------
  // Fetch data
  // -----------------------------------------------------------------------

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/logistica/mapa/proveedores')
        if (!res.ok) throw new Error('Error al cargar proveedores')
        const data: ProveedorMapData[] = await res.json()
        setProveedores(data)
      } catch {
        setError('No se pudieron cargar los proveedores. Intentá de nuevo.')
        toast.error('Error al cargar proveedores')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // -----------------------------------------------------------------------
  // Derived data
  // -----------------------------------------------------------------------

  const proveedoresConCoordenadas = proveedores.filter(
    (p) => p.lat !== null && p.lng !== null && p.lat !== 0 && p.lng !== 0
  )

  const proveedoresSinCoordenadas = proveedores.filter(
    (p) => p.lat === null || p.lng === null || p.lat === 0 || p.lng === 0
  )

  // Map data for the MapaProveedores component
  const mapData = proveedoresConCoordenadas.map((p) => ({
    id: p.id,
    nombre: `${p.nombre} ${p.apellido}`.trim(),
    razon_social: p.razon_social || undefined,
    direccion: p.direccion || undefined,
    lat: p.lat!,
    lng: p.lng!,
    telefonos: p.telefonos,
  }))

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const handleHighlight = useCallback((id: number) => {
    setHighlightedId((prev) => (prev === id ? null : id))
  }, [])

  const handleClearHighlight = useCallback(() => {
    setHighlightedId(null)
  }, [])

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  function getDisplayName(p: ProveedorMapData): string {
    const fullName = `${p.nombre} ${p.apellido}`.trim()
    return p.razon_social || fullName
  }

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-mostaza/10 p-2">
            <MapPin className="h-5 w-5 text-mostaza" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-marron">Mapa de Proveedores</h1>
            <p className="text-sm text-muted-foreground">Ubicación de tus proveedores en el mapa</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-mostaza" />
          <p className="mt-4 text-sm text-muted-foreground">Cargando mapa de proveedores...</p>
        </div>
      </div>
    )
  }

  // -----------------------------------------------------------------------
  // Error state
  // -----------------------------------------------------------------------

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-mostaza/10 p-2">
            <MapPin className="h-5 w-5 text-mostaza" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-marron">Mapa de Proveedores</h1>
            <p className="text-sm text-muted-foreground">Ubicación de tus proveedores en el mapa</p>
          </div>
        </div>
        <Card className="border-rojo/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-rojo mb-4" />
            <p className="text-lg font-semibold text-marron mb-2">Error al cargar</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-mostaza text-marron hover:bg-mostaza/90"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // -----------------------------------------------------------------------
  // Main render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-mostaza/10 p-2">
            <MapPin className="h-5 w-5 text-mostaza" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-marron">Mapa de Proveedores</h1>
            <p className="text-sm text-muted-foreground">Ubicación de tus proveedores en el mapa</p>
          </div>
        </div>

        {/* Mobile view toggle */}
        <div className="flex gap-2 sm:hidden">
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
            className={viewMode === 'map' ? 'bg-mostaza text-marron hover:bg-mostaza/90' : ''}
          >
            <Map className="h-4 w-4 mr-1" />
            Mapa
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-mostaza text-marron hover:bg-mostaza/90' : ''}
          >
            <List className="h-4 w-4 mr-1" />
            Lista
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="border-marron/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Proveedores
            </CardTitle>
            <div className="rounded-lg p-2 bg-mostaza/10 text-mostaza">
              <Building2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-marron">{proveedores.length}</div>
          </CardContent>
        </Card>

        <Card className="border-marron/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Con Coordenadas
            </CardTitle>
            <div className="rounded-lg p-2 bg-oliva/10 text-oliva">
              <Navigation className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-oliva">{proveedoresConCoordenadas.length}</div>
          </CardContent>
        </Card>

        <Card className="border-marron/5 col-span-2 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sin Coordenadas
            </CardTitle>
            <div className="rounded-lg p-2 bg-rojo/10 text-rojo">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rojo">{proveedoresSinCoordenadas.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* No coordinates message */}
      {proveedores.length > 0 && proveedoresConCoordenadas.length === 0 && (
        <Card className="border-mostaza/20 bg-crema">
          <CardContent className="flex items-start gap-4 py-6">
            <div className="rounded-full bg-mostaza/10 p-3 shrink-0">
              <MapPin className="h-6 w-6 text-mostaza" />
            </div>
            <div>
              <h3 className="font-semibold text-marron mb-1">Sin proveedores en el mapa</h3>
              <p className="text-sm text-muted-foreground">
                Ninguno de tus proveedores tiene coordenadas asignadas. Para verlos en el mapa,
                agregá latitud y longitud a las direcciones de tus proveedores desde la sección
                de <strong className="text-marron">Personas</strong>.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main layout: map + sidebar */}
      {proveedoresConCoordenadas.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map area */}
          <div className={`lg:col-span-2 ${viewMode === 'list' ? 'hidden sm:block' : ''}`}>
            <Card className="border-marron/5 overflow-hidden">
              <CardContent className="p-0 relative">
                <MapaProveedores
                  proveedores={mapData}
                  height="500px"
                  highlightedId={highlightedId}
                />
                {highlightedId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearHighlight}
                    className="absolute top-3 right-3 z-[1000] bg-white/90 hover:bg-white text-marron border-marron/20"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    Ver todos
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar / list panel */}
          <div className={viewMode === 'map' ? 'hidden sm:block' : ''}>
            <Card className="border-marron/5 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-marron flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-mostaza" />
                    Proveedores
                  </CardTitle>
                  <Badge className="bg-mostaza/10 text-mostaza hover:bg-mostaza/20 border-0">
                    {proveedoresConCoordenadas.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="max-h-[420px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
                  {proveedoresConCoordenadas.map((p) => {
                    const isHighlighted = highlightedId === p.id
                    const displayName = getDisplayName(p)
                    const fullNombre = `${p.nombre} ${p.apellido}`.trim()
                    const hasRazonSocial = p.razon_social && p.razon_social !== fullNombre
                    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`

                    return (
                      <button
                        key={p.id}
                        onClick={() => handleHighlight(p.id)}
                        className={`w-full text-left rounded-lg border p-3 transition-all duration-200 ${
                          isHighlighted
                            ? 'border-mostaza bg-mostaza/10 shadow-sm'
                            : 'border-border hover:border-mostaza/30 hover:bg-mostaza/5'
                        }`}
                      >
                        {/* Name row */}
                        <div className="flex items-start gap-2">
                          <MapPin
                            className={`h-4 w-4 mt-0.5 shrink-0 ${
                              isHighlighted ? 'text-mostaza' : 'text-muted-foreground'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className={`font-medium text-sm truncate ${
                              isHighlighted ? 'text-mostaza' : 'text-marron'
                            }`}>
                              {displayName}
                            </p>
                            {hasRazonSocial && (
                              <p className="text-xs text-muted-foreground truncate">
                                ({fullNombre})
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Address */}
                        {p.direccion && (
                          <div className="flex items-start gap-2 mt-1.5 ml-6">
                            <span className="text-xs text-muted-foreground">
                              {p.direccion}
                            </span>
                          </div>
                        )}

                        {/* Phone */}
                        {p.telefonos.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-1 ml-6">
                            <Phone className="h-3 w-3 text-oliva shrink-0" />
                            <span className="text-xs text-oliva">
                              {p.telefonos.join(', ')}
                            </span>
                          </div>
                        )}

                        {/* Cómo llegar link */}
                        {isHighlighted && (
                          <div className="mt-2 ml-6">
                            <a
                              href={directionsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-3 w-3" />
                              Cómo llegar
                            </a>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Proveedores sin coordenadas list */}
      {proveedoresSinCoordenadas.length > 0 && (
        <Card className="border-marron/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rojo" />
              <CardTitle className="text-lg text-marron">
                Proveedores sin coordenadas
              </CardTitle>
              <Badge className="bg-rojo/10 text-rojo hover:bg-rojo/20 border-0">
                {proveedoresSinCoordenadas.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-3">
              Estos proveedores no aparecen en el mapa porque no tienen coordenadas asignadas a sus direcciones.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {proveedoresSinCoordenadas.map((p) => {
                const displayName = getDisplayName(p)
                const fullNombre = `${p.nombre} ${p.apellido}`.trim()
                const hasRazonSocial = p.razon_social && p.razon_social !== fullNombre

                return (
                  <div
                    key={p.id}
                    className="rounded-lg border border-border p-3 bg-muted/30"
                  >
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-marron truncate">
                          {displayName}
                        </p>
                        {hasRazonSocial && (
                          <p className="text-xs text-muted-foreground truncate">
                            ({fullNombre})
                          </p>
                        )}
                        {p.direccion && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {p.direccion}
                          </p>
                        )}
                        {p.telefonos.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3 text-oliva" />
                            <span className="text-xs text-oliva">{p.telefonos.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
