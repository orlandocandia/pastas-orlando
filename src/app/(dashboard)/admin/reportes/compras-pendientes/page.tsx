'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import {
  ShoppingCart,
  Printer,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Leaf,
  PackageOpen,
  UtensilsCrossed,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import dynamic from 'next/dynamic'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount)

const formatNumber = (n: number) =>
  new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(n)

interface ItemStock {
  id: number
  nombre: string
  codigo?: string | null
  stock_actual: number
  stock_minimo: number
  precio_compra_referencia?: number
  precio_venta?: number
  categoria?: { nombre: string } | null
  tipoInsumo?: { nombre: string } | null
  unidadBase?: { nombre: string; codigo: string } | null
  tipo: string
  cantidad_sugerida: number
}

export default function ComprasPendientesPage() {
  const [data, setData] = useState<{
    materiasPrimas: ItemStock[]
    insumos: ItemStock[]
    productosTerminados: ItemStock[]
    totalItems: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const printRef = useRef<HTMLDivElement>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reportes/compras-pendientes')
      if (!res.ok) throw new Error()
      const result = await res.json()
      setData(result)
    } catch {
      toast.error('Error al cargar reporte de compras pendientes')
    } finally {
      setLoading(false)
    }
  }, [])

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
              <title>Compras Pendientes - Pastas Orlando</title>
              <style>
                body { margin: 20px; font-family: sans-serif; color: #5C3A21; font-size: 12px; }
                h1 { color: #E1AD01; } h2 { color: #5C3A21; margin-top: 20px; }
                table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
                th, td { border: 1px solid #d1d5db; padding: 6px 10px; }
                th { background-color: #5C3A21; color: white; text-align: left; }
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

  const renderTable = (items: ItemStock[], showPrecioVenta = false) => (
    <Table>
      <TableHeader>
        <TableRow className="bg-marron/5">
          <TableHead className="font-semibold text-marron">Nombre</TableHead>
          <TableHead className="font-semibold text-marron text-center">Stock Actual</TableHead>
          <TableHead className="font-semibold text-marron text-center">Stock Mínimo</TableHead>
          <TableHead className="font-semibold text-marron text-center">Cant. Sugerida</TableHead>
          <TableHead className="font-semibold text-marron text-right">Precio Ref.</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
              No hay productos con stock bajo en esta categoría
            </TableCell>
          </TableRow>
        ) : (
          items.map((item) => (
            <TableRow key={item.id} className="hover:bg-crema/50">
              <TableCell>
                <div>
                  <p className="font-medium">{item.nombre}</p>
                  {item.codigo && <p className="text-xs text-muted-foreground">{item.codigo}</p>}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <span className="text-rojo font-bold">{formatNumber(item.stock_actual)}</span>
              </TableCell>
              <TableCell className="text-center">{formatNumber(item.stock_minimo)}</TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="bg-mostaza/10 text-marron border-mostaza/30">
                  {formatNumber(item.cantidad_sugerida)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(showPrecioVenta ? (item.precio_venta || 0) : (item.precio_compra_referencia || 0))}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-mostaza" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-rojo/10 p-2">
            <ShoppingCart className="h-5 w-5 text-rojo" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-marron">Compras Pendientes</h1>
            <p className="text-sm text-muted-foreground">
              Productos con stock bajo que requieren reposición
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-rojo text-white">{data?.totalItems || 0} items</Badge>
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="border-marron/30" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-oliva/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Leaf className="h-4 w-4 text-oliva" /> Materias Primas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-oliva">{data.materiasPrimas.length}</p>
            </CardContent>
          </Card>
          <Card className="border-mostaza/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <PackageOpen className="h-4 w-4 text-mostaza" /> Insumos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-mostaza">{data.insumos.length}</p>
            </CardContent>
          </Card>
          <Card className="border-marron/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 text-marron" /> Productos Terminados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-marron">{data.productosTerminados.length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs con tablas */}
      {data && (
        <Tabs defaultValue="materias-primas">
          <TabsList>
            <TabsTrigger value="materias-primas" className="gap-1">
              <Leaf className="h-3.5 w-3.5" /> Materias Primas ({data.materiasPrimas.length})
            </TabsTrigger>
            <TabsTrigger value="insumos" className="gap-1">
              <PackageOpen className="h-3.5 w-3.5" /> Insumos ({data.insumos.length})
            </TabsTrigger>
            <TabsTrigger value="productos-terminados" className="gap-1">
              <UtensilsCrossed className="h-3.5 w-3.5" /> Productos Terminados ({data.productosTerminados.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materias-primas">
            <Card className="border-marron/10">
              <CardContent className="p-0">
                {renderTable(data.materiasPrimas)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insumos">
            <Card className="border-marron/10">
              <CardContent className="p-0">
                {renderTable(data.insumos)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="productos-terminados">
            <Card className="border-marron/10">
              <CardContent className="p-0">
                {renderTable(data.productosTerminados, true)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Print area (hidden) */}
      <div ref={printRef} className="hidden">
        <h1>Compras Pendientes — Pastas Orlando</h1>
        <p>Generado: {new Date().toLocaleDateString('es-AR')}</p>
        {data && (
          <>
            <h2>Materias Primas ({data.materiasPrimas.length})</h2>
            <table>
              <thead><tr><th>Nombre</th><th>Stock Actual</th><th>Stock Mínimo</th><th>Cant. Sugerida</th><th>Precio Ref.</th></tr></thead>
              <tbody>
                {data.materiasPrimas.map(item => (
                  <tr key={item.id}><td>{item.nombre}</td><td className="text-right">{formatNumber(item.stock_actual)}</td><td className="text-right">{formatNumber(item.stock_minimo)}</td><td className="text-right">{formatNumber(item.cantidad_sugerida)}</td><td className="text-right">{formatCurrency(item.precio_compra_referencia || 0)}</td></tr>
                ))}
              </tbody>
            </table>
            <h2>Insumos ({data.insumos.length})</h2>
            <table>
              <thead><tr><th>Nombre</th><th>Stock Actual</th><th>Stock Mínimo</th><th>Cant. Sugerida</th><th>Precio Ref.</th></tr></thead>
              <tbody>
                {data.insumos.map(item => (
                  <tr key={item.id}><td>{item.nombre}</td><td className="text-right">{formatNumber(item.stock_actual)}</td><td className="text-right">{formatNumber(item.stock_minimo)}</td><td className="text-right">{formatNumber(item.cantidad_sugerida)}</td><td className="text-right">{formatCurrency(item.precio_compra_referencia || 0)}</td></tr>
                ))}
              </tbody>
            </table>
            <h2>Productos Terminados ({data.productosTerminados.length})</h2>
            <table>
              <thead><tr><th>Nombre</th><th>Stock Actual</th><th>Stock Mínimo</th><th>Cant. Sugerida</th><th>Precio Ref.</th></tr></thead>
              <tbody>
                {data.productosTerminados.map(item => (
                  <tr key={item.id}><td>{item.nombre}</td><td className="text-right">{formatNumber(item.stock_actual)}</td><td className="text-right">{formatNumber(item.stock_minimo)}</td><td className="text-right">{formatNumber(item.cantidad_sugerida)}</td><td className="text-right">{formatCurrency(item.precio_venta || 0)}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}
