'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  History, Mail, MessageCircle, Eye, RefreshCw, Search,
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle,
  Clock, XCircle, Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlantillaInfo {
  id: number
  nombre: string
}

interface Notificacion {
  id: number
  id_plantilla: number | null
  tipo: string
  destinatario: string
  asunto: string | null
  mensaje: string
  estado: string
  fecha_programada: string | null
  fecha_envio: string | null
  error: string | null
  metadata: string | null
  createdAt: string
  plantilla: PlantillaInfo | null
}

interface HistorialResponse {
  data: Notificacion[]
  total: number
  page: number
  totalPages: number
}

// ---------------------------------------------------------------------------
// Estado badge config
// ---------------------------------------------------------------------------

const ESTADO_BADGE: Record<string, { class: string; label: string; icon: typeof Clock }> = {
  pendiente: { class: 'bg-amber-100 text-amber-700 hover:bg-amber-200', label: 'Pendiente', icon: Clock },
  enviado: { class: 'bg-oliva/15 text-oliva hover:bg-oliva/25', label: 'Enviado', icon: CheckCircle },
  error: { class: 'bg-rojo/15 text-rojo hover:bg-rojo/25', label: 'Error', icon: AlertCircle },
  cancelado: { class: 'bg-gray-100 text-gray-500 hover:bg-gray-200', label: 'Cancelado', icon: XCircle },
}

