'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertTriangle,
  Bell,
  Clock,
  Play,
  Save,
  CheckCircle,
  XCircle,
  Loader2,
  Package,
  ShoppingCart,
  Truck,
  Factory,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AlertaConfig {
  id: number
  tipo: string
  activo: boolean
  umbral: number | null
  destinatarios: string | null
  frecuencia: string | null
  ultimo_envio: string | null
  createdAt: string
  updatedAt: string
}

interface AlertaMeta {
  tipo: string
  titulo: string
  descripcion: string
  icon: React.ReactNode
  color: string
  bgColor: string
  showUmbral: boolean
}

// ---------------------------------------------------------------------------
// Alert metadata
// ---------------------------------------------------------------------------

const ALERTAS_META: AlertaMeta[] = [
  {
    tipo: 'stock_bajo',
    titulo: 'Stock bajo',
    descripcion: 'Notifica cuando el stock de un producto, materia prima o insumo cae por debajo del umbral configurado.',
    icon: <Package className="h-5 w-5" />,
    color: 'text-rojo',
    bgColor: 'bg-rojo/10',
    showUmbral: true,
  },
  {
    tipo: 'pedido_pendiente',
    titulo: 'Pedido pendiente',
    descripcion: 'Alerta cuando hay pedidos de clientes que llevan demasiado tiempo sin ser completados.',
    icon: <ShoppingCart className="h-5 w-5" />,
    color: 'text-mostaza',
    bgColor: 'bg-mostaza/10',
    showUmbral: false,
  },
  {
    tipo: 'entrega_proxima',
    titulo: 'Entrega próxima',
    descripcion: 'Recordatorio de entregas programadas para hoy o mañana que aún no se han completado.',
    icon: <Truck className="h-5 w-5" />,
    color: 'text-oliva',
    bgColor: 'bg-oliva/10',
    showUmbral: false,
  },
  {
    tipo: 'produccion_atrasada',
    titulo: 'Producción atrasada',
    descripcion: 'Alerta cuando hay producciones planificadas que ya debieron haberse completado.',
    icon: <Factory className="h-5 w-5" />,
    color: 'text-marron',
    bgColor: 'bg-marron/10',
    showUmbral: false,
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseDestinatarios(val: string | null): string {
  if (!val) return ''
  try {
    const arr = JSON.parse(val)
    if (Array.isArray(arr)) return arr.join('\n')
    return val
  } catch {
    return val
  }
}

function serializeDestinatarios(val: string): string[] {
  return val
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

function frecuenciaLabel(f: string | null): string {
  switch (f) {
    case 'inmediato': return 'Inmediato'
    case 'diario': return 'Diario'
    case 'semanal': return 'Semanal'
    default: return f || '-'
  }
}

function ultimoEnvioStr(d: string | null): string {
  if (!d) return 'Nunca'
  try {
    return format(parseISO(d), "dd/MM/yyyy HH:mm", { locale: es })
  } catch {
    return d
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AlertasPage() {
  const [configuraciones, setConfiguraciones] = useState<AlertaConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [savingTipo, setSavingTipo] = useState<string | null>(null)
  const [ejecutandoTipo, setEjecutandoTipo] = useState<string | null>(null)

  // Local edit state: map tipo → field values
  const [editState, setEditState] = useState<Record<string, {
    activo: boolean
    umbral: number
    destinatarios: string
    frecuencia: string
  }>>({})

  // Fetch config
  const fetchConfig = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notificaciones/alertas/config')
      if (!res.ok) throw new Error()
      const data: AlertaConfig[] = await res.json()
      setConfiguraciones(data)

      // Initialize edit state from fetched data
      const state: Record<string, {
        activo: boolean
        umbral: number
        destinatarios: string
        frecuencia: string
      }> = {}
      for (const cfg of data) {
        state[cfg.tipo] = {
          activo: cfg.activo,
          umbral: cfg.umbral ?? 10,
          destinatarios: parseDestinatarios(cfg.destinatarios),
          frecuencia: cfg.frecuencia ?? 'diario',
        }
      }
      setEditState(state)
    } catch {
      toast.error('Error al cargar la configuración de alertas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  // Helpers to update edit state
  const updateField = (tipo: string, field: string, value: unknown) => {
    setEditState((prev) => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        [field]: value,
      },
    }))
  }

  // Save a single alert config
  const handleSave = async (tipo: string) => {
    const ed = editState[tipo]
    if (!ed) return

    setSavingTipo(tipo)
    try {
      const body: Record<string, unknown> = {
        tipo,
        activo: ed.activo,
        destinatarios: serializeDestinatarios(ed.destinatarios),
        frecuencia: ed.frecuencia,
      }
      if (tipo === 'stock_bajo') {
        body.umbral = ed.umbral
      }

      const res = await fetch('/api/notificaciones/alertas/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([body]),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Error al guardar')
      }

      toast.success(`Alerta "${ALERTAS_META.find((a) => a.tipo === tipo)?.titulo}" guardada correctamente`)
      fetchConfig()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar la configuración')
    } finally {
      setSavingTipo(null)
    }
  }

  // Execute alert
  const handleEjecutar = async (tipo: string) => {
    setEjecutandoTipo(tipo)
    try {
      const res = await fetch('/api/notificaciones/alertas/ejecutar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Error al ejecutar')
      }

      const data = await res.json()
      const resultado = data.resultado

      if (resultado?.error) {
        toast.error(`Error: ${resultado.error}`)
      } else if (resultado?.detalles?.length > 0) {
        const detalle = resultado.detalles.join(', ')
        if (resultado.notificacionesEnviadas > 0) {
          toast.success(`Alerta ejecutada: ${detalle} (${resultado.notificacionesEnviadas} notificaciones enviadas)`)
        } else {
          toast.info(`Alerta ejecutada: ${detalle}`)
        }
      } else {
        toast.success('Alerta ejecutada correctamente')
      }

      fetchConfig()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al ejecutar la alerta')
    } finally {
      setEjecutandoTipo(null)
    }
  }

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-rojo/10 p-2">
          <AlertTriangle className="h-5 w-5 text-rojo" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Alertas Automáticas</h1>
          <p className="text-sm text-muted-foreground">Configura las alertas automáticas del sistema</p>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-mostaza" />
          <p className="text-sm text-muted-foreground mt-3">Cargando configuración de alertas...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {ALERTAS_META.map((meta) => {
            const cfg = configuraciones.find((c) => c.tipo === meta.tipo)
            const ed = editState[meta.tipo]
            if (!ed) return null

            const isSaving = savingTipo === meta.tipo
            const isEjecutando = ejecutandoTipo === meta.tipo

            return (
              <Card key={meta.tipo} className="border-marron/10 overflow-hidden">
                {/* Card header with colored accent */}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg ${meta.bgColor} p-2`}>
                        <span className={meta.color}>{meta.icon}</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg text-marron">{meta.titulo}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">{meta.descripcion}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={ed.activo}
                        onCheckedChange={(v) => updateField(meta.tipo, 'activo', v)}
                      />
                      <Badge
                        variant="outline"
                        className={ed.activo ? 'border-oliva text-oliva' : 'border-muted-foreground text-muted-foreground'}
                      >
                        {ed.activo ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <Separator className="bg-marron/5" />

                <CardContent className="pt-4 space-y-4">
                  {/* Last sent */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Último envío: {ultimoEnvioStr(cfg?.ultimo_envio ?? null)}</span>
                  </div>

                  <div className={`grid gap-4 ${meta.showUmbral ? 'sm:grid-cols-2' : ''}`}>
                    {/* Umbral (only for stock_bajo) */}
                    {meta.showUmbral && (
                      <div className="grid gap-2">
                        <Label className="text-marron font-medium">Umbral de stock</Label>
                        <Input
                          type="number"
                          min={0}
                          value={ed.umbral}
                          onChange={(e) => updateField(meta.tipo, 'umbral', parseInt(e.target.value) || 0)}
                          placeholder="Ej: 10"
                          disabled={!ed.activo}
                        />
                        <p className="text-xs text-muted-foreground">
                          Cantidad mínima antes de activar la alerta
                        </p>
                      </div>
                    )}

                    {/* Frecuencia */}
                    <div className="grid gap-2">
                      <Label className="text-marron font-medium">Frecuencia</Label>
                      <Select
                        value={ed.frecuencia}
                        onValueChange={(v) => updateField(meta.tipo, 'frecuencia', v)}
                        disabled={!ed.activo}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inmediato">Inmediato</SelectItem>
                          <SelectItem value="diario">Diario</SelectItem>
                          <SelectItem value="semanal">Semanal</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Cada cuánto se verifica esta alerta
                      </p>
                    </div>
                  </div>

                  {/* Destinatarios */}
                  <div className="grid gap-2">
                    <Label className="text-marron font-medium">Destinatarios</Label>
                    <Textarea
                      rows={3}
                      value={ed.destinatarios}
                      onChange={(e) => updateField(meta.tipo, 'destinatarios', e.target.value)}
                      placeholder="Un email o teléfono por línea&#10;ej: admin@pastasorlando.com&#10;ej: 3624123456"
                      disabled={!ed.activo}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Un destinatario por línea (email o teléfono). Los emails se envían por correo, los teléfonos por WhatsApp.
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      className="bg-mostaza hover:bg-mostaza/90 text-marron font-semibold"
                      onClick={() => handleSave(meta.tipo)}
                      disabled={isSaving || !ed.activo}
                    >
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Guardar cambios
                    </Button>
                    <Button
                      variant="outline"
                      className="border-marron/20 text-marron hover:bg-marron/5"
                      onClick={() => handleEjecutar(meta.tipo)}
                      disabled={isEjecutando || !ed.activo}
                    >
                      {isEjecutando ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="mr-2 h-4 w-4" />
                      )}
                      Ejecutar ahora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Summary card */}
          <Card className="bg-crema/50 border-marron/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-mostaza mt-0.5" />
                <div className="text-sm text-marron space-y-1">
                  <p className="font-semibold">Resumen de alertas</p>
                  <p>
                    Activas:{' '}
                    <span className="font-medium text-oliva">
                      {Object.values(editState).filter((e) => e.activo).length}
                    </span>
                    {' / '}
                    {ALERTAS_META.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Las alertas se ejecutan automáticamente según la frecuencia configurada. También puedes ejecutarlas manualmente con el botón &quot;Ejecutar ahora&quot;.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
