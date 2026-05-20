'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { MonitorSmartphone, Loader2, RefreshCw, LogOut, ShieldCheck } from 'lucide-react'

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

interface Sesion {
  id: string
  id_usuario: number
  usuario: {
    id: number
    email: string
    persona: {
      nombre: string
      apellido: string
    }
  }
  ip: string | null
  user_agent: string | null
  fecha_inicio: string
  fecha_expiracion: string
  es_actual: boolean
}

export default function SesionesPage() {
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  const fetchSesiones = useCallback(async (showRefreshLoader = false) => {
    if (showRefreshLoader) setRefreshing(true)
    else setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedUserId) params.set('id_usuario', selectedUserId.toString())
      const res = await fetch(`/api/seguridad/sesiones?${params.toString()}`)
      if (!res.ok) throw new Error('Error al cargar sesiones')
      const data = await res.json()
      setSesiones(data || [])
    } catch {
      toast.error('Error al cargar sesiones activas')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [selectedUserId])

  useEffect(() => { fetchSesiones() }, [fetchSesiones])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSesiones(true)
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchSesiones])

  const handleRevokeSession = async (sessionId: string) => {
    setRevoking(sessionId)
    try {
      const res = await fetch(`/api/seguridad/sesiones/${sessionId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al cerrar sesión')
      }
      toast.success('Sesión cerrada correctamente')
      fetchSesiones()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al cerrar sesión remota')
    } finally {
      setRevoking(null)
    }
  }

  const parseUserAgent = (ua: string | null) => {
    if (!ua) return { browser: '-', os: '-' }
    
    let browser = 'Desconocido'
    let os = 'Desconocido'

    // Browser detection
    if (ua.includes('Firefox/')) browser = 'Firefox'
    else if (ua.includes('Edg/')) browser = 'Edge'
    else if (ua.includes('Chrome/')) browser = 'Chrome'
    else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari'
    else if (ua.includes('Opera') || ua.includes('OPR/')) browser = 'Opera'

    // OS detection
    if (ua.includes('Windows')) os = 'Windows'
    else if (ua.includes('Mac OS')) os = 'macOS'
    else if (ua.includes('Linux')) os = 'Linux'
    else if (ua.includes('Android')) os = 'Android'
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'

    return { browser, os }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-mostaza/10 p-2">
            <MonitorSmartphone className="h-5 w-5 text-mostaza" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-marron">Sesiones Activas</h1>
            <p className="text-sm text-muted-foreground">
              Monitor de sesiones activas en el sistema — se actualiza cada 30 segundos
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchSesiones(true)}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-marron/10 bg-card p-4">
          <p className="text-sm text-muted-foreground">Total sesiones activas</p>
          <p className="text-2xl font-bold text-marron">{sesiones.length}</p>
        </div>
        <div className="rounded-lg border border-marron/10 bg-card p-4">
          <p className="text-sm text-muted-foreground">Usuarios únicos</p>
          <p className="text-2xl font-bold text-marron">
            {new Set(sesiones.map(s => s.id_usuario)).size}
          </p>
        </div>
        <div className="rounded-lg border border-marron/10 bg-card p-4">
          <p className="text-sm text-muted-foreground">Sesión actual</p>
          <p className="text-2xl font-bold text-oliva">
            {sesiones.filter(s => s.es_actual).length > 0 ? 'Activa' : '-'}
          </p>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="rounded-lg border border-marron/10 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">IP</TableHead>
                <TableHead className="hidden lg:table-cell">Navegador / SO</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead className="hidden md:table-cell">Expiración</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-mostaza mx-auto" />
                  </TableCell>
                </TableRow>
              ) : sesiones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay sesiones activas
                  </TableCell>
                </TableRow>
              ) : (
                sesiones.map((sesion) => {
                  const { browser, os } = parseUserAgent(sesion.user_agent)
                  const isExpired = new Date(sesion.fecha_expiracion) < new Date()
                  return (
                    <TableRow key={sesion.id} className={`hover:bg-mostaza/5 ${sesion.es_actual ? 'bg-oliva/5' : ''}`}>
                      <TableCell className="font-medium text-marron text-sm">
                        {sesion.usuario?.persona
                          ? `${sesion.usuario.persona.nombre} ${sesion.usuario.persona.apellido}`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {sesion.usuario?.email || '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs font-mono text-muted-foreground">
                        {sesion.ip || '-'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {browser} / {os}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(sesion.fecha_inicio).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(sesion.fecha_expiracion).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        {sesion.es_actual ? (
                          <Badge className="bg-oliva/10 text-oliva border-oliva/20 text-xs">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Actual
                          </Badge>
                        ) : isExpired ? (
                          <Badge variant="secondary" className="text-xs">Expirada</Badge>
                        ) : (
                          <Badge className="bg-mostaza/10 text-mostaza text-xs">Activa</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!sesion.es_actual && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rojo hover:text-rojo hover:bg-rojo/10 gap-1"
                            disabled={revoking === sesion.id}
                            onClick={() => handleRevokeSession(sesion.id)}
                          >
                            {revoking === sesion.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <LogOut className="h-3.5 w-3.5" />
                            )}
                            Cerrar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
