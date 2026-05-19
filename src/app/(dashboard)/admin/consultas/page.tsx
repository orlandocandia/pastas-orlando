'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Mail,
  MailOpen,
  MailCheck,
  Search,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Consulta {
  id: number
  nombre: string
  email: string
  telefono: string
  mensaje: string
  leido: boolean
  respondido: boolean
  fecha: string
}

interface ConsultasResponse {
  consultas: Consulta[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary: {
    total: number
    noLeidos: number
    leidos: number
    respondidos: number
  }
}

type EstadoFilter = '' | 'no-leido' | 'leido' | 'respondido'

function getEstadoBadge(leido: boolean, respondido: boolean) {
  if (respondido) {
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 text-xs">
        <MailCheck className="h-3 w-3 mr-1" />
        Respondido
      </Badge>
    )
  }
  if (leido) {
    return (
      <Badge className="bg-mostaza/10 text-mostaza hover:bg-mostaza/20 text-xs">
        <MailOpen className="h-3 w-3 mr-1" />
        Leído
      </Badge>
    )
  }
  return (
    <Badge className="bg-rojo/10 text-rojo hover:bg-rojo/20 text-xs">
      <Mail className="h-3 w-3 mr-1" />
      No leído
    </Badge>
  )
}

export default function ConsultasPage() {
  const router = useRouter()
  const [data, setData] = useState<ConsultasResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('')
  const [page, setPage] = useState(1)
  const limit = 10

  const fetchConsultas = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (search) params.set('search', search)
      if (estadoFilter) params.set('estado', estadoFilter)

      const res = await fetch(`/api/consultas?${params.toString()}`)
      if (!res.ok) throw new Error('Error al cargar consultas')
      const json = await res.json()
      setData(json)
    } catch {
      toast.error('Error al cargar consultas')
    } finally {
      setLoading(false)
    }
  }, [page, search, estadoFilter])

  useEffect(() => {
    fetchConsultas()
  }, [fetchConsultas])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, estadoFilter])

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d 'de' MMM, yyyy HH:mm", { locale: es })
    } catch {
      return dateStr
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  const summary = data?.summary ?? { total: 0, noLeidos: 0, leidos: 0, respondidos: 0 }
  const consultas = data?.consultas ?? []
  const pagination = data?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-mostaza/10 p-2">
          <Mail className="h-5 w-5 text-mostaza" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Consultas</h1>
          <p className="text-sm text-muted-foreground">
            Gestioná los mensajes del formulario de contacto
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-marron/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-marron">{summary.total}</div>
          </CardContent>
        </Card>
        <Card className="border-rojo/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-rojo" />
              No leídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rojo">{summary.noLeidos}</div>
          </CardContent>
        </Card>
        <Card className="border-mostaza/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <MailOpen className="h-3.5 w-3.5 text-mostaza" />
              Leídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-mostaza">{summary.leidos}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <MailCheck className="h-3.5 w-3.5 text-green-600" />
              Respondidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.respondidos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={estadoFilter || 'todos'}
          onValueChange={(val) => setEstadoFilter(val === 'todos' ? '' : (val as EstadoFilter))}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="no-leido">No leídos</SelectItem>
            <SelectItem value="leido">Leídos</SelectItem>
            <SelectItem value="respondido">Respondidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-marron/10 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Fecha</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Teléfono</TableHead>
                <TableHead className="hidden sm:table-cell">Mensaje</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ver</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-mostaza mx-auto" />
                    <p className="mt-2 text-sm text-muted-foreground">Cargando consultas...</p>
                  </TableCell>
                </TableRow>
              ) : consultas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {search || estadoFilter
                      ? 'No se encontraron consultas con los filtros aplicados'
                      : 'No hay consultas registradas'}
                  </TableCell>
                </TableRow>
              ) : (
                consultas.map((consulta) => (
                  <TableRow
                    key={consulta.id}
                    className="hover:bg-mostaza/5 cursor-pointer"
                    onClick={() => router.push(`/admin/consultas/${consulta.id}`)}
                  >
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(consulta.fecha)}
                    </TableCell>
                    <TableCell className="font-medium text-marron">
                      {consulta.nombre}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {consulta.email}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {consulta.telefono || '-'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell max-w-[200px]">
                      <p className="truncate text-sm text-muted-foreground">
                        {truncateText(consulta.mensaje, 50)}
                      </p>
                    </TableCell>
                    <TableCell>
                      {getEstadoBadge(consulta.leido, consulta.respondido)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-mostaza hover:bg-mostaza/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/admin/consultas/${consulta.id}`)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {((pagination.page - 1) * limit) + 1} - {Math.min(pagination.page * limit, pagination.total)} de {pagination.total} consultas
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  // Show first, last, current, and adjacent pages
                  return p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1
                })
                .map((p, i, arr) => {
                  const showEllipsis = i > 0 && arr[i - 1] !== p - 1
                  return (
                    <span key={p} className="flex items-center">
                      {showEllipsis && <span className="px-1 text-muted-foreground">...</span>}
                      <Button
                        variant={p === pagination.page ? 'default' : 'outline'}
                        size="sm"
                        className={`h-8 w-8 p-0 ${p === pagination.page ? 'bg-mostaza text-marron hover:bg-mostaza/90' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    </span>
                  )
                })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Simple count when no pagination needed */}
      {pagination.totalPages <= 1 && !loading && (
        <div className="text-sm text-muted-foreground">
          {pagination.total} consulta{pagination.total !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