function EstadoBadge({ estado }: { estado: string }) {
  const cfg = ESTADO_BADGE[estado] ?? { class: 'bg-muted text-muted-foreground', label: estado, icon: AlertCircle }
  const Icon = cfg.icon
  return (
    <Badge className={`${cfg.class} gap-1`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  )
}

// ---------------------------------------------------------------------------
// Tipo icon + badge
// ---------------------------------------------------------------------------

function TipoBadge({ tipo }: { tipo: string }) {
  if (tipo === 'email') {
    return (
      <Badge variant="outline" className="gap-1 border-blue-300 text-blue-600">
        <Mail className="h-3 w-3" />
        Email
      </Badge>
    )
  }
  if (tipo === 'whatsapp') {
    return (
      <Badge variant="outline" className="gap-1 border-green-300 text-green-600">
        <MessageCircle className="h-3 w-3" />
        WhatsApp
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1">
      {tipo}
    </Badge>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fechaStr(d: string | null | undefined): string {
  if (!d) return '-'
  try {
    return format(parseISO(d), 'dd/MM/yyyy HH:mm', { locale: es })
  } catch {
    return d
  }
}

function truncar(texto: string, max: number = 50): string {
  if (!texto) return '-'
  return texto.length > max ? texto.slice(0, max) + '...' : texto
}

function parseMetadata(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function HistorialNotificacionesPage() {
  // --- data state ---
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  // --- filter state ---
  const [filtroTipo, setFiltroTipo] = useState<string>('')
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [filtroDestinatario, setFiltroDestinatario] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const LIMIT = 20

  // --- detail dialog ---
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailNotif, setDetailNotif] = useState<Notificacion | null>(null)

  // --- resend ---
  const [resendLoading, setResendLoading] = useState<number | null>(null)

  // --- fetch ---
  const fetchHistorial = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', LIMIT.toString())
      if (filtroTipo && filtroTipo !== 'todos') params.set('tipo', filtroTipo)
      if (filtroEstado && filtroEstado !== 'todos') params.set('estado', filtroEstado)
      if (filtroDestinatario) params.set('destinatario', filtroDestinatario)

      const res = await fetch(`/api/notificaciones/historial?${params.toString()}`)
      if (!res.ok) throw new Error()
      const data: HistorialResponse = await res.json()
      setNotificaciones(data.data ?? [])
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch {
      toast.error('Error al cargar historial de notificaciones')
    } finally {
      setLoading(false)
    }
  }, [page, filtroTipo, filtroEstado, filtroDestinatario])

  useEffect(() => {
    fetchHistorial()
  }, [fetchHistorial])

  // --- search handler (debounce on enter or blur) ---
  const handleSearch = () => {
    setFiltroDestinatario(searchInput)
    setPage(1)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // --- clear filters ---
  const clearFilters = () => {
    setFiltroTipo('')
    setFiltroEstado('')
    setFiltroDestinatario('')
    setSearchInput('')
    setPage(1)
  }

  // --- handle filter change (reset page) ---
  const handleTipoChange = (val: string) => {
    setFiltroTipo(val === 'todos' ? '' : val)
    setPage(1)
  }

  const handleEstadoChange = (val: string) => {
    setFiltroEstado(val === 'todos' ? '' : val)
    setPage(1)
  }

  // --- pagination helpers ---
  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  // --- open detail ---
  const openDetail = (notif: Notificacion) => {
    setDetailNotif(notif)
    setDetailOpen(true)
  }

  // --- reenviar ---
  const handleReenviar = async (id: number) => {
    setResendLoading(id)
    try {
      const res = await fetch(`/api/notificaciones/historial/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'reenviar' }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Error al reenviar notificación')
      }
      toast.success('Notificación reenviada correctamente')
      fetchHistorial()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al reenviar notificación')
    } finally {
      setResendLoading(null)
    }
  }

  // --- parsed metadata for detail ---
  const detailMetadata = detailNotif ? parseMetadata(detailNotif.metadata) : null

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-oliva/10 p-2">
          <History className="h-5 w-5 text-oliva" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Historial de Notificaciones</h1>
          <p className="text-sm text-muted-foreground">Registro de todas las notificaciones enviadas</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            {/* Search input */}
            <div className="flex-1 w-full sm:w-auto">
              <Label className="text-sm text-marron font-medium mb-1 block">Buscar destinatario</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Email o teléfono..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tipo filter */}
            <div className="w-full sm:w-44">
              <Label className="text-sm text-marron font-medium mb-1 block">Tipo</Label>
              <Select value={filtroTipo || 'todos'} onValueChange={handleTipoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estado filter */}
            <div className="w-full sm:w-44">
              <Label className="text-sm text-marron font-medium mb-1 block">Estado</Label>
              <Select value={filtroEstado || 'todos'} onValueChange={handleEstadoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search & Clear buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-mostaza hover:bg-mostaza/90 text-marron font-semibold"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4 mr-1" />
                Buscar
              </Button>
              {(filtroTipo || filtroEstado || filtroDestinatario) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearFilters}
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-marron/10 p-2">
              <History className="h-4 w-4 text-marron" />
            </div>
            <div>
              <p className="text-2xl font-bold text-marron">{total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {notificaciones.filter(n => n.estado === 'pendiente').length}
              </p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-oliva/10 p-2">
              <CheckCircle className="h-4 w-4 text-oliva" />
            </div>
            <div>
              <p className="text-2xl font-bold text-oliva">
                {notificaciones.filter(n => n.estado === 'enviado').length}
              </p>
              <p className="text-xs text-muted-foreground">Enviados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-rojo/10 p-2">
              <AlertCircle className="h-4 w-4 text-rojo" />
            </div>
            <div>
              <p className="text-2xl font-bold text-rojo">
                {notificaciones.filter(n => n.estado === 'error').length}
              </p>
              <p className="text-xs text-muted-foreground">Errores</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-marron/10 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[160px]">Fecha</TableHead>
                <TableHead className="w-[130px]">Tipo</TableHead>
                <TableHead className="w-[180px]">Destinatario</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead className="w-[120px]">Estado</TableHead>
                <TableHead className="w-[100px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-mostaza mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">Cargando historial...</p>
                  </TableCell>
                </TableRow>
              ) : notificaciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <History className="h-10 w-10 opacity-30" />
                      <p>
                        {filtroTipo || filtroEstado || filtroDestinatario
                          ? 'No se encontraron notificaciones con los filtros aplicados'
                          : 'No hay notificaciones registradas'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                notificaciones.map((notif) => (
                  <TableRow key={notif.id} className="hover:bg-mostaza/5">
                    {/* Fecha */}
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {fechaStr(notif.createdAt)}
                    </TableCell>
                    {/* Tipo */}
                    <TableCell>
                      <TipoBadge tipo={notif.tipo} />
                    </TableCell>
                    {/* Destinatario */}
                    <TableCell className="text-sm text-marron max-w-[180px] truncate">
                      {notif.destinatario}
                    </TableCell>
                    {/* Asunto */}
                    <TableCell className="text-sm text-marron max-w-[250px]">
                      {notif.asunto ? (
                        <span title={notif.asunto}>{truncar(notif.asunto, 50)}</span>
                      ) : (
                        <span className="text-muted-foreground italic">Sin asunto</span>
                      )}
                    </TableCell>
                    {/* Estado */}
                    <TableCell>
                      <EstadoBadge estado={notif.estado} />
                    </TableCell>
                    {/* Acciones */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-mostaza/10"
                          onClick={() => openDetail(notif)}
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4 text-mostaza" />
                        </Button>
                        {notif.estado === 'error' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-rojo/10"
                            onClick={() => handleReenviar(notif.id)}
                            disabled={resendLoading === notif.id}
                            title="Reenviar"
                          >
                            {resendLoading === notif.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-rojo" />
                            ) : (
                              <RefreshCw className="h-4 w-4 text-rojo" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {notificaciones.length} de {total} notificaciones — Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {getPageNumbers().map((p, idx) =>
              p === '...' ? (
                <span key={`dots-${idx}`} className="px-2 text-muted-foreground text-sm">
                  ...
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'outline'}
                  size="icon"
                  className={`h-8 w-8 ${p === page ? 'bg-mostaza hover:bg-mostaza/90 text-marron font-semibold' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ),
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* DETAIL DIALOG                                                      */}
      {/* ================================================================== */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-marron flex items-center gap-2">
              <History className="h-5 w-5 text-oliva" />
              Detalle de Notificación #{detailNotif?.id}
            </DialogTitle>
          </DialogHeader>

          {detailNotif && (
            <div className="space-y-4">
              {/* General info cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Info card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-marron">Información</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tipo</span>
                      <TipoBadge tipo={detailNotif.tipo} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Estado</span>
                      <EstadoBadge estado={detailNotif.estado} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Destinatario</span>
                      <span className="font-medium text-marron text-right max-w-[200px] truncate">
                        {detailNotif.destinatario}
                      </span>
                    </div>
                    {detailNotif.plantilla && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plantilla</span>
                        <span className="font-medium text-marron">{detailNotif.plantilla.nombre}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Fechas card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-marron">Fechas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Creación</span>
                      <span className="font-medium text-marron">{fechaStr(detailNotif.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Programada</span>
                      <span className="font-medium text-marron">{fechaStr(detailNotif.fecha_programada)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Envío</span>
                      <span className="font-medium text-marron">{fechaStr(detailNotif.fecha_envio)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Asunto */}
              {detailNotif.asunto && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-marron">Asunto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-marron">{detailNotif.asunto}</p>
                  </CardContent>
                </Card>
              )}

              {/* Mensaje completo */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-marron">Mensaje</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-crema rounded-md p-3 max-h-60 overflow-y-auto custom-scrollbar">
                    <p className="text-sm text-marron whitespace-pre-wrap">{detailNotif.mensaje}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Error details */}
              {detailNotif.error && (
                <Card className="border-rojo/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-rojo flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Detalle del error
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-rojo/5 rounded-md p-3 border border-rojo/20">
                      <p className="text-sm text-rojo whitespace-pre-wrap">{detailNotif.error}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              {detailMetadata && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-marron">Metadata</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-md p-3 max-h-40 overflow-y-auto custom-scrollbar">
                      <pre className="text-xs text-marron whitespace-pre-wrap">
                        {JSON.stringify(detailMetadata, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action: Reenviar for error notifications */}
              {detailNotif.estado === 'error' && (
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    className="bg-rojo hover:bg-rojo/90 text-white font-semibold"
                    onClick={() => handleReenviar(detailNotif.id)}
                    disabled={resendLoading === detailNotif.id}
                  >
                    {resendLoading === detailNotif.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Reenviar notificación
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
