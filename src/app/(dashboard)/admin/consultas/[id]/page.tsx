'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ArrowLeft,
  Loader2,
  Mail,
  MailOpen,
  MailCheck,
  Trash2,
  MessageCircle,
  Phone,
  User,
  Calendar,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'

interface Consulta {
  id: number
  nombre: string
  email: string
  telefono: string
  mensaje: string
  leido: boolean
  respondido: boolean
  fecha: string
  createdAt: string
}

export default function ConsultaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [consulta, setConsulta] = useState<Consulta | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function fetchConsulta() {
      try {
        const res = await fetch(`/api/consultas/${params.id}`)
        if (!res.ok) throw new Error('Error al cargar consulta')
        const data = await res.json()
        setConsulta(data)
      } catch (error) {
        console.error(error)
        toast.error('Error al cargar la consulta')
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchConsulta()
  }, [params.id])

  // Auto-mark as read when viewing
  useEffect(() => {
    if (consulta && !consulta.leido && !loading) {
      markAsRead()
    }
  }, [consulta?.leido, loading])

  const markAsRead = async () => {
    if (!consulta || consulta.leido) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/consultas/${consulta.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leido: true }),
      })
      if (!res.ok) throw new Error('Error al actualizar')
      const updated = await res.json()
      setConsulta(updated)
      toast.success('Consulta marcada como leída')
    } catch {
      toast.error('Error al marcar como leída')
    } finally {
      setUpdating(false)
    }
  }

  const markAsResponded = async () => {
    if (!consulta) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/consultas/${consulta.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respondido: true }),
      })
      if (!res.ok) throw new Error('Error al actualizar')
      const updated = await res.json()
      setConsulta(updated)
      toast.success('Consulta marcada como respondida')
    } catch {
      toast.error('Error al marcar como respondida')
    } finally {
      setUpdating(false)
    }
  }

  const deleteConsulta = async () => {
    if (!consulta) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/consultas/${consulta.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Error al eliminar')
      toast.success('Consulta eliminada')
      router.push('/admin/consultas')
    } catch {
      toast.error('Error al eliminar consulta')
      setUpdating(false)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })
    } catch {
      return dateStr
    }
  }

  const getEstadoBadge = () => {
    if (!consulta) return null
    if (consulta.respondido) {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 text-sm px-3 py-1">
          <MailCheck className="h-4 w-4 mr-1.5" />
          Respondido
        </Badge>
      )
    }
    if (consulta.leido) {
      return (
        <Badge className="bg-mostaza/10 text-mostaza hover:bg-mostaza/20 text-sm px-3 py-1">
          <MailOpen className="h-4 w-4 mr-1.5" />
          Leído
        </Badge>
      )
    }
    return (
      <Badge className="bg-rojo/10 text-rojo hover:bg-rojo/20 text-sm px-3 py-1">
        <Mail className="h-4 w-4 mr-1.5" />
        No leído
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-mostaza" />
      </div>
    )
  }

  if (!consulta) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Consulta no encontrada</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/consultas')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a consultas
        </Button>
      </div>
    )
  }

  const whatsappUrl = consulta.telefono
    ? `https://wa.me/${consulta.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${consulta.nombre}, gracias por contactarte con Pastas Orlando. Respecto a tu consulta: "${consulta.mensaje.slice(0, 50)}..."`)}`
    : null

  const emailUrl = `mailto:${consulta.email}?subject=${encodeURIComponent('Respuesta a tu consulta - Pastas Orlando')}&body=${encodeURIComponent(`Hola ${consulta.nombre},\n\nGracias por contactarte con Pastas Orlando.\n\nRespecto a tu consulta:\n"${consulta.mensaje}"\n\n`)}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push('/admin/consultas')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-marron">Consulta #{consulta.id}</h1>
            <p className="text-sm text-muted-foreground">Detalle del mensaje de contacto</p>
          </div>
        </div>
        <div>{getEstadoBadge()}</div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-marron/10">
          <CardHeader>
            <CardTitle className="text-marron flex items-center gap-2">
              <User className="h-4 w-4" />
              Información del contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Nombre</p>
                <p className="font-medium text-marron">{consulta.nombre}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <a
                  href={emailUrl}
                  className="font-medium text-mostaza hover:underline"
                >
                  {consulta.email}
                </a>
              </div>
            </div>
            {consulta.telefono && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <a
                    href={`tel:${consulta.telefono}`}
                    className="font-medium text-mostaza hover:underline"
                  >
                    {consulta.telefono}
                  </a>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Fecha</p>
                <p className="font-medium text-marron">{formatDate(consulta.fecha)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-marron/10">
          <CardHeader>
            <CardTitle className="text-marron flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Mensaje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {consulta.mensaje}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Acciones
        </h3>
        <div className="flex flex-wrap gap-3">
          {!consulta.leido && (
            <Button
              variant="outline"
              className="border-mostaza/30 text-mostaza hover:bg-mostaza/10"
              onClick={markAsRead}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MailOpen className="h-4 w-4 mr-2" />
              )}
              Marcar como leído
            </Button>
          )}

          {!consulta.respondido && (
            <Button
              variant="outline"
              className="border-green-300 text-green-600 hover:bg-green-50"
              onClick={markAsResponded}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MailCheck className="h-4 w-4 mr-2" />
              )}
              Marcar como respondido
            </Button>
          )}

          <Button
            variant="outline"
            className="border-mostaza/30 text-mostaza hover:bg-mostaza/10"
            asChild
          >
            <a href={emailUrl}>
              <Mail className="h-4 w-4 mr-2" />
              Responder por Email
            </a>
          </Button>

          {whatsappUrl && (
            <Button
              variant="outline"
              className="border-green-300 text-green-600 hover:bg-green-50"
              asChild
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 mr-2" />
                Responder por WhatsApp
              </a>
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-rojo/30 text-rojo hover:bg-rojo/10"
                disabled={updating}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar esta consulta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente la consulta de {consulta.nombre}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteConsulta}
                  className="bg-rojo text-white hover:bg-rojo/90"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
