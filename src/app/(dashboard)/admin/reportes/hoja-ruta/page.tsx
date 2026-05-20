'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import {
  Truck,
  Printer,
  RefreshCw,
  Loader2,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

import dynamic from 'next/dynamic'

const HojaRutaPrint = dynamic(() => import('@/components/print/HojaRutaPrint'), {
  ssr: false,
})

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount)

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

interface Entrega {
  id: number
  direccion_alternativa?: string | null
  fecha_programada: string
  hora_desde?: string | null
  hora_hasta?: string | null
  estado: string
  nombre_recibe?: string | null
  telefono_recibe?: string | null
  observaciones?: string | null
  pedido: {
    id: number
    cliente: {
      id: number
      nombre: string
      apellido: string
      razon_social?: string | null
      contactos: Array<{ valor: string }>
      direcciones: Array<{ direccion: string }>
    }
    detalle: Array<{
      cantidad: number
      productoTerminado: { nombre: string }
    }>
  }
  puntoEncuentro?: {
    nombre: string
    direccion: string
  } | null
}

const estadoConfig: Record<string, { label: string; color: string }> = {
  programado: { label: 'Programado', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  en_camino: { label: 'En camino', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800 border-green-300' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-300' },
  reagendado: { label: 'Reagendado', color: 'bg-gray-100 text-gray-600 border-gray-300' },
}

export default function HojaRutaPage() {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [resumen, setResumen] = useState({ total_entregas: 0, entregas_programadas: 0, entregas_en_camino: 0 })
  const [loading, setLoading] = useState(true)
  const [showPrint, setShowPrint] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reportes/hoja-ruta?fecha=${fecha}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setEntregas(data.entregas || [])
      setResumen(data.resumen || { total_entregas: 0, entregas_programadas: 0, entregas_en_camino: 0 })
    } catch {
      toast.error('Error al cargar hoja de ruta')
    } finally {
      setLoading(false)
    }
  }, [fecha])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Hoja de Ruta — Pastas Orlando</title>
              <style>
                body { margin: 20px; font-family: sans-serif; color: #5C3A21; font-size: 11px; }
                h1 { color: #E1AD01; } h2 { color: #5C3A21; }
                table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
                th, td { border: 1px solid #d1d5db; padding: 6px 8px; }
                th { background-color: #5C3A21; color: white; text-align: left; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
              </style>
            </head>
            <body>${printRef.current.innerHTML}</body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const getClienteNombre = (entrega: Entrega) =>
    entrega.pedido.cliente.razon_social || `${entrega.pedido.cliente.nombre} ${entrega.pedido.cliente.apellido}`

  const getDireccion = (entrega: Entrega) =>
    entrega.direccion_alternativa || entrega.puntoEncuentro?.direccion || entrega.pedido.cliente.direcciones[0]?.direccion || '—'

  const getTelefono = (entrega: Entrega) =>
    entrega.telefono_recibe || entrega.pedido.cliente.contactos[0]?.valor || '—'

  const getProductos = (entrega: Entrega) =>
    entrega.pedido.detalle.map(d => `${d.cantidad}x ${d.productoTerminado.nombre}`).join(', ')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-mostaza/10 p-2">
            <Truck className="h-5 w-5 text-mostaza" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-marron">Hoja de Ruta</h1>
            <p className="text-sm text-muted-foreground capitalize">{formatDate(fecha)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-40"
          />
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="border-marron/30" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-marron/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Truck className="h-4 w-4 text-marron" /> Total Entregas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-marron">{resumen.total_entregas}</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" /> Programadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{resumen.entregas_programadas}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" /> En Camino
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{resumen.entregas_en_camino}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de entregas */}
      <Card className="border-marron/10">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-mostaza" />
            </div>
          ) : entregas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Truck className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No hay entregas programadas para esta fecha</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-marron/5">
                    <TableHead className="font-semibold text-marron text-center w-12">N°</TableHead>
                    <TableHead className="font-semibold text-marron">Cliente</TableHead>
                    <TableHead className="font-semibold text-marron">Dirección</TableHead>
                    <TableHead className="font-semibold text-marron text-center">Teléfono</TableHead>
                    <TableHead className="font-semibold text-marron">Productos</TableHead>
                    <TableHead className="font-semibold text-marron text-center">Horario</TableHead>
                    <TableHead className="font-semibold text-marron text-center">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entregas.map((entrega, i) => {
                    const estCfg = estadoConfig[entrega.estado] || estadoConfig.programado
                    return (
                      <TableRow key={entrega.id} className="hover:bg-crema/50">
                        <TableCell className="text-center font-semibold text-mostaza">{i + 1}</TableCell>
                        <TableCell>
                          <p className="font-medium">{getClienteNombre(entrega)}</p>
                          {entrega.nombre_recibe && (
                            <p className="text-xs text-muted-foreground">Recibe: {entrega.nombre_recibe}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{getDireccion(entrega)}</TableCell>
                        <TableCell className="text-center text-sm">{getTelefono(entrega)}</TableCell>
                        <TableCell className="text-sm max-w-48 truncate">{getProductos(entrega)}</TableCell>
                        <TableCell className="text-center text-sm">
                          {entrega.hora_desde ? `${entrega.hora_desde} - ${entrega.hora_hasta || ''}` : '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={estCfg.color}>{estCfg.label}</Badge>
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

      {/* Vista de impresión */}
      {showPrint && (
        <Card className="border-marron/10">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base text-marron">Vista de Impresión</CardTitle>
            <Button size="sm" className="bg-mostaza hover:bg-mostaza/90 text-marron font-semibold" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" /> Imprimir
            </Button>
          </CardHeader>
          <CardContent>
            <HojaRutaPrint
              ref={printRef}
              fecha={fecha}
              entregas={entregas.map((entrega, i) => ({
                numero: i + 1,
                cliente: getClienteNombre(entrega),
                direccion: getDireccion(entrega),
                telefono: getTelefono(entrega),
                pedido: getProductos(entrega),
                horario: entrega.hora_desde ? `${entrega.hora_desde} - ${entrega.hora_hasta || ''}` : '—',
              }))}
            />
          </CardContent>
        </Card>
      )}

      <Button
        variant="outline"
        className="border-marron/30"
        onClick={() => setShowPrint(!showPrint)}
      >
        <Printer className="h-4 w-4 mr-2" />
        {showPrint ? 'Ocultar vista de impresión' : 'Vista de impresión'}
      </Button>
    </div>
  )
}
