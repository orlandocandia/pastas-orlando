'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  FileText,
  Plus,
  Search,
  Printer,
  MessageCircle,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRightLeft,
  AlertCircle,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount)

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('es-AR')
  } catch {
    return dateStr
  }
}

interface Presupuesto {
  id: number
  numero: string
  fecha_creacion: string
  fecha_validez: string
  subtotal: number
  iva: number
  total: number
  observaciones?: string | null
  estado: string
  id_pedido?: number | null
  cliente: {
    id: number
    nombre: string
    apellido: string
    razon_social?: string | null
    cuit?: string | null
    condicion_iva?: string | null
  }
  detalle: Array<{
    id: number
    cantidad: number
    precio_unitario: number
    subtotal: number
    productoTerminado: {
      id: number
      nombre: string
      precio_venta: number
    }
  }>
  pedido?: { id: number } | null
}

const estadoConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <Clock className="h-3 w-3" /> },
  aprobado: { label: 'Aprobado', color: 'bg-green-100 text-green-800 border-green-300', icon: <CheckCircle2 className="h-3 w-3" /> },
  rechazado: { label: 'Rechazado', color: 'bg-red-100 text-red-800 border-red-300', icon: <XCircle className="h-3 w-3" /> },
  expirado: { label: 'Expirado', color: 'bg-gray-100 text-gray-600 border-gray-300', icon: <AlertCircle className="h-3 w-3" /> },
  convertido: { label: 'Convertido', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: <ArrowRightLeft className="h-3 w-3" /> },
}

