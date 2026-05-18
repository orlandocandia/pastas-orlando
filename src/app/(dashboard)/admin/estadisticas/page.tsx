'use client'

import { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Phone, Loader2, TrendingUp, TrendingDown, MessageCircle, QrCode } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Interaccion {
  id: number
  tipo: string
  mensaje_enviado: string
  ip?: string | null
  fecha: string
}

interface Estadisticas {
  total: number
  porDia: Record<string, number>
  porTipo: Record<string, number>
}

interface ContactoData {
  interacciones: Interaccion[]
  estadisticas: Estadisticas
}

export default function EstadisticasPage() {
  const [data, setData] = useState<ContactoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dias, setDias] = useState('30')

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch(`/api/contacto?dias=${dias}`)
        if (!res.ok) throw new Error('Error al cargar datos')
        const result = await res.json()
        setData(result)
      } catch {
        toast.error('Error al cargar estadísticas')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [dias])

  const chartData = useMemo(() => {
    if (!data?.estadisticas?.porDia) return []
    return Object.entries(data.estadisticas.porDia)
      .map(([date, count]) => ({
        date,
        count,
        label: format(new Date(date + 'T12:00:00'), 'd MMM', { locale: es }),
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [data])

  const last7Days = useMemo(() => {
    if (!data?.interacciones) return 0
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return data.interacciones.filter(
      (i) => new Date(i.fecha) >= sevenDaysAgo
    ).length
  }, [data])

  const previous7Days = useMemo(() => {
    if (!data?.interacciones) return 0
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
    return data.interacciones.filter((i) => {
      const date = new Date(i.fecha)
      return date >= fourteenDaysAgo && date < sevenDaysAgo
    }).length
  }, [data])

  const weekTrend = useMemo(() => {
    if (previous7Days === 0) return last7Days > 0 ? 100 : 0
    return Math.round(((last7Days - previous7Days) / previous7Days) * 100)
  }, [last7Days, previous7Days])

  const tipoBoton = data?.estadisticas?.porTipo?.['boton'] || 0
  const tipoQR = data?.estadisticas?.porTipo?.['qr'] || 0

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d 'de' MMM, yyyy HH:mm", { locale: es })
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-mostaza" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-whatsapp/10 p-2">
            <Phone className="h-5 w-5 text-whatsapp" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-marron">Estadísticas WhatsApp</h1>
            <p className="text-sm text-muted-foreground">
              Interacciones de los últimos {dias} días
            </p>
          </div>
        </div>
        <Select value={dias} onValueChange={setDias}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 días</SelectItem>
            <SelectItem value="15">Últimos 15 días</SelectItem>
            <SelectItem value="30">Últimos 30 días</SelectItem>
            <SelectItem value="90">Últimos 90 días</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-marron/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Interacciones
            </CardTitle>
            <div className="rounded-lg p-2 bg-whatsapp/10 text-whatsapp">
              <Phone className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-marron">
              {data?.estadisticas?.total || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-marron/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Últimos 7 días
            </CardTitle>
            <div className="rounded-lg p-2 bg-mostaza/10 text-mostaza">
              {weekTrend >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-marron">{last7Days}</div>
            {previous7Days > 0 && (
              <p className={`text-xs mt-1 ${weekTrend >= 0 ? 'text-oliva' : 'text-rojo'}`}>
                {weekTrend >= 0 ? '↑' : '↓'} {Math.abs(weekTrend)}% vs semana anterior
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-marron/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vía Botón
            </CardTitle>
            <div className="rounded-lg p-2 bg-mostaza/10 text-mostaza">
              <MessageCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-marron">{tipoBoton}</div>
          </CardContent>
        </Card>

        <Card className="border-marron/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vía QR
            </CardTitle>
            <div className="rounded-lg p-2 bg-marron/10 text-marron">
              <QrCode className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-marron">{tipoQR}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border-marron/5">
        <CardHeader>
          <CardTitle className="text-lg text-marron">Interacciones por día</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay datos para mostrar en el período seleccionado
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8D5B0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: '#8B7355' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E8D5B0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#8B7355' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E8D5B0' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF8E7',
                      border: '1px solid #E8D5B0',
                      borderRadius: '8px',
                      color: '#5C3A21',
                    }}
                    labelStyle={{ color: '#5C3A21', fontWeight: 'bold' }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#E1AD01"
                    radius={[4, 4, 0, 0]}
                    name="Interacciones"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-marron/5">
        <CardHeader>
          <CardTitle className="text-lg text-marron">Detalle de interacciones</CardTitle>
        </CardHeader>
        <CardContent>
          {!data?.interacciones || data.interacciones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay interacciones registradas
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="hidden sm:table-cell">Mensaje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.interacciones.map((interaccion) => (
                    <TableRow key={interaccion.id} className="hover:bg-mostaza/5">
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(interaccion.fecha)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            interaccion.tipo === 'boton'
                              ? 'bg-whatsapp/10 text-whatsapp hover:bg-whatsapp/20'
                              : 'bg-marron/10 text-marron hover:bg-marron/20'
                          }
                        >
                          {interaccion.tipo === 'boton' ? 'Botón' : 'QR'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell max-w-xs">
                        <p className="truncate text-sm text-muted-foreground">
                          {interaccion.mensaje_enviado}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
