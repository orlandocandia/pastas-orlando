'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import {
  ClipboardList,
  Printer,
  RefreshCw,
  Loader2,
  DollarSign,
  Clock,
  TrendingUp,
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
import { Progress } from '@/components/ui/progress'

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

interface ProductoPedidos {
  nombre: string
  cantidad: number
}

interface PedidoItem {
  id: number
  fecha_pedido: string
  total: number
  senia: number
  observaciones?: string | null
  cliente: {
    id: number
    nombre: string
    apellido: string
    razon_social?: string | null
    contactos: Array<{ valor: string }>
  }
  estado: {
    id: number
    nombre_estado: string
  } | null
  detalle: Array<{
    cantidad: number
    precio_unitario: number
    subtotal: number
    productoTerminado: { nombre: string }
  }>
}

export default function PedidosDiaPage() {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [resumen, setResumen] = useState({ total_pedidos: 0, total_pesos: 0, pedidos_pendientes: 0 })
  const [productosMasPedidos, setProductosMasPedidos] = useState<ProductoPedidos[]>([])
  const [pedidos, setPedidos] = useState<PedidoItem[]>([])
  const printRef = useRef<HTMLDivElement>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reportes/pedidos-dia?fecha=${fecha}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setResumen(data.resumen || { total_pedidos: 0, total_pesos: 0, pedidos_pendientes: 0 })
      setProductosMasPedidos(data.productosMasPedidos || [])
      setPedidos(data.pedidos || [])
    } catch {
      toast.error('Error al cargar pedidos del día')
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
              <title>Pedidos del Día — Pastas Orlando</title>
              <style>
                body { margin: 20px; font-family: sans-serif; color: #5C3A21; font-size: 12px; }
                h1 { color: #E1AD01; } h2 { color: #5C3A21; margin-top: 20px; }
                table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
                th, td { border: 1px solid #d1d5db; padding: 6px 10px; }
                th { background-color: #5C3A21; color: white; text-align: left; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .text-center { text-align: center; }
                .bar { height: 16px; background-color: #E1AD01; border-radius: 3px; }
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

  const maxCantidad = productosMasPedidos.length > 0 ? productosMasPedidos[0].cantidad : 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-mostaza/10 p-2">
            <ClipboardList className="h-5 w-5 text-mostaza" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-marron">Pedidos del Día</h1>
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
              <ClipboardList className="h-4 w-4 text-marron" /> Total Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-marron">{resumen.total_pedidos}</p>
          </CardContent>
        </Card>
        <Card className="border-oliva/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-oliva" /> Total en Pesos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-oliva">{formatCurrency(resumen.total_pesos)}</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" /> Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{resumen.pedidos_pendientes}</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-mostaza" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Productos más pedidos */}
          <Card className="border-marron/10 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-marron flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-mostaza" /> Productos Más Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {productosMasPedidos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No hay datos</p>
              ) : (
                productosMasPedidos.map((producto, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-marron truncate mr-2">{producto.nombre}</span>
                      <span className="text-muted-foreground shrink-0">{producto.cantidad} u.</span>
                    </div>
                    <Progress
                      value={(producto.cantidad / maxCantidad) * 100}
                      className="h-2"
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Tabla de pedidos */}
          <Card className="border-marron/10 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-marron">Todos los Pedidos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pedidos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No hay pedidos para esta fecha</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-marron/5">
                        <TableHead className="font-semibold text-marron">N°</TableHead>
                        <TableHead className="font-semibold text-marron">Cliente</TableHead>
                        <TableHead className="font-semibold text-marron">Productos</TableHead>
                        <TableHead className="font-semibold text-marron text-center">Estado</TableHead>
                        <TableHead className="font-semibold text-marron text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pedidos.map((pedido) => (
                        <TableRow key={pedido.id} className="hover:bg-crema/50">
                          <TableCell className="font-mono font-semibold text-mostaza">#{pedido.id}</TableCell>
                          <TableCell className="font-medium">
                            {pedido.cliente.razon_social || `${pedido.cliente.nombre} ${pedido.cliente.apellido}`}
                          </TableCell>
                          <TableCell className="text-sm max-w-48 truncate">
                            {pedido.detalle.map(d => `${d.cantidad}x ${d.productoTerminado.nombre}`).join(', ')}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-xs">
                              {pedido.estado?.nombre_estado || '—'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(pedido.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Print area (hidden) */}
      <div ref={printRef} className="hidden">
        <h1>Pedidos del Día — Pastas Orlando</h1>
        <p className="capitalize">{formatDate(fecha)}</p>
        <p>Total pedidos: {resumen.total_pedidos} | Total: {formatCurrency(resumen.total_pesos)} | Pendientes: {resumen.pedidos_pendientes}</p>
        {productosMasPedidos.length > 0 && (
          <>
            <h2>Productos Más Pedidos</h2>
            <table>
              <thead><tr><th>Producto</th><th className="text-right">Cantidad</th></tr></thead>
              <tbody>
                {productosMasPedidos.map((p, i) => (
                  <tr key={i}><td>{p.nombre}</td><td className="text-right">{p.cantidad}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <h2>Detalle de Pedidos</h2>
        <table>
          <thead><tr><th>N°</th><th>Cliente</th><th>Productos</th><th>Estado</th><th className="text-right">Total</th></tr></thead>
          <tbody>
            {pedidos.map(p => (
              <tr key={p.id}>
                <td>#{p.id}</td>
                <td>{p.cliente.razon_social || `${p.cliente.nombre} ${p.cliente.apellido}`}</td>
                <td>{p.detalle.map(d => `${d.cantidad}x ${d.productoTerminado.nombre}`).join(', ')}</td>
                <td>{p.estado?.nombre_estado || '—'}</td>
                <td className="text-right">{formatCurrency(p.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
