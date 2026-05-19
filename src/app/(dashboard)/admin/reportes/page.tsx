'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Loader2, DollarSign, ShoppingCart, Package, Factory, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import ExportadorExcel from '@/components/admin/reportes/ExportadorExcel'
import ExportadorPDF from '@/components/admin/reportes/ExportadorPDF'
import ExportadorCSV from '@/components/admin/reportes/ExportadorCSV'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price)

const formatNumber = (n: number) =>
  new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(n)

export default function ReportesPage() {
  const [tab, setTab] = useState('ventas')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [loading, setLoading] = useState(false)

  // Data states
  const [ventasData, setVentasData] = useState<any>(null)
  const [comprasData, setComprasData] = useState<any>(null)
  const [stockData, setStockData] = useState<any>(null)
  const [produccionData, setProduccionData] = useState<any>(null)
  const [finanzasData, setFinanzasData] = useState<any>(null)

  const setDateRange = (range: string) => {
    const hoy = new Date()
    let desde = ''
    switch (range) {
      case 'hoy':
        desde = hoy.toISOString().split('T')[0]
        break
      case 'semana': {
        const hace7 = new Date(hoy)
        hace7.setDate(hace7.getDate() - 7)
        desde = hace7.toISOString().split('T')[0]
        break
      }
      case 'mes': {
        const hace30 = new Date(hoy)
        hace30.setDate(hace30.getDate() - 30)
        desde = hace30.toISOString().split('T')[0]
        break
      }
      case 'anio': {
        desde = `${hoy.getFullYear()}-01-01`
        break
      }
    }
    setFechaDesde(desde)
    setFechaHasta(hoy.toISOString().split('T')[0])
  }

  const fetchVentas = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (fechaDesde) params.set('fecha_desde', fechaDesde)
      if (fechaHasta) params.set('fecha_hasta', fechaHasta)
      const res = await fetch(`/api/reportes/ventas?${params.toString()}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setVentasData(data)
    } catch { toast.error('Error al cargar reporte de ventas') }
    finally { setLoading(false) }
  }, [fechaDesde, fechaHasta])

  const fetchCompras = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (fechaDesde) params.set('fecha_desde', fechaDesde)
      if (fechaHasta) params.set('fecha_hasta', fechaHasta)
      const res = await fetch(`/api/reportes/compras?${params.toString()}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setComprasData(data)
    } catch { toast.error('Error al cargar reporte de compras') }
    finally { setLoading(false) }
  }, [fechaDesde, fechaHasta])

  const fetchStock = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reportes/stock')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setStockData(data)
    } catch { toast.error('Error al cargar reporte de stock') }
    finally { setLoading(false) }
  }, [])

  const fetchProduccion = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (fechaDesde) params.set('fecha_desde', fechaDesde)
      if (fechaHasta) params.set('fecha_hasta', fechaHasta)
      const res = await fetch(`/api/reportes/produccion?${params.toString()}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setProduccionData(data)
    } catch { toast.error('Error al cargar reporte de producción') }
    finally { setLoading(false) }
  }, [fechaDesde, fechaHasta])

  const fetchFinanzas = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (fechaDesde) params.set('fecha_desde', fechaDesde)
      if (fechaHasta) params.set('fecha_hasta', fechaHasta)
      const res = await fetch(`/api/reportes/finanzas?${params.toString()}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setFinanzasData(data)
    } catch { toast.error('Error al cargar reporte financiero') }
    finally { setLoading(false) }
  }, [fechaDesde, fechaHasta])

  useEffect(() => {
    switch (tab) {
      case 'ventas': fetchVentas(); break
      case 'compras': fetchCompras(); break
      case 'stock': fetchStock(); break
      case 'produccion': fetchProduccion(); break
      case 'finanzas': fetchFinanzas(); break
    }
  }, [tab, fetchVentas, fetchCompras, fetchStock, fetchProduccion, fetchFinanzas])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-marron">Reportes</h1>
        <p className="text-muted-foreground text-sm">Reportes exportables del sistema</p>
      </div>

      {/* Date Range Selector */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setDateRange('hoy')} className="text-xs">Hoy</Button>
          <Button variant="outline" size="sm" onClick={() => setDateRange('semana')} className="text-xs">Semana</Button>
          <Button variant="outline" size="sm" onClick={() => setDateRange('mes')} className="text-xs">Mes</Button>
          <Button variant="outline" size="sm" onClick={() => setDateRange('anio')} className="text-xs">Año</Button>
        </div>
        <div className="flex gap-2 items-center">
          <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="w-36" />
          <span className="text-muted-foreground">a</span>
          <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="w-36" />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="ventas">Ventas</TabsTrigger>
          <TabsTrigger value="compras">Compras</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="produccion">Producción</TabsTrigger>
          <TabsTrigger value="finanzas">Finanzas</TabsTrigger>
        </TabsList>

        {/* VENTAS */}
        <TabsContent value="ventas" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-mostaza" /></div>
          ) : ventasData ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-marron/5">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Ventas</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold text-marron">{formatPrice(ventasData.resumen.totalVentas)}</p></CardContent>
                </Card>
                <Card className="border-marron/5">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Cantidad</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold text-marron">{ventasData.resumen.cantidadVentas}</p></CardContent>
                </Card>
                <Card className="border-marron/5">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Ticket Promedio</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold text-marron">{formatPrice(ventasData.resumen.ticketPromedio)}</p></CardContent>
                </Card>
              </div>

              {/* Productos más vendidos */}
              <Card className="border-marron/5">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base text-marron">Productos Más Vendidos</CardTitle>
                  <div className="flex gap-2">
                    <ExportadorExcel data={ventasData.productosMasVendidos} filename="productos_mas_vendidos" columns={[{ key: 'nombre', header: 'Producto' }, { key: 'cantidad', header: 'Cantidad' }, { key: 'subtotal', header: 'Subtotal' }]} modulo="reportes" />
                    <ExportadorCSV data={ventasData.productosMasVendidos} filename="productos_mas_vendidos" columns={[{ key: 'nombre', header: 'Producto' }, { key: 'cantidad', header: 'Cantidad' }, { key: 'subtotal', header: 'Subtotal' }]} modulo="reportes" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Producto</TableHead><TableHead className="text-right">Cantidad</TableHead><TableHead className="text-right">Subtotal</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {ventasData.productosMasVendidos.map((p: any, i: number) => (
                        <TableRow key={i}><TableCell className="font-medium">{p.nombre}</TableCell><TableCell className="text-right">{formatNumber(p.cantidad)}</TableCell><TableCell className="text-right">{formatPrice(p.subtotal)}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Clientes más frecuentes */}
              <Card className="border-marron/5">
                <CardHeader><CardTitle className="text-base text-marron">Clientes Más Frecuentes</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Cliente</TableHead><TableHead className="text-right">Compras</TableHead><TableHead className="text-right">Total</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {ventasData.clientesMasFrecuentes.map((c: any, i: number) => (
                        <TableRow key={i}><TableCell className="font-medium">{c.nombre}</TableCell><TableCell className="text-right">{c.compras}</TableCell><TableCell className="text-right">{formatPrice(c.total)}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Ventas por día */}
              <Card className="border-marron/5">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base text-marron">Ventas por Día</CardTitle>
                  <div className="flex gap-2">
                    <ExportadorExcel data={ventasData.ventasPorDia} filename="ventas_por_dia" columns={[{ key: 'fecha', header: 'Fecha' }, { key: 'cantidad', header: 'Ventas' }, { key: 'total', header: 'Total' }]} modulo="reportes" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead>Fecha</TableHead><TableHead className="text-right">Ventas</TableHead><TableHead className="text-right">Total</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {ventasData.ventasPorDia.map((d: any, i: number) => (
                          <TableRow key={i}><TableCell>{d.fecha}</TableCell><TableCell className="text-right">{d.cantidad}</TableCell><TableCell className="text-right">{formatPrice(d.total)}</TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* COMPRAS */}
        <TabsContent value="compras" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-mostaza" /></div>
          ) : comprasData ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-marron/5">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Compras</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold text-marron">{formatPrice(comprasData.resumen.totalCompras)}</p></CardContent>
                </Card>
                <Card className="border-marron/5">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Cantidad</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold text-marron">{comprasData.resumen.cantidadCompras}</p></CardContent>
                </Card>
                <Card className="border-marron/5">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Promedio</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold text-marron">{formatPrice(comprasData.resumen.promedioCompra)}</p></CardContent>
                </Card>
              </div>

              <Card className="border-marron/5">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base text-marron">Proveedores Más Utilizados</CardTitle>
                  <div className="flex gap-2">
                    <ExportadorExcel data={comprasData.proveedoresMasUtilizados} filename="proveedores" columns={[{ key: 'nombre', header: 'Proveedor' }, { key: 'compras', header: 'Compras' }, { key: 'total', header: 'Total' }]} modulo="reportes" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Proveedor</TableHead><TableHead className="text-right">Compras</TableHead><TableHead className="text-right">Total</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {comprasData.proveedoresMasUtilizados.map((p: any, i: number) => (
                        <TableRow key={i}><TableCell className="font-medium">{p.nombre}</TableCell><TableCell className="text-right">{p.compras}</TableCell><TableCell className="text-right">{formatPrice(p.total)}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-marron/5">
                <CardHeader><CardTitle className="text-base text-marron">Productos Más Comprados</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Producto</TableHead><TableHead className="text-right">Cantidad</TableHead><TableHead className="text-right">Total</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {comprasData.productosMasComprados.map((p: any, i: number) => (
                        <TableRow key={i}><TableCell className="font-medium">{p.nombre}</TableCell><TableCell className="text-right">{formatNumber(p.cantidad)}</TableCell><TableCell className="text-right">{formatPrice(p.total)}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* STOCK */}
        <TabsContent value="stock" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-mostaza" /></div>
          ) : stockData ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-marron/5">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Valor Stock Total</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold text-marron">{formatPrice(stockData.resumen.valorStockTotal)}</p></CardContent>
                </Card>
                <Card className="border-marron/5">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Stock Crítico</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold text-rojo">{stockData.resumen.stockCriticoMP + stockData.resumen.stockCriticoInsumos + stockData.resumen.stockCriticoPT}</p></CardContent>
                </Card>
                <Card className="border-marron/5">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Valor MP</CardTitle></CardHeader>
                  <CardContent><p className="text-xl font-bold text-marron">{formatPrice(stockData.resumen.valorStockMP)}</p></CardContent>
                </Card>
                <Card className="border-marron/5">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Valor PT</CardTitle></CardHeader>
                  <CardContent><p className="text-xl font-bold text-marron">{formatPrice(stockData.resumen.valorStockPT)}</p></CardContent>
                </Card>
              </div>

              {/* Alertas de Stock */}
              {stockData.alertasStock.length > 0 && (
                <Card className="border-rojo/20 bg-rojo/5">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base text-rojo flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" /> Alertas de Stock Bajo
                    </CardTitle>
                    <div className="flex gap-2">
                      <ExportadorExcel data={stockData.alertasStock} filename="alertas_stock" columns={[{ key: 'tipo', header: 'Tipo' }, { key: 'nombre', header: 'Nombre' }, { key: 'stock_actual', header: 'Stock Actual' }, { key: 'stock_minimo', header: 'Stock Mínimo' }]} modulo="reportes" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead>Tipo</TableHead><TableHead>Nombre</TableHead><TableHead className="text-right">Stock Actual</TableHead><TableHead className="text-right">Stock Mínimo</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {stockData.alertasStock.map((a: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell><Badge variant="outline" className="text-xs">{a.tipo}</Badge></TableCell>
                            <TableCell className="font-medium">{a.nombre}</TableCell>
                            <TableCell className="text-right text-rojo font-bold">{formatNumber(a.stock_actual)} {a.unidad}</TableCell>
                            <TableCell className="text-right">{formatNumber(a.stock_minimo)} {a.unidad}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Productos Terminados */}
              <Card className="border-marron/5">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base text-marron">Stock de Productos Terminados</CardTitle>
                  <div className="flex gap-2">
                    <ExportadorExcel data={stockData.productosTerminados.map((p: any) => ({ nombre: p.nombre, categoria: p.categoria?.nombre, stock_actual: p.stock_actual, stock_minimo: p.stock_minimo, precio_venta: p.precio_venta, valor: p.stock_actual * p.precio_venta }))} filename="stock_pt" columns={[{ key: 'nombre', header: 'Producto' }, { key: 'categoria', header: 'Categoría' }, { key: 'stock_actual', header: 'Stock' }, { key: 'precio_venta', header: 'Precio' }, { key: 'valor', header: 'Valor' }]} modulo="reportes" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead>Producto</TableHead><TableHead>Categoría</TableHead><TableHead className="text-right">Stock</TableHead><TableHead className="text-right">Precio</TableHead><TableHead className="text-right">Valor</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {stockData.productosTerminados.map((p: any) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.nombre}</TableCell>
                            <TableCell><Badge variant="outline" className="text-xs">{p.categoria?.nombre}</Badge></TableCell>
                            <TableCell className="text-right"><span className={p.stock_actual <= p.stock_minimo ? 'text-rojo font-bold' : ''}>{formatNumber(p.stock_actual)}</span></TableCell>
                            <TableCell className="text-right">{formatPrice(p.precio_venta)}</TableCell>
                            <TableCell className="text-right">{formatPrice(p.stock_actual * p.precio_venta)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* PRODUCCIÓN */}
        <TabsContent value="produccion" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-mostaza" /></div>
          ) : produccionData ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-marron/5">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Producido</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold text-marron">{produccionData.resumen.totalProducido} u.</p></CardContent>
                </Card>
                <Card className="border-marron/5">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Costo Total</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold text-marron">{formatPrice(produccionData.resumen.costoTotal)}</p></CardContent>
                </Card>
                <Card className="border-marron/5">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Costo Promedio</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold text-marron">{formatPrice(produccionData.resumen.costoPromedio)}/u</p></CardContent>
                </Card>
              </div>

              <Card className="border-marron/5">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base text-marron">Costos por Producto</CardTitle>
                  <div className="flex gap-2">
                    <ExportadorExcel data={produccionData.costosPorProducto.map((c: any) => ({ producto: c.producto, producido: c.producido, costoTotal: c.costoTotal, costoPromedio: c.costoPromedio }))} filename="costos_produccion" columns={[{ key: 'producto', header: 'Producto' }, { key: 'producido', header: 'Producido' }, { key: 'costoTotal', header: 'Costo Total' }, { key: 'costoPromedio', header: 'Costo Prom.' }]} modulo="reportes" />
                    <ExportadorPDF data={produccionData.costosPorProducto.map((c: any) => ({ producto: c.producto, producido: String(c.producido), costoTotal: formatPrice(c.costoTotal), costoPromedio: formatPrice(c.costoPromedio) }))} filename="costos_produccion" title="Costos de Producción" columns={[{ key: 'producto', header: 'Producto' }, { key: 'producido', header: 'Producido' }, { key: 'costoTotal', header: 'Costo Total' }, { key: 'costoPromedio', header: 'Costo Prom.' }]} modulo="reportes" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Producto</TableHead><TableHead className="text-right">Producido</TableHead><TableHead className="text-right">Costo Total</TableHead><TableHead className="text-right">Costo Prom.</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {produccionData.costosPorProducto.map((c: any, i: number) => (
                        <TableRow key={i}><TableCell className="font-medium">{c.producto}</TableCell><TableCell className="text-right">{c.producido} u.</TableCell><TableCell className="text-right">{formatPrice(c.costoTotal)}</TableCell><TableCell className="text-right">{formatPrice(c.costoPromedio)}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* FINANZAS */}
        <TabsContent value="finanzas" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-mostaza" /></div>
          ) : finanzasData ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-oliva/20">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-oliva" /> Ingresos</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold text-oliva">{formatPrice(finanzasData.resumen.ingresos)}</p></CardContent>
                </Card>
                <Card className="border-rojo/20">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-1"><TrendingDown className="h-3.5 w-3.5 text-rojo" /> Egresos</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold text-rojo">{formatPrice(finanzasData.resumen.totalEgresos)}</p></CardContent>
                </Card>
                <Card className={finanzasData.resumen.resultado >= 0 ? 'border-oliva/20' : 'border-rojo/20'}>
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Resultado</CardTitle></CardHeader>
                  <CardContent><p className={`text-2xl font-bold ${finanzasData.resumen.resultado >= 0 ? 'text-oliva' : 'text-rojo'}`}>{formatPrice(finanzasData.resumen.resultado)}</p></CardContent>
                </Card>
                <Card className="border-marron/5">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Margen</CardTitle></CardHeader>
                  <CardContent><p className={`text-2xl font-bold ${finanzasData.resumen.margenPromedio >= 0 ? 'text-oliva' : 'text-rojo'}`}>{finanzasData.resumen.margenPromedio.toFixed(1)}%</p></CardContent>
                </Card>
              </div>

              {/* Ingresos vs Egresos por mes */}
              <Card className="border-marron/5">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base text-marron">Ingresos vs Egresos por Mes</CardTitle>
                  <div className="flex gap-2">
                    <ExportadorExcel data={finanzasData.datosPorMes.map((m: any) => ({ mes: m.mes, ingresos: m.ingresos, egresosCompras: m.egresosCompras, egresosProduccion: m.egresosProduccion, resultado: m.ingresos - m.egresosCompras - m.egresosProduccion }))} filename="finanzas_mensual" columns={[{ key: 'mes', header: 'Mes' }, { key: 'ingresos', header: 'Ingresos' }, { key: 'egresosCompras', header: 'Egresos Compras' }, { key: 'egresosProduccion', header: 'Egresos Producción' }, { key: 'resultado', header: 'Resultado' }]} modulo="reportes" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Mes</TableHead><TableHead className="text-right">Ingresos</TableHead><TableHead className="text-right">Egresos Compras</TableHead><TableHead className="text-right">Egresos Prod.</TableHead><TableHead className="text-right">Resultado</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {finanzasData.datosPorMes.map((m: any, i: number) => {
                        const resultado = m.ingresos - m.egresosCompras - m.egresosProduccion
                        return (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{m.mes}</TableCell>
                            <TableCell className="text-right text-oliva">{formatPrice(m.ingresos)}</TableCell>
                            <TableCell className="text-right text-rojo">{formatPrice(m.egresosCompras)}</TableCell>
                            <TableCell className="text-right text-rojo">{formatPrice(m.egresosProduccion)}</TableCell>
                            <TableCell className={`text-right font-bold ${resultado >= 0 ? 'text-oliva' : 'text-rojo'}`}>{formatPrice(resultado)}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Margen por producto */}
              <Card className="border-marron/5">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base text-marron">Margen por Producto</CardTitle>
                  <div className="flex gap-2">
                    <ExportadorExcel data={finanzasData.margenesPorProducto.map((m: any) => ({ producto: m.producto, ingreso: m.ingreso, costoProduccion: m.costoProduccion, margen: m.margen.toFixed(2) + '%' }))} filename="margen_producto" columns={[{ key: 'producto', header: 'Producto' }, { key: 'ingreso', header: 'Ingreso' }, { key: 'costoProduccion', header: 'Costo Prod.' }, { key: 'margen', header: 'Margen %' }]} modulo="reportes" />
                    <ExportadorPDF data={finanzasData.margenesPorProducto.map((m: any) => ({ producto: m.producto, ingreso: formatPrice(m.ingreso), costoProduccion: formatPrice(m.costoProduccion), margen: m.margen.toFixed(1) + '%' }))} filename="margen_producto" title="Margen por Producto" columns={[{ key: 'producto', header: 'Producto' }, { key: 'ingreso', header: 'Ingreso' }, { key: 'costoProduccion', header: 'Costo Prod.' }, { key: 'margen', header: 'Margen' }]} modulo="reportes" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Producto</TableHead><TableHead className="text-right">Ingreso</TableHead><TableHead className="text-right">Costo Prod.</TableHead><TableHead className="text-right">Margen</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {finanzasData.margenesPorProducto.map((m: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{m.producto}</TableCell>
                          <TableCell className="text-right">{formatPrice(m.ingreso)}</TableCell>
                          <TableCell className="text-right">{formatPrice(m.costoProduccion)}</TableCell>
                          <TableCell className={`text-right font-bold ${m.margen >= 0 ? 'text-oliva' : 'text-rojo'}`}>{m.margen.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  )
}
