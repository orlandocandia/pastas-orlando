'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { isToday, isTomorrow, parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Map, Truck, Clock, CheckCircle, Calendar, RefreshCw, MapPin } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EntregaMapData {
  id: number
  estado: string
  fecha_programada: string
  cliente_nombre: string
  lat: number
  lng: number
  pedido_id: number
  punto_encuentro_nombre?: string | null
}

// Dynamic import of MapaEntregas (Leaflet requires window, no SSR)
const MapaEntregas = dynamic(() => import('@/components/logistica/MapaEntregas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] w-full items-center justify-center rounded-lg bg-crema">
      <div className="flex flex-col items-center gap-3">
        <Map className="h-10 w-10 animate-pulse text-mostaza" />
        <p className="text-sm text-marron/60">Cargando mapa...</p>
      </div>
    </div>
  ),
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDateCategory(fecha: string): 'hoy' | 'manana' | 'otro' {
  try {
    const date = parseISO(fecha)
    if (isToday(date)) return 'hoy'
    if (isTomorrow(date)) return 'manana'
    return 'otro'
  } catch {
    return 'otro'
  }
}

function formatDateLabel(fecha: string): string {
  try {
    const date = parseISO(fecha)
    if (isToday(date)) return 'Hoy'
    if (isTomorrow(date)) return 'Mañana'
    return format(date, "EEEE d 'de' MMMM", { locale: es })
  } catch {
    return fecha
  }
}

function formatShortDate(fecha: string): string {
  try {
    return format(parseISO(fecha), 'dd/MM/yyyy')
  } catch {
    return fecha
  }
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function MapaEntregasPage() {
  const [entregas, setEntregas] = useState<EntregaMapData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingId, setMarkingId] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch entregas
  const fetchEntregas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/logistica/mapa/entregas')
      if (!res.ok) {
        throw new Error('Error al cargar entregas')
      }
      const data = await res.json()
      setEntregas(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching entregas:', err)
      setError('No se pudieron cargar las entregas. Intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntregas()
  }, [fetchEntregas, refreshKey])

  // Marcar entregado handler
  const handleMarcarEntregado = useCallback(
    async (id: number | string) => {
      const numId = Number(id)
      if (isNaN(numId)) return

      setMarkingId(numId)
      try {
        const res = await fetch(`/api/logistica/entregas/${numId}/estado`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: 'entregado' }),
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Error al marcar como entregado')
        }

        // Remove the delivered item from local state immediately for better UX
        setEntregas((prev) => prev.filter((e) => e.id !== numId))
      } catch (err) {
        console.error('Error marking entrega as delivered:', err)
        alert(err instanceof Error ? err.message : 'Error al marcar como entregado')
      } finally {
        setMarkingId(null)
      }
    },
    [],
  )

  // Compute stats
  const stats = {
    total: entregas.length,
    hoy: entregas.filter((e) => getDateCategory(e.fecha_programada) === 'hoy').length,
    manana: entregas.filter((e) => getDateCategory(e.fecha_programada) === 'manana').length,
    resto: entregas.filter((e) => getDateCategory(e.fecha_programada) === 'otro').length,
  }

  // Today's deliveries for the list
  const entregasHoy = entregas
    .filter((e) => getDateCategory(e.fecha_programada) === 'hoy')
    .sort((a, b) => a.cliente_nombre.localeCompare(b.cliente_nombre))

  // Prepare data for MapaEntregas component
  const mapEntregas = entregas.map((e) => ({
    id: e.id,
    lat: e.lat,
    lng: e.lng,
    cliente_nombre: e.cliente_nombre,
    estado: e.estado,
    fecha_programada: e.fecha_programada,
    pedido_numero: `#${e.pedido_id}`,
    direccion: e.punto_encuentro_nombre || undefined,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-rojo/10 p-2">
            <Map className="h-5 w-5 text-rojo" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-marron">Mapa de Entregas</h1>
            <p className="text-sm text-muted-foreground">
              Visualiza las entregas pendientes en el mapa
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRefreshKey((k) => k + 1)}
          disabled={loading}
          className="border-marron/20 hover:border-mostaza hover:bg-mostaza/5"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-rojo/30 bg-rojo/5">
          <CardContent className="flex items-center gap-3 py-4">
            <Map className="h-5 w-5 text-rojo" />
            <p className="text-sm text-rojo">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefreshKey((k) => k + 1)}
              className="ml-auto border-rojo/30 text-rojo hover:bg-rojo/10"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main layout: Map + Sidebar */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Map area */}
        <div className="flex-1 min-w-0">
          <Card className="border-marron/10 overflow-hidden">
            <CardContent className="p-0">
              {loading && entregas.length === 0 ? (
                <div className="flex h-[500px] w-full items-center justify-center bg-crema">
                  <div className="flex flex-col items-center gap-3">
                    <Map className="h-10 w-10 animate-pulse text-mostaza" />
                    <p className="text-sm text-marron/60">Cargando mapa de entregas...</p>
                  </div>
                </div>
              ) : (
                <MapaEntregas
                  entregas={mapEntregas}
                  onMarcarEntregado={handleMarcarEntregado}
                  height="500px"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Stats + Today's list */}
        <div className="w-full lg:w-80 xl:w-96 space-y-4 flex-shrink-0">
          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-marron/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="h-4 w-4 text-marron" />
                  <span className="text-xs font-medium text-muted-foreground">Total pendientes</span>
                </div>
                <p className="text-2xl font-bold text-marron">
                  {loading ? (
                    <span className="inline-block h-8 w-8 animate-pulse rounded bg-muted" />
                  ) : (
                    stats.total
                  )}
                </p>
              </CardContent>
            </Card>
            <Card className="border-rojo/20 bg-rojo/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-rojo" />
                  <span className="text-xs font-medium text-rojo/80">Hoy</span>
                </div>
                <p className="text-2xl font-bold text-rojo">
                  {loading ? (
                    <span className="inline-block h-8 w-8 animate-pulse rounded bg-rojo/10" />
                  ) : (
                    stats.hoy
                  )}
                </p>
              </CardContent>
            </Card>
            <Card className="border-mostaza/20 bg-mostaza/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-mostaza" />
                  <span className="text-xs font-medium text-mostaza/80">Mañana</span>
                </div>
                <p className="text-2xl font-bold text-mostaza">
                  {loading ? (
                    <span className="inline-block h-8 w-8 animate-pulse rounded bg-mostaza/10" />
                  ) : (
                    stats.manana
                  )}
                </p>
              </CardContent>
            </Card>
            <Card className="border-oliva/20 bg-oliva/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-oliva" />
                  <span className="text-xs font-medium text-oliva/80">Resto</span>
                </div>
                <p className="text-2xl font-bold text-oliva">
                  {loading ? (
                    <span className="inline-block h-8 w-8 animate-pulse rounded bg-oliva/10" />
                  ) : (
                    stats.resto
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Legend */}
          <Card className="border-marron/10">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-marron mb-2">Leyenda</h3>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-full bg-rojo" />
                  <span className="text-marron/70">Hoy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-full bg-mostaza" />
                  <span className="text-marron/70">Mañana</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-full bg-oliva" />
                  <span className="text-marron/70">Otras fechas</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's deliveries list */}
          <Card className="border-marron/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-marron">
                <Clock className="h-4 w-4 text-rojo" />
                Entregas de Hoy
                <Badge variant="secondary" className="bg-rojo/10 text-rojo ml-auto">
                  {entregasHoy.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {entregasHoy.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 px-4">
                  <CheckCircle className="h-8 w-8 text-oliva/40" />
                  <p className="text-sm text-muted-foreground text-center">
                    No hay entregas programadas para hoy
                  </p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                  {entregasHoy.map((entrega) => (
                    <div
                      key={entrega.id}
                      className="flex items-start gap-3 border-t border-marron/5 px-4 py-3 transition-colors hover:bg-crema/50"
                    >
                      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-rojo/10">
                        <MapPin className="h-3.5 w-3.5 text-rojo" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-marron truncate">
                          {entrega.cliente_nombre}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            Pedido #{entrega.pedido_id}
                          </span>
                          {entrega.punto_encuentro_nombre && (
                            <>
                              <span className="text-xs text-muted-foreground">·</span>
                              <span className="text-xs text-muted-foreground truncate">
                                {entrega.punto_encuentro_nombre}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="mt-1">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${
                              entrega.estado === 'en_camino'
                                ? 'border-mostaza/40 text-mostaza bg-mostaza/5'
                                : 'border-marron/20 text-marron/60 bg-marron/5'
                            }`}
                          >
                            {entrega.estado === 'en_camino' ? 'En camino' : 'Programado'}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0 h-7 border-oliva/30 text-oliva hover:bg-oliva/10 hover:text-oliva text-xs px-2"
                        disabled={markingId === entrega.id}
                        onClick={() => handleMarcarEntregado(entrega.id)}
                      >
                        {markingId === entrega.id ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Entregado
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Other deliveries (tomorrow + rest) quick summary */}
          {(stats.manana > 0 || stats.resto > 0) && (
            <Card className="border-marron/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-marron">
                  <Calendar className="h-4 w-4 text-mostaza" />
                  Próximas Entregas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {entregas
                    .filter((e) => getDateCategory(e.fecha_programada) !== 'hoy')
                    .sort((a, b) => a.fecha_programada.localeCompare(b.fecha_programada))
                    .map((entrega) => {
                      const category = getDateCategory(entrega.fecha_programada)
                      const colorClass =
                        category === 'manana'
                          ? 'bg-mostaza/10 text-mostaza'
                          : 'bg-oliva/10 text-oliva'

                      return (
                        <div
                          key={entrega.id}
                          className="flex items-start gap-3 border-t border-marron/5 px-4 py-3 transition-colors hover:bg-crema/50"
                        >
                          <div
                            className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${colorClass}`}
                          >
                            <MapPin className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-marron truncate">
                              {entrega.cliente_nombre}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">
                                Pedido #{entrega.pedido_id}
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 ${
                                category === 'manana'
                                  ? 'border-mostaza/40 text-mostaza'
                                  : 'border-oliva/40 text-oliva'
                              }`}
                            >
                              {formatDateLabel(entrega.fecha_programada)}
                            </Badge>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {formatShortDate(entrega.fecha_programada)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
