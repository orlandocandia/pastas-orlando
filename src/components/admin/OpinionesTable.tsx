'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Search, Loader2, Check, X, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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

interface Opinion {
  id: number
  nombre: string
  calificacion: number
  comentario: string
  estado: string
  fecha: string
  destacado: boolean
}

interface OpinionesTableProps {
  estado: 'pending' | 'approved' | 'rejected'
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'text-mostaza fill-mostaza' : 'text-muted-foreground/30'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function OpinionesTable({ estado }: OpinionesTableProps) {
  const [opiniones, setOpiniones] = useState<Opinion[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [calificacionFilter, setCalificacionFilter] = useState<string>('all')

  const fetchOpiniones = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/opiniones?admin=true&estado=${estado}`)
      if (!res.ok) throw new Error('Error al cargar opiniones')
      const data = await res.json()
      setOpiniones(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Error al cargar opiniones')
    } finally {
      setLoading(false)
    }
  }, [estado])

  useEffect(() => {
    fetchOpiniones()
  }, [fetchOpiniones])

  const cambiarEstado = async (id: number, nuevoEstado: string) => {
    try {
      const res = await fetch('/api/opiniones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: nuevoEstado }),
      })

      if (!res.ok) throw new Error('Error al actualizar')

      const actionLabel = nuevoEstado === 'approved' ? 'aprobada' : nuevoEstado === 'rejected' ? 'rechazada' : 'actualizada'
      toast.success(`Opinión ${actionLabel}`)
      fetchOpiniones()
    } catch {
      toast.error('Error al actualizar opinión')
    }
  }

  const filteredOpiniones = opiniones.filter((o) => {
    const matchesSearch =
      o.nombre.toLowerCase().includes(search.toLowerCase()) ||
      o.comentario.toLowerCase().includes(search.toLowerCase())
    const matchesCalificacion =
      calificacionFilter === 'all' || o.calificacion === parseInt(calificacionFilter)
    return matchesSearch && matchesCalificacion
  })

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d 'de' MMM, yyyy", { locale: es })
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o comentario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={calificacionFilter} onValueChange={setCalificacionFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Calificación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="5">5 estrellas</SelectItem>
            <SelectItem value="4">4 estrellas</SelectItem>
            <SelectItem value="3">3 estrellas</SelectItem>
            <SelectItem value="2">2 estrellas</SelectItem>
            <SelectItem value="1">1 estrella</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-marron/10 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nombre</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead className="hidden md:table-cell">Comentario</TableHead>
                <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOpiniones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {search || calificacionFilter !== 'all'
                      ? 'No se encontraron opiniones'
                      : estado === 'pending'
                        ? 'No hay opiniones pendientes'
                        : estado === 'approved'
                          ? 'No hay opiniones aprobadas'
                          : 'No hay opiniones rechazadas'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOpiniones.map((opinion) => (
                  <TableRow key={opinion.id} className="hover:bg-mostaza/5">
                    <TableCell className="font-medium text-marron">
                      {opinion.nombre}
                    </TableCell>
                    <TableCell>
                      <StarRating rating={opinion.calificacion} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs">
                      <p className="truncate text-sm text-muted-foreground">
                        {opinion.comentario}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {formatDate(opinion.fecha)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {estado === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-oliva hover:bg-oliva/10"
                              onClick={() => cambiarEstado(opinion.id, 'approved')}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Aprobar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-rojo hover:bg-rojo/10"
                              onClick={() => cambiarEstado(opinion.id, 'rejected')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Rechazar</span>
                            </Button>
                          </>
                        )}
                        {estado === 'approved' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-muted-foreground hover:bg-rojo/10 hover:text-rojo"
                            onClick={() => cambiarEstado(opinion.id, 'rejected')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Ocultar</span>
                          </Button>
                        )}
                        {estado === 'rejected' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-oliva hover:bg-oliva/10"
                            onClick={() => cambiarEstado(opinion.id, 'approved')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Recuperar</span>
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

      <div className="text-sm text-muted-foreground">
        {filteredOpiniones.length} opinión{filteredOpiniones.length !== 1 ? 'es' : ''}
      </div>
    </div>
  )
}
