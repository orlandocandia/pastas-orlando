'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Search, Loader2, ChevronLeft, ChevronRight, Eye, FileSpreadsheet, FileText, FileDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import * as XLSX from 'xlsx'

interface AuditoriaEvento {
  id: number
  id_usuario: number | null
  accion: string
  modulo: string
  entidad_id: number | null
  entidad_nombre: string | null
  detalles: string | null
  ip: string | null
  user_agent: string | null
  fecha: string
  usuario: {
    id: number
    email: string
    persona: { nombre: string; apellido: string }
  } | null
}

const accionColors: Record<string, string> = {
  CREATE: 'bg-oliva/10 text-oliva',
  UPDATE: 'bg-mostaza/10 text-mostaza',
  DELETE: 'bg-rojo/10 text-rojo',
  LOGIN_OK: 'bg-oliva/10 text-oliva',
  LOGIN_FAIL: 'bg-rojo/10 text-rojo',
  LOGOUT: 'bg-muted text-muted-foreground',
  EXPORT: 'bg-marron/10 text-marron',
  VIEW: 'bg-muted text-muted-foreground',
}

const moduloLabels: Record<string, string> = {
  productos: 'Productos',
  compras: 'Compras',
  ventas: 'Ventas',
  produccion: 'Producción',
  usuarios: 'Usuarios',
  reportes: 'Reportes',
  login: 'Login',
  stock: 'Stock',
  recetas: 'Recetas',
}