export default function PresupuestosPage() {
  const router = useRouter()
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [loading, setLoading] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<string>('')
  const [cambioEstadoDialog, setCambioEstadoDialog] = useState<{ open: boolean; presupuesto: Presupuesto | null }>({ open: false, presupuesto: null })
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [cambiandoEstado, setCambiandoEstado] = useState(false)

  const fetchPresupuestos = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (buscar) params.set('buscar', buscar)
      if (estadoFilter) params.set('estado', estadoFilter)
      params.set('pagina', pagina.toString())
      params.set('limite', '15')

      const res = await fetch(`/api/presupuestos?${params.toString()}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPresupuestos(data.data)
      setTotal(data.total)
      setTotalPaginas(data.totalPaginas)
    } catch {
      toast.error('Error al cargar presupuestos')
    } finally {
      setLoading(false)
    }
  }, [buscar, estadoFilter, pagina])

  useEffect(() => {
    fetchPresupuestos()
  }, [fetchPresupuestos])

  const handleCambiarEstado = async () => {
    if (!cambioEstadoDialog.presupuesto || !nuevoEstado) return
    setCambiandoEstado(true)
    try {
      const res = await fetch(`/api/presupuestos/${cambioEstadoDialog.presupuesto.id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      if (!res.ok) throw new Error()
      toast.success('Estado actualizado correctamente')
      setCambioEstadoDialog({ open: false, presupuesto: null })
      fetchPresupuestos()
    } catch {
      toast.error('Error al cambiar estado')
    } finally {
      setCambiandoEstado(false)
    }
  }

  const getWhatsAppLink = (presupuesto: Presupuesto) => {
    const cliente = presupuesto.cliente.razon_social || `${presupuesto.cliente.nombre} ${presupuesto.cliente.apellido}`
    const productos = presupuesto.detalle
      .map(d => `- ${d.productoTerminado.nombre} x${d.cantidad}: ${formatCurrency(d.subtotal)}`)
      .join('%0A')
    const texto = `Hola ${cliente}, te enviamos el presupuesto N° ${presupuesto.numero}%0A%0A${productos}%0A%0ATotal: ${formatCurrency(presupuesto.total)}%0AVálido hasta: ${formatDate(presupuesto.fecha_validez)}`
    return `https://wa.me/?text=${texto}`
  }

  const getAccionesDisponibles = (estado: string) => {
    switch (estado) {
      case 'pendiente': return ['aprobado', 'rechazado']
      case 'aprobado': return ['convertido', 'pendiente']
      case 'rechazado':
      case 'expirado': return ['pendiente']
      default: return []
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-mostaza/10 p-2">
            <FileText className="h-5 w-5 text-mostaza" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-marron">Presupuestos</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona cotizaciones y presupuestos para clientes
            </p>
          </div>
        </div>
        <Button
          className="bg-mostaza hover:bg-mostaza/90 text-marron font-semibold"
          onClick={() => router.push('/admin/presupuestos/nuevo')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Presupuesto
        </Button>
      </div>

      {/* Filtros */}
      <Card className="border-marron/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número o cliente..."
                value={buscar}
                onChange={(e) => { setBuscar(e.target.value); setPagina(1) }}
                className="pl-9"
              />
            </div>
            <Select value={estadoFilter} onValueChange={(v) => { setEstadoFilter(v === 'todos' ? '' : v); setPagina(1) }}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
                <SelectItem value="expirado">Expirado</SelectItem>
                <SelectItem value="convertido">Convertido</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchPresupuestos}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card className="border-marron/10">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-mostaza" />
            </div>
          ) : presupuestos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No se encontraron presupuestos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-marron/5">
                    <TableHead className="font-semibold text-marron">N°</TableHead>
                    <TableHead className="font-semibold text-marron">Fecha</TableHead>
                    <TableHead className="font-semibold text-marron">Cliente</TableHead>
                    <TableHead className="font-semibold text-marron text-right">Total</TableHead>
                    <TableHead className="font-semibold text-marron">Válido hasta</TableHead>
                    <TableHead className="font-semibold text-marron">Estado</TableHead>
                    <TableHead className="font-semibold text-marron text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {presupuestos.map((p) => {
                    const estCfg = estadoConfig[p.estado] || estadoConfig.pendiente
                    return (
                      <TableRow key={p.id} className="hover:bg-crema/50">
                        <TableCell className="font-mono font-semibold text-mostaza">{p.numero}</TableCell>
                        <TableCell>{formatDate(p.fecha_creacion)}</TableCell>
                        <TableCell className="font-medium">
                          {p.cliente.razon_social || `${p.cliente.nombre} ${p.cliente.apellido}`}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(p.total)}</TableCell>
                        <TableCell>{formatDate(p.fecha_validez)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${estCfg.color} gap-1`}>
                            {estCfg.icon}
                            {estCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver detalle" onClick={() => router.push(`/admin/presupuestos/${p.id}`)}>
                              <Eye className="h-4 w-4 text-marron" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Imprimir" onClick={() => router.push(`/admin/presupuestos/${p.id}`)}>
                              <Printer className="h-4 w-4 text-marron" />
                            </Button>
                            <a href={getWhatsAppLink(p)} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="Enviar WhatsApp">
                                <MessageCircle className="h-4 w-4 text-whatsapp" />
                              </Button>
                            </a>
                            {getAccionesDisponibles(p.estado).length > 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Cambiar estado"
                                onClick={() => {
                                  setCambioEstadoDialog({ open: true, presupuesto: p })
                                  setNuevoEstado('')
                                }}
                              >
                                <ArrowRightLeft className="h-4 w-4 text-mostaza" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {total} presupuesto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {pagina} de {totalPaginas}
            </span>
            <Button variant="outline" size="sm" disabled={pagina >= totalPaginas} onClick={() => setPagina(pagina + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog cambio de estado */}
      <Dialog open={cambioEstadoDialog.open} onOpenChange={(open) => setCambioEstadoDialog({ open, presupuesto: cambioEstadoDialog.presupuesto })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-marron">Cambiar Estado del Presupuesto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Presupuesto <strong>{cambioEstadoDialog.presupuesto?.numero}</strong> — Estado actual:{' '}
              <Badge variant="outline" className={estadoConfig[cambioEstadoDialog.presupuesto?.estado || 'pendiente']?.color}>
                {estadoConfig[cambioEstadoDialog.presupuesto?.estado || 'pendiente']?.label}
              </Badge>
            </p>
            <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nuevo estado" />
              </SelectTrigger>
              <SelectContent>
                {cambioEstadoDialog.presupuesto && getAccionesDisponibles(cambioEstadoDialog.presupuesto.estado).map((est) => (
                  <SelectItem key={est} value={est}>
                    {estadoConfig[est]?.label || est}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {nuevoEstado === 'convertido' && (
              <p className="text-sm text-oliva bg-oliva/10 p-3 rounded">
                Se creará un Pedido de Cliente automáticamente al convertir este presupuesto.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCambioEstadoDialog({ open: false, presupuesto: null })}>
              Cancelar
            </Button>
            <Button
              className="bg-mostaza hover:bg-mostaza/90 text-marron font-semibold"
              disabled={!nuevoEstado || cambiandoEstado}
              onClick={handleCambiarEstado}
            >
              {cambiandoEstado ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
