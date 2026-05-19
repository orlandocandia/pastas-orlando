'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Clock,
  Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PuntoEncuentro {
  id: number
  nombre: string
  direccion: string
  latitud: number | null
  longitud: number | null
  horarios: string | null
  activo: boolean
  createdAt: string
  updatedAt: string
}

interface FormState {
  nombre: string
  direccion: string
  horarios: string
  activo: boolean
  latitud: number | null
  longitud: number | null
}

const emptyForm: FormState = {
  nombre: '',
  direccion: '',
  horarios: '',
  activo: true,
  latitud: null,
  longitud: null,
}

// ---------------------------------------------------------------------------
// Dynamic map import (SSR disabled)
// ---------------------------------------------------------------------------

const SelectorUbicacion = dynamic(
  () => import('@/components/logistica/SelectorUbicacion'),
  { ssr: false }
)

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function PuntosEncuentroPage() {
  const [puntos, setPuntos] = useState<PuntoEncuentro[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PuntoEncuentro | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  // Delete confirmation
  const [deleteItem, setDeleteItem] = useState<PuntoEncuentro | null>(null)

  // Filter
  const [showActiveOnly, setShowActiveOnly] = useState(false)

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const fetchPuntos = useCallback(async () => {
    setLoading(true)
    try {
      const url = showActiveOnly
        ? '/api/logistica/puntos-encuentro?activo=true'
        : '/api/logistica/puntos-encuentro'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Error al cargar puntos de encuentro')
      const data = await res.json()
      setPuntos(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Error al cargar puntos de encuentro')
    } finally {
      setLoading(false)
    }
  }, [showActiveOnly])

  useEffect(() => {
    fetchPuntos()
  }, [fetchPuntos])

  // ---------------------------------------------------------------------------
  // Form helpers
  // ---------------------------------------------------------------------------

  const openCreateDialog = () => {
    setEditingItem(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEditDialog = (punto: PuntoEncuentro) => {
    setEditingItem(punto)
    setForm({
      nombre: punto.nombre,
      direccion: punto.direccion,
      horarios: punto.horarios || '',
      activo: punto.activo,
      latitud: punto.latitud,
      longitud: punto.longitud,
    })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingItem(null)
    setForm(emptyForm)
  }

  const handleLocationSelect = (lat: number, lng: number) => {
    setForm((prev) => ({ ...prev, latitud: lat, longitud: lng }))
  }

  // ---------------------------------------------------------------------------
  // CRUD operations
  // ---------------------------------------------------------------------------

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.direccion.trim()) {
      toast.error('Nombre y dirección son requeridos')
      return
    }

    // Validate horarios JSON if provided
    if (form.horarios.trim()) {
      try {
        JSON.parse(form.horarios.trim())
      } catch {
        toast.error('El campo horarios debe ser un JSON válido')
        return
      }
    }

    setSaving(true)
    try {
      const body = {
        nombre: form.nombre.trim(),
        direccion: form.direccion.trim(),
        latitud: form.latitud,
        longitud: form.longitud,
        horarios: form.horarios.trim() || null,
        activo: form.activo,
      }

      if (editingItem) {
        // Update
        const res = await fetch(`/api/logistica/puntos-encuentro/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Error al actualizar punto de encuentro')
        }
        toast.success('Punto de encuentro actualizado')
      } else {
        // Create
        const res = await fetch('/api/logistica/puntos-encuentro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Error al crear punto de encuentro')
        }
        toast.success('Punto de encuentro creado')
      }

      closeDialog()
      fetchPuntos()
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    try {
      const res = await fetch(
        `/api/logistica/puntos-encuentro/${deleteItem.id}?id=${deleteItem.id}`,
        { method: 'DELETE' }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al eliminar punto de encuentro')
      }
      toast.success('Punto de encuentro eliminado')
      fetchPuntos()
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      toast.error(message)
    } finally {
      setDeleteItem(null)
    }
  }

  const handleToggleActivo = async (punto: PuntoEncuentro) => {
    try {
      const res = await fetch(`/api/logistica/puntos-encuentro/${punto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !punto.activo }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al cambiar estado')
      }
      toast.success(
        punto.activo
          ? 'Punto de encuentro desactivado'
          : 'Punto de encuentro activado'
      )
      fetchPuntos()
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido'
      toast.error(message)
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const parseHorariosPreview = (horarios: string | null): string => {
    if (!horarios) return '-'
    try {
      const parsed = JSON.parse(horarios)
      if (typeof parsed === 'string') return parsed
      if (Array.isArray(parsed)) return parsed.join(', ')
      if (typeof parsed === 'object') return Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join(', ')
      return horarios
    } catch {
      return horarios
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-mostaza/10 p-2">
          <MapPin className="h-5 w-5 text-mostaza" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">
            Puntos de Encuentro
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los puntos de entrega y encuentro
          </p>
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-marron cursor-pointer">
            <Switch
              checked={showActiveOnly}
              onCheckedChange={setShowActiveOnly}
            />
            Solo activos
          </label>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreateDialog}
              className="bg-mostaza hover:bg-mostaza/90 text-marron font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Punto
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-marron">
                {editingItem
                  ? 'Editar Punto de Encuentro'
                  : 'Nuevo Punto de Encuentro'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label
                  htmlFor="nombre"
                  className="text-sm font-medium text-marron"
                >
                  Nombre *
                </Label>
                <Input
                  id="nombre"
                  placeholder="Nombre del punto de encuentro..."
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, nombre: e.target.value }))
                  }
                />
              </div>

              {/* Dirección */}
              <div className="space-y-2">
                <Label
                  htmlFor="direccion"
                  className="text-sm font-medium text-marron"
                >
                  Dirección *
                </Label>
                <Input
                  id="direccion"
                  placeholder="Dirección del punto..."
                  value={form.direccion}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      direccion: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Horarios (JSON textarea) */}
              <div className="space-y-2">
                <Label
                  htmlFor="horarios"
                  className="text-sm font-medium text-marron flex items-center gap-1"
                >
                  <Clock className="h-3.5 w-3.5" />
                  Horarios (JSON)
                </Label>
                <Textarea
                  id="horarios"
                  placeholder='Ej: {"lun-vie": "9:00-18:00", "sab": "9:00-13:00"}'
                  value={form.horarios}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, horarios: e.target.value }))
                  }
                  className="resize-none font-mono text-sm"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Formato JSON opcional con los horarios de atención
                </p>
              </div>

              {/* Activo switch */}
              <div className="flex items-center justify-between rounded-lg border border-marron/10 p-3">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium text-marron">
                    Activo
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {form.activo
                      ? 'El punto está visible y disponible'
                      : 'El punto está desactivado'}
                  </p>
                </div>
                <Switch
                  checked={form.activo}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, activo: checked }))
                  }
                />
              </div>

              {/* Map selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-marron flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Ubicación en el mapa
                </Label>
                <p className="text-xs text-muted-foreground">
                  Haz clic en el mapa o arrastra el marcador para seleccionar la
                  ubicación
                </p>
                <div className="rounded-lg overflow-hidden border border-marron/10">
                  <SelectorUbicacion
                    onLocationSelect={handleLocationSelect}
                    initialPosition={
                      form.latitud && form.longitud
                        ? { lat: form.latitud, lng: form.longitud }
                        : undefined
                    }
                    height="300px"
                  />
                </div>
                {/* Hidden fields display */}
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>
                    Lat:{' '}
                    <span className="font-mono text-marron">
                      {form.latitud?.toFixed(6) ?? 'No definida'}
                    </span>
                  </span>
                  <span>
                    Lng:{' '}
                    <span className="font-mono text-marron">
                      {form.longitud?.toFixed(6) ?? 'No definida'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={
                    saving || !form.nombre.trim() || !form.direccion.trim()
                  }
                  className="bg-mostaza hover:bg-mostaza/90 text-marron font-semibold"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingItem ? (
                    'Guardar Cambios'
                  ) : (
                    'Crear Punto'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-marron/10">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold text-marron">{puntos.length}</p>
          </CardContent>
        </Card>
        <Card className="border-marron/10">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Activos
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold text-oliva">
              {puntos.filter((p) => p.activo).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-marron/10">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Inactivos
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold text-rojo">
              {puntos.filter((p) => !p.activo).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-marron/10">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Con ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold text-mostaza">
              {puntos.filter((p) => p.latitud && p.longitud).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-mostaza" />
          <span className="ml-3 text-muted-foreground">
            Cargando puntos de encuentro...
          </span>
        </div>
      ) : puntos.length === 0 ? (
        <Card className="border-marron/10">
          <CardContent className="py-12 text-center">
            <MapPin className="mx-auto h-12 w-12 text-marron/20" />
            <h3 className="mt-4 text-lg font-medium text-marron">
              No hay puntos de encuentro
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Crea el primer punto de encuentro para comenzar
            </p>
            <Button
              onClick={openCreateDialog}
              className="mt-4 bg-mostaza hover:bg-mostaza/90 text-marron font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Punto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-marron/10 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="min-w-[180px]">Nombre</TableHead>
                  <TableHead className="min-w-[200px] hidden md:table-cell">
                    Dirección
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <Clock className="inline h-3.5 w-3.5 mr-1" />
                    Horarios
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {puntos.map((punto) => (
                  <TableRow key={punto.id} className="hover:bg-mostaza/5">
                    <TableCell>
                      <div className="font-medium text-marron">
                        {punto.nombre}
                      </div>
                      <div className="text-xs text-muted-foreground md:hidden mt-0.5">
                        {punto.direccion}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {punto.direccion}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm max-w-[200px] truncate">
                      {parseHorariosPreview(punto.horarios)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {punto.latitud && punto.longitud ? (
                        <Badge
                          variant="outline"
                          className="text-oliva border-oliva/30 bg-oliva/5"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          Definida
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground border-border"
                        >
                          Sin ubicación
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleActivo(punto)}
                        className="flex items-center gap-1.5 transition-colors"
                        title={
                          punto.activo
                            ? 'Click para desactivar'
                            : 'Click para activar'
                        }
                      >
                        {punto.activo ? (
                          <>
                            <ToggleRight className="h-5 w-5 text-oliva" />
                            <Badge className="bg-oliva/10 text-oliva border-oliva/20 hover:bg-oliva/20">
                              Activo
                            </Badge>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-5 w-5 text-rojo" />
                            <Badge
                              variant="outline"
                              className="text-rojo border-rojo/20 bg-rojo/5 hover:bg-rojo/10"
                            >
                              Inactivo
                            </Badge>
                          </>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-mostaza/10"
                          onClick={() => openEditDialog(punto)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4 text-mostaza" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-rojo/10"
                          onClick={() => setDeleteItem(punto)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-rojo" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar punto de encuentro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El punto de encuentro
              &quot;{deleteItem?.nombre}&quot; será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rojo hover:bg-rojo/90 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