export default function AuditoriaPage() {
  const [eventos, setEventos] = useState<AuditoriaEvento[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroModulo, setFiltroModulo] = useState<string>('')
  const [filtroAccion, setFiltroAccion] = useState<string>('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedEvento, setSelectedEvento] = useState<AuditoriaEvento | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const fetchEventos = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('pagina', pagina.toString())
      params.set('limite', '20')
      if (search) params.set('buscar', search)
      if (filtroModulo) params.set('modulo', filtroModulo)
      if (filtroAccion) params.set('accion', filtroAccion)
      if (fechaDesde) params.set('fecha_desde', fechaDesde)
      if (fechaHasta) params.set('fecha_hasta', fechaHasta)

      const res = await fetch(`/api/auditoria?${params.toString()}`)
      if (!res.ok) throw new Error('Error al cargar auditoría')
      const data = await res.json()
      setEventos(data.data || [])
      setTotal(data.total || 0)
      setTotalPaginas(data.totalPaginas || 1)
    } catch {
      toast.error('Error al cargar auditoría')
    } finally {
      setLoading(false)
    }
  }, [pagina, search, filtroModulo, filtroAccion, fechaDesde, fechaHasta])

  useEffect(() => { fetchEventos() }, [fetchEventos])
  useEffect(() => { setPagina(1) }, [search, filtroModulo, filtroAccion, fechaDesde, fechaHasta])

  const openDetail = (evento: AuditoriaEvento) => {
    setSelectedEvento(evento)
    setDetailOpen(true)
  }

  const exportExcel = () => {
    const exportData = eventos.map(e => ({
      Fecha: new Date(e.fecha).toLocaleString('es-AR'),
      Usuario: e.usuario ? `${e.usuario.persona.nombre} ${e.usuario.persona.apellido}` : 'Sistema',
      Email: e.usuario?.email || '-',
      Acción: e.accion,
      Módulo: moduloLabels[e.modulo] || e.modulo,
      Entidad: e.entidad_nombre || '-',
      IP: e.ip || '-',
    }))
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Auditoría')
    XLSX.writeFile(wb, `auditoria_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportCSV = () => {
    const headers = ['Fecha', 'Usuario', 'Email', 'Acción', 'Módulo', 'Entidad', 'IP']
    const rows = eventos.map(e => [
      new Date(e.fecha).toLocaleString('es-AR'),
      e.usuario ? `${e.usuario.persona.nombre} ${e.usuario.persona.apellido}` : 'Sistema',
      e.usuario?.email || '-',
      e.accion,
      moduloLabels[e.modulo] || e.modulo,
      e.entidad_nombre || '-',
      e.ip || '-',
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const parseDetalles = (detalles: string | null) => {
    if (!detalles) return null
    try { return JSON.parse(detalles) } catch { return detalles }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-marron">Auditoría</h1>
        <p className="text-muted-foreground text-sm">Registro de todas las acciones del sistema</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por usuario, entidad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filtroModulo} onValueChange={setFiltroModulo}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Módulo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(moduloLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroAccion} onValueChange={setFiltroAccion}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Acción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="CREATE">Crear</SelectItem>
              <SelectItem value="UPDATE">Actualizar</SelectItem>
              <SelectItem value="DELETE">Eliminar</SelectItem>
              <SelectItem value="LOGIN_OK">Login OK</SelectItem>
              <SelectItem value="LOGIN_FAIL">Login Fail</SelectItem>
              <SelectItem value="LOGOUT">Logout</SelectItem>
              <SelectItem value="EXPORT">Exportar</SelectItem>
              <SelectItem value="VIEW">Ver</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-full sm:w-36"
            placeholder="Desde"
          />
          <Input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-full sm:w-36"
            placeholder="Hasta"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportExcel} disabled={eventos.length === 0} className="gap-1.5">
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={eventos.length === 0} className="gap-1.5">
            <FileDown className="h-4 w-4" /> CSV
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border border-marron/10 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Fecha</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead className="hidden md:table-cell">Módulo</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead className="hidden lg:table-cell">IP</TableHead>
                <TableHead className="text-right">Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && eventos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-mostaza mx-auto" />
                  </TableCell>
                </TableRow>
              ) : eventos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron eventos de auditoría
                  </TableCell>
                </TableRow>
              ) : (
                eventos.map((evento) => (
                  <TableRow key={evento.id} className="hover:bg-mostaza/5 cursor-pointer" onClick={() => openDetail(evento)}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(evento.fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="font-medium text-marron text-sm">
                      {evento.usuario
                        ? `${evento.usuario.persona.nombre} ${evento.usuario.persona.apellido}`
                        : 'Sistema'}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${accionColors[evento.accion] || 'bg-muted text-muted-foreground'} text-xs`}>
                        {evento.accion}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {moduloLabels[evento.modulo] || evento.modulo}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                      {evento.entidad_nombre || '-'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground font-mono">
                      {evento.ip || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openDetail(evento) }}>
                        <Eye className="h-3.5 w-3.5 text-mostaza" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {total} evento{total !== 1 ? 's' : ''} — Página {pagina} de {totalPaginas}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={pagina <= 1} onClick={() => setPagina(p => p - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={pagina >= totalPaginas} onClick={() => setPagina(p => p + 1)}>
              Siguiente <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-marron">Detalle del Evento #{selectedEvento?.id}</DialogTitle>
          </DialogHeader>
          {selectedEvento && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="font-medium text-muted-foreground">Fecha:</span><br />{new Date(selectedEvento.fecha).toLocaleString('es-AR')}</div>
                <div><span className="font-medium text-muted-foreground">Usuario:</span><br />{selectedEvento.usuario ? `${selectedEvento.usuario.persona.nombre} ${selectedEvento.usuario.persona.apellido}` : 'Sistema'}</div>
                <div><span className="font-medium text-muted-foreground">Acción:</span><br /><Badge className={accionColors[selectedEvento.accion] || 'bg-muted text-muted-foreground'}>{selectedEvento.accion}</Badge></div>
                <div><span className="font-medium text-muted-foreground">Módulo:</span><br />{moduloLabels[selectedEvento.modulo] || selectedEvento.modulo}</div>
                <div><span className="font-medium text-muted-foreground">Entidad ID:</span><br />{selectedEvento.entidad_id || '-'}</div>
                <div><span className="font-medium text-muted-foreground">Entidad Nombre:</span><br />{selectedEvento.entidad_nombre || '-'}</div>
                <div><span className="font-medium text-muted-foreground">IP:</span><br /><span className="font-mono">{selectedEvento.ip || '-'}</span></div>
                <div><span className="font-medium text-muted-foreground">User Agent:</span><br /><span className="font-mono text-xs break-all">{selectedEvento.user_agent || '-'}</span></div>
              </div>
              {selectedEvento.detalles && (
                <div>
                  <span className="font-medium text-muted-foreground text-sm">Cambios / Detalles:</span>
                  <pre className="mt-2 bg-muted p-3 rounded-lg text-xs overflow-x-auto max-h-60">
                    {JSON.stringify(parseDetalles(selectedEvento.detalles), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
