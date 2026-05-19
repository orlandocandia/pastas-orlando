'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Truck, Plus, Eye, MapPin, Clock, Phone, Navigation,
  XCircle, RefreshCw, CheckCircle, Loader2, Search,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// ---------------------------------------------------------------------------
// Dynamic import for Leaflet map (SSR incompatible)
// ---------------------------------------------------------------------------
const MapaLeaflet = dynamic(
  () => import('@/components/logistica/MapaLeaflet').then((mod) => ({ default: mod.MapaLeaflet })),
  { ssr: false },
)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClienteInfo {
  id: number
  nombre: string
  apellido: string
  razon_social: string | null
  numero_documento: string | null
  tipo_persona: string
}

interface PuntoEncuentro {
  id: number
  nombre: string
  direccion: string
  latitud: number | null
  longitud: number | null
}

interface NotificacionEntrega {
  id: number
  tipo: string
  canal: string
  destinatario: string
  mensaje: string
  estado: string
  fecha_envio: string | null
  error: string | null
  createdAt: string
}

interface DetallePedido {
  id: number
  id_producto_terminado: number
  cantidad: number
  precio_unitario: number
  subtotal: number
  productoTerminado: { id: number; codigo: string | null; nombre: string; precio_venta: number }
}

interface Entrega {
  id: number
  id_pedido: number
  id_punto_encuentro: number | null
  direccion_alternativa: string | null
  fecha_programada: string
  fecha_realizada: string | null
  hora_desde: string | null
  hora_hasta: string | null
  nombre_recibe: string | null
  telefono_recibe: string | null
  estado: string
  observaciones: string | null
  latitud_entrega: number | null
  longitud_entrega: number | null
  createdAt: string
  updatedAt: string
  pedido: {
    id: number
    id_cliente: number
    fecha_pedido: string
    total: number
    cliente: ClienteInfo
    detalle?: DetallePedido[]
  }
  puntoEncuentro: PuntoEncuentro | null
  notificaciones?: NotificacionEntrega[]
}

interface PedidoCliente {
  id: number
  fecha_pedido: string
  total: number
  cliente: ClienteInfo
  estado: { id: number; nombre_estado: string }
}

// ---------------------------------------------------------------------------
// Estado badge colours
// ---------------------------------------------------------------------------

const ESTADO_BADGE: Record<string, { class: string; label: string }> = {
  programado: { class: 'bg-blue-100 text-blue-700 hover:bg-blue-200', label: 'Programado' },
  en_camino: { class: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200', label: 'En camino' },
  entregado: { class: 'bg-green-100 text-green-700 hover:bg-green-200', label: 'Entregado' },
  cancelado: { class: 'bg-red-100 text-red-700 hover:bg-red-200', label: 'Cancelado' },
  reagendado: { class: 'bg-orange-100 text-orange-700 hover:bg-orange-200', label: 'Reagendado' },
}

function EstadoBadge({ estado }: { estado: string }) {
  const cfg = ESTADO_BADGE[estado] ?? { class: 'bg-muted text-muted-foreground', label: estado }
  return <Badge className={cfg.class}>{cfg.label}</Badge>
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clienteName(c?: ClienteInfo | null): string {
  if (!c) return '-'
  if (c.razon_social) return c.razon_social
  return `${c.nombre} ${c.apellido}`.trim()
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v)
}

function fechaStr(d: string | null | undefined): string {
  if (!d) return '-'
  try {
    return format(parseISO(d), 'dd/MM/yyyy', { locale: es })
  } catch {
    return d
  }
}

function horaStr(h: string | null | undefined): string {
  if (!h) return ''
  return h
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function EntregasPage() {
  // --- state ---
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [search, setSearch] = useState('')

  // create dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formPedido, setFormPedido] = useState('')
  const [formPunto, setFormPunto] = useState('')
  const [formDireccionAlt, setFormDireccionAlt] = useState('')
  const [formFecha, setFormFecha] = useState('')
  const [formHoraDesde, setFormHoraDesde] = useState('')
  const [formHoraHasta, setFormHoraHasta] = useState('')
  const [formNombreRecibe, setFormNombreRecibe] = useState('')
  const [formTelefonoRecibe, setFormTelefonoRecibe] = useState('')
  const [formObservaciones, setFormObservaciones] = useState('')

  // dropdowns data
  const [pedidos, setPedidos] = useState<PedidoCliente[]>([])
  const [puntos, setPuntos] = useState<PuntoEncuentro[]>([])

  // detail dialog
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailEntrega, setDetailEntrega] = useState<Entrega | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // reagendar dialog
  const [reagendarOpen, setReagendarOpen] = useState(false)
  const [reagendarFecha, setReagendarFecha] = useState('')

  // --- fetch entregas ---
  const fetchEntregas = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtroEstado && filtroEstado !== 'todos') params.set('estado', filtroEstado)
      const res = await fetch(`/api/logistica/entregas?${params.toString()}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setEntregas(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Error al cargar entregas')
    } finally {
      setLoading(false)
    }
  }, [filtroEstado])

  // --- fetch pedidos (confirmados) for dropdown ---
  const fetchPedidos = useCallback(async () => {
    try {
      const res = await fetch('/api/pedidos-clientes?limite=100')
      if (!res.ok) throw new Error()
      const data = await res.json()
      const items: PedidoCliente[] = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []
      setPedidos(items.filter((p) => p.estado?.nombre_estado?.toLowerCase() === 'confirmado'))
    } catch {
      // silent
    }
  }, [])

  // --- fetch puntos de encuentro ---
  const fetchPuntos = useCallback(async () => {
    try {
      const res = await fetch('/api/logistica/puntos-encuentro?activo=true')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPuntos(Array.isArray(data) ? data : [])
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchEntregas()
  }, [fetchEntregas])

  useEffect(() => {
    fetchPedidos()
    fetchPuntos()
  }, [fetchPedidos, fetchPuntos])

  // --- create entrega ---
  const handleCreate = async () => {
    if (!formPedido || !formFecha) {
      toast.error('Pedido y fecha programada son obligatorios')
      return
    }
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        id_pedido: parseInt(formPedido),
        fecha_programada: formFecha,
      }
      if (formPunto && formPunto !== 'ninguno') {
        body.id_punto_encuentro = parseInt(formPunto)
      }
      if (formDireccionAlt) body.direccion_alternativa = formDireccionAlt
      if (formHoraDesde) body.hora_desde = formHoraDesde
      if (formHoraHasta) body.hora_hasta = formHoraHasta
      if (formNombreRecibe) body.nombre_recibe = formNombreRecibe
      if (formTelefonoRecibe) body.telefono_recibe = formTelefonoRecibe
      if (formObservaciones) body.observaciones = formObservaciones

      const res = await fetch('/api/logistica/entregas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Error al crear entrega')
      }
      toast.success('Entrega creada correctamente')
      resetForm()
      setCreateOpen(false)
      fetchEntregas()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear entrega')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormPedido('')
    setFormPunto('')
    setFormDireccionAlt('')
    setFormFecha('')
    setFormHoraDesde('')
    setFormHoraHasta('')
    setFormNombreRecibe('')
    setFormTelefonoRecibe('')
    setFormObservaciones('')
  }

  // --- fetch detail ---
  const openDetail = async (entrega: Entrega) => {
    setDetailEntrega(entrega)
    setDetailOpen(true)
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/logistica/entregas/${entrega.id}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setDetailEntrega(data)
    } catch {
      // use the list data
    } finally {
      setDetailLoading(false)
    }
  }

  // --- estado change ---
  const handleEstadoChange = async (nuevoEstado: string, fechaProgramada?: string) => {
    if (!detailEntrega) return
    setActionLoading(true)
    try {
      const body: Record<string, unknown> = { estado: nuevoEstado }
      if (fechaProgramada) body.fecha_programada = fechaProgramada

      const res = await fetch(`/api/logistica/entregas/${detailEntrega.id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Error al cambiar estado')
      }
      const updated = await res.json()
      setDetailEntrega(updated)
      toast.success('Estado actualizado correctamente')
      fetchEntregas()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar estado')
    } finally {
      setActionLoading(false)
    }
  }

  // --- filtered entregas (client-side search) ---
  const filteredEntregas = search
    ? entregas.filter((e) => {
        const name = clienteName(e.pedido?.cliente).toLowerCase()
        const pedidoId = `#${e.id_pedido}`.toLowerCase()
        const dir = (e.direccion_alternativa ?? '').toLowerCase()
        const punto = (e.puntoEncuentro?.nombre ?? '').toLowerCase()
        const s = search.toLowerCase()
        return name.includes(s) || pedidoId.includes(s) || dir.includes(s) || punto.includes(s)
      })
    : entregas

  // --- map markers for detail ---
  const detailMarkers = (() => {
    if (!detailEntrega) return []
    const markers: { lat: number; lng: number; popup: string; color: 'red' | 'yellow' | 'green' | 'blue' }[] = []
    if (detailEntrega.puntoEncuentro?.latitud && detailEntrega.puntoEncuentro?.longitud) {
      markers.push({
        lat: detailEntrega.puntoEncuentro.latitud,
        lng: detailEntrega.puntoEncuentro.longitud,
        popup: `<strong>${detailEntrega.puntoEncuentro.nombre}</strong><br/>${detailEntrega.puntoEncuentro.direccion}`,
        color: 'blue',
      })
    }
    if (detailEntrega.latitud_entrega && detailEntrega.longitud_entrega) {
      markers.push({
        lat: detailEntrega.latitud_entrega,
        lng: detailEntrega.longitud_entrega,
        popup: '<strong>Ubicación de entrega</strong>',
        color: 'green',
      })
    }
    return markers
  })()

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-oliva/10 p-2">
          <Truck className="h-5 w-5 text-oliva" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Entregas</h1>
          <p className="text-sm text-muted-foreground">Gestiona las entregas a clientes</p>
        </div>
      </div>

      {/* Filters & actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, pedido..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {Object.entries(ESTADO_BADGE).map(([key, val]) => (
                <SelectItem key={key} value={key}>
                  {val.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="bg-mostaza hover:bg-mostaza/90 text-marron font-semibold">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Entrega
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-marron">Nueva Entrega</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Pedido */}
              <div className="grid gap-2">
                <Label className="text-marron font-medium">Pedido *</Label>
                <Select value={formPedido} onValueChange={setFormPedido}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar pedido confirmado" />
                  </SelectTrigger>
                  <SelectContent>
                    {pedidos.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No hay pedidos confirmados
                      </SelectItem>
                    ) : (
                      pedidos.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          #{p.id} — {clienteName(p.cliente)} — {formatCurrency(p.total)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Punto de encuentro OR dirección alternativa */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-marron font-medium">Punto de encuentro</Label>
                  <Select value={formPunto} onValueChange={(v) => { setFormPunto(v); if (v && v !== 'ninguno') setFormDireccionAlt('') }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar punto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ninguno">Sin punto de encuentro</SelectItem>
                      {puntos.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.nombre} — {p.direccion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-marron font-medium">Dirección alternativa</Label>
                  <Input
                    placeholder="Calle y número..."
                    value={formDireccionAlt}
                    onChange={(e) => { setFormDireccionAlt(e.target.value); if (e.target.value) setFormPunto('ninguno') }}
                    disabled={!!formPunto && formPunto !== 'ninguno'}
                  />
                </div>
              </div>

              {/* Fecha programada */}
              <div className="grid gap-2">
                <Label className="text-marron font-medium">Fecha programada *</Label>
                <Input type="date" value={formFecha} onChange={(e) => setFormFecha(e.target.value)} />
              </div>

              {/* Hora desde / hasta */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-marron font-medium">Hora desde</Label>
                  <Input type="time" value={formHoraDesde} onChange={(e) => setFormHoraDesde(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label className="text-marron font-medium">Hora hasta</Label>
                  <Input type="time" value={formHoraHasta} onChange={(e) => setFormHoraHasta(e.target.value)} />
                </div>
              </div>

              {/* Quién recibe */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-marron font-medium">Nombre de quien recibe</Label>
                  <Input
                    placeholder="Nombre completo"
                    value={formNombreRecibe}
                    onChange={(e) => setFormNombreRecibe(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-marron font-medium">Teléfono de quien recibe</Label>
                  <Input
                    placeholder="Ej: 3624 123456"
                    value={formTelefonoRecibe}
                    onChange={(e) => setFormTelefonoRecibe(e.target.value)}
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div className="grid gap-2">
                <Label className="text-marron font-medium">Observaciones</Label>
                <Textarea
                  placeholder="Notas adicionales..."
                  rows={3}
                  value={formObservaciones}
                  onChange={(e) => setFormObservaciones(e.target.value)}
                />
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm() }}>
                Cancelar
              </Button>
              <Button
                className="bg-mostaza hover:bg-mostaza/90 text-marron font-semibold"
                onClick={handleCreate}
                disabled={saving}
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Crear Entrega
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-marron/10 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Pedido #</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha programada</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">Ubicación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-mostaza mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">Cargando entregas...</p>
                  </TableCell>
                </TableRow>
              ) : filteredEntregas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {search || filtroEstado
                      ? 'No se encontraron entregas con los filtros aplicados'
                      : 'No hay entregas registradas'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntregas.map((entrega) => (
                  <TableRow key={entrega.id} className="hover:bg-mostaza/5">
                    <TableCell className="font-medium text-marron">#{entrega.id_pedido}</TableCell>
                    <TableCell className="text-marron">{clienteName(entrega.pedido?.cliente)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {fechaStr(entrega.fecha_programada)}
                      {entrega.hora_desde && (
                        <span className="ml-1 text-xs">
                          {horaStr(entrega.hora_desde)}
                          {entrega.hora_hasta && ` - ${horaStr(entrega.hora_hasta)}`}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <EstadoBadge estado={entrega.estado} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                      {entrega.puntoEncuentro ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {entrega.puntoEncuentro.nombre}
                        </span>
                      ) : entrega.direccion_alternativa ? (
                        <span className="flex items-center gap-1">
                          <Navigation className="h-3 w-3 shrink-0" />
                          {entrega.direccion_alternativa}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-mostaza/10"
                        onClick={() => openDetail(entrega)}
                      >
                        <Eye className="h-4 w-4 text-mostaza" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ================================================================== */}
      {/* DETAIL DIALOG                                                      */}
      {/* ================================================================== */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-marron flex items-center gap-2">
              <Truck className="h-5 w-5 text-oliva" />
              Detalle de Entrega #{detailEntrega?.id}
            </DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-mostaza" />
            </div>
          ) : detailEntrega ? (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="map">Mapa</TabsTrigger>
                <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
              </TabsList>

              {/* ---- Info tab ---- */}
              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Card: Pedido & Cliente */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-marron">Pedido & Cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pedido #</span>
                        <span className="font-medium text-marron">{detailEntrega.id_pedido}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cliente</span>
                        <span className="font-medium text-marron">{clienteName(detailEntrega.pedido?.cliente)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total pedido</span>
                        <span className="font-medium text-marron">
                          {detailEntrega.pedido?.total != null ? formatCurrency(detailEntrega.pedido.total) : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Estado</span>
                        <EstadoBadge estado={detailEntrega.estado} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card: Programación */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-marron">Programación</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fecha programada</span>
                        <span className="font-medium text-marron">{fechaStr(detailEntrega.fecha_programada)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hora</span>
                        <span className="font-medium text-marron">
                          {detailEntrega.hora_desde
                            ? `${horaStr(detailEntrega.hora_desde)}${detailEntrega.hora_hasta ? ` - ${horaStr(detailEntrega.hora_hasta)}` : ''}`
                            : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fecha realizada</span>
                        <span className="font-medium text-marron">{fechaStr(detailEntrega.fecha_realizada)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card: Ubicación */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-marron">Ubicación</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {detailEntrega.puntoEncuentro ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Punto de encuentro</span>
                            <span className="font-medium text-marron">{detailEntrega.puntoEncuentro.nombre}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Dirección</span>
                            <span className="font-medium text-marron">{detailEntrega.puntoEncuentro.direccion}</span>
                          </div>
                        </>
                      ) : null}
                      {detailEntrega.direccion_alternativa ? (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dirección alternativa</span>
                          <span className="font-medium text-marron">{detailEntrega.direccion_alternativa}</span>
                        </div>
                      ) : null}
                      {!detailEntrega.puntoEncuentro && !detailEntrega.direccion_alternativa && (
                        <span className="text-muted-foreground">Sin ubicación asignada</span>
                      )}
                    </CardContent>
                  </Card>

                  {/* Card: Quién recibe */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-marron">Quién recibe</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Nombre:</span>
                        <span className="font-medium text-marron">{detailEntrega.nombre_recibe || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium text-marron">{detailEntrega.telefono_recibe || '-'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Observaciones */}
                {detailEntrega.observaciones && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-marron">Observaciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{detailEntrega.observaciones}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Productos del pedido */}
                {detailEntrega.pedido?.detalle && detailEntrega.pedido.detalle.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-marron">Productos del pedido</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {detailEntrega.pedido.detalle.map((d) => (
                          <div key={d.id} className="flex justify-between text-sm">
                            <span className="text-marron">{d.productoTerminado?.nombre || '-'} x {d.cantidad}</span>
                            <span className="font-medium text-marron">{formatCurrency(d.subtotal)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {(detailEntrega.estado === 'programado' || detailEntrega.estado === 'reagendado') && (
                    <>
                      <Button
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                        onClick={() => handleEstadoChange('en_camino')}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Navigation className="mr-2 h-4 w-4" />}
                        Marcar en camino
                      </Button>
                      <Button
                        className="bg-oliva hover:bg-oliva/90 text-white"
                        onClick={() => handleEstadoChange('entregado')}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                        Marcar entregado
                      </Button>
                      <Button
                        variant="outline"
                        className="border-orange-400 text-orange-600 hover:bg-orange-50"
                        onClick={() => { setReagendarOpen(true); setReagendarFecha('') }}
                        disabled={actionLoading}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reagendar
                      </Button>
                      <Button
                        variant="outline"
                        className="border-rojo text-rojo hover:bg-rojo/10"
                        onClick={() => handleEstadoChange('cancelado')}
                        disabled={actionLoading}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                    </>
                  )}
                  {detailEntrega.estado === 'en_camino' && (
                    <Button
                      className="bg-oliva hover:bg-oliva/90 text-white"
                      onClick={() => handleEstadoChange('entregado')}
                      disabled={actionLoading}
                    >
                      {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                      Marcar entregado
                    </Button>
                  )}
                  {detailEntrega.estado === 'entregado' && (
                    <Badge className="bg-green-100 text-green-700 py-1 px-3">
                      <CheckCircle className="mr-1 h-4 w-4" /> Entrega completada
                    </Badge>
                  )}
                  {detailEntrega.estado === 'cancelado' && (
                    <Badge className="bg-red-100 text-red-700 py-1 px-3">
                      <XCircle className="mr-1 h-4 w-4" /> Entrega cancelada
                    </Badge>
                  )}
                </div>
              </TabsContent>

              {/* ---- Map tab ---- */}
              <TabsContent value="map" className="mt-4">
                {detailMarkers.length > 0 ? (
                  <MapaLeaflet
                    markers={detailMarkers}
                    height="400px"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <MapPin className="h-10 w-10 mb-2 opacity-40" />
                    <p>No hay coordenadas disponibles para esta entrega</p>
                  </div>
                )}
              </TabsContent>

              {/* ---- Notifications tab ---- */}
              <TabsContent value="notifications" className="mt-4">
                {detailEntrega.notificaciones && detailEntrega.notificaciones.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                    {detailEntrega.notificaciones.map((n) => (
                      <Card key={n.id}>
                        <CardContent className="py-3 px-4">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={
                                  n.tipo === 'recordatorio'
                                    ? 'border-blue-300 text-blue-600'
                                    : n.tipo === 'confirmacion'
                                    ? 'border-green-300 text-green-600'
                                    : n.tipo === 'retraso'
                                    ? 'border-red-300 text-red-600'
                                    : 'border-mostaza text-mostaza'
                                }
                              >
                                {n.tipo}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{n.canal}</span>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                n.estado === 'enviado'
                                  ? 'border-green-300 text-green-600'
                                  : n.estado === 'pendiente'
                                  ? 'border-yellow-300 text-yellow-600'
                                  : 'border-red-300 text-red-600'
                              }
                            >
                              {n.estado}
                            </Badge>
                          </div>
                          <p className="text-sm text-marron">{n.mensaje}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Para: {n.destinatario}
                            {n.fecha_envio && ` — ${format(parseISO(n.fecha_envio), "dd/MM/yyyy HH:mm", { locale: es })}`}
                          </p>
                          {n.error && <p className="text-xs text-rojo mt-1">Error: {n.error}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Clock className="h-10 w-10 mb-2 opacity-40" />
                    <p>No hay notificaciones registradas</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* ================================================================== */}
      {/* REAGENDAR DIALOG                                                   */}
      {/* ================================================================== */}
      <Dialog open={reagendarOpen} onOpenChange={setReagendarOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-marron">Reagendar Entrega</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-marron font-medium">Nueva fecha programada *</Label>
              <Input
                type="date"
                value={reagendarFecha}
                onChange={(e) => setReagendarFecha(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setReagendarOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => {
                if (!reagendarFecha) {
                  toast.error('Indique la nueva fecha')
                  return
                }
                handleEstadoChange('reagendado', reagendarFecha)
                setReagendarOpen(false)
              }}
              disabled={actionLoading || !reagendarFecha}
            >
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Reagendar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
