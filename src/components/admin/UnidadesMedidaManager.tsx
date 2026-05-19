'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface UnidadMedida {
  id: number
  codigo: string
  nombre: string
  conversion_a_base: number
  tipo_medida: string
}

const TIPOS_MEDIDA = [
  { value: 'peso', label: 'Peso' },
  { value: 'volumen', label: 'Volumen' },
  { value: 'longitud', label: 'Longitud' },
  { value: 'unidad', label: 'Unidad' },
]

export default function UnidadesMedidaManager() {
  const [unidades, setUnidades] = useState<UnidadMedida[]>([])
  const [loading, setLoading] = useState(true)

  // Create form
  const [nuevoCodigo, setNuevoCodigo] = useState('')
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevaConversion, setNuevaConversion] = useState('1')
  const [nuevoTipo, setNuevoTipo] = useState('')
  const [creating, setCreating] = useState(false)

  // Edit dialog
  const [editItem, setEditItem] = useState<UnidadMedida | null>(null)
  const [editCodigo, setEditCodigo] = useState('')
  const [editNombre, setEditNombre] = useState('')
  const [editConversion, setEditConversion] = useState('')
  const [editTipo, setEditTipo] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Delete
  const [deleteItem, setDeleteItem] = useState<UnidadMedida | null>(null)

  const fetchUnidades = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/unidades-medida')
      if (!res.ok) throw new Error('Error al cargar unidades')
      const data = await res.json()
      setUnidades(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Error al cargar unidades de medida')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUnidades()
  }, [fetchUnidades])

  const handleCreate = async () => {
    if (!nuevoCodigo.trim() || !nuevoNombre.trim() || !nuevoTipo) {
      toast.error('Código, nombre y tipo de medida son requeridos')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/unidades-medida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: nuevoCodigo.trim(),
          nombre: nuevoNombre.trim(),
          conversion_a_base: parseFloat(nuevaConversion) || 1.0,
          tipo_medida: nuevoTipo,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al crear unidad')
      }
      toast.success('Unidad de medida creada')
      setNuevoCodigo('')
      setNuevoNombre('')
      setNuevaConversion('1')
      setNuevoTipo('')
      fetchUnidades()
    } catch (error: any) {
      toast.error(error.message || 'Error al crear unidad')
    } finally {
      setCreating(false)
    }
  }

  const handleEdit = (unidad: UnidadMedida) => {
    setEditItem(unidad)
    setEditCodigo(unidad.codigo)
    setEditNombre(unidad.nombre)
    setEditConversion(unidad.conversion_a_base.toString())
    setEditTipo(unidad.tipo_medida)
    setEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editItem || !editCodigo.trim() || !editNombre.trim() || !editTipo) return
    setSaving(true)
    try {
      const res = await fetch('/api/unidades-medida', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editItem.id,
          codigo: editCodigo.trim(),
          nombre: editNombre.trim(),
          conversion_a_base: parseFloat(editConversion) || 1.0,
          tipo_medida: editTipo,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al actualizar unidad')
      }
      toast.success('Unidad de medida actualizada')
      setEditOpen(false)
      setEditItem(null)
      fetchUnidades()
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar unidad')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    try {
      const res = await fetch(`/api/unidades-medida?id=${deleteItem.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al eliminar unidad')
      }
      toast.success('Unidad de medida eliminada')
      fetchUnidades()
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar unidad')
    } finally {
      setDeleteItem(null)
    }
  }

  const getTipoLabel = (tipo: string) => {
    return TIPOS_MEDIDA.find((t) => t.value === tipo)?.label || tipo
  }

  return (
    <div className="space-y-4">
      {/* Inline create form */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end p-4 rounded-lg border border-marron/10 bg-muted/30">
        <div className="w-full sm:w-28">
          <label className="text-sm font-medium text-marron mb-1 block">Código *</label>
          <Input
            placeholder="kg"
            value={nuevoCodigo}
            onChange={(e) => setNuevoCodigo(e.target.value)}
          />
        </div>
        <div className="flex-1 w-full">
          <label className="text-sm font-medium text-marron mb-1 block">Nombre *</label>
          <Input
            placeholder="Kilogramo"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-28">
          <label className="text-sm font-medium text-marron mb-1 block">Conversión</label>
          <Input
            type="number"
            step="0.0001"
            min="0"
            placeholder="1"
            value={nuevaConversion}
            onChange={(e) => setNuevaConversion(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-36">
          <label className="text-sm font-medium text-marron mb-1 block">Tipo *</label>
          <Select value={nuevoTipo} onValueChange={setNuevoTipo}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_MEDIDA.map((tipo) => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleCreate}
          disabled={creating || !nuevoCodigo.trim() || !nuevoNombre.trim() || !nuevoTipo}
          className="bg-mostaza hover:bg-mostaza/90 text-marron font-semibold"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Agregar
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-mostaza" />
        </div>
      ) : unidades.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay unidades de medida cargadas
        </div>
      ) : (
        <div className="rounded-lg border border-marron/10 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden sm:table-cell">Conversión a Base</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unidades.map((unidad) => (
                <TableRow key={unidad.id} className="hover:bg-mostaza/5">
                  <TableCell className="font-mono text-sm text-marron">
                    {unidad.codigo}
                  </TableCell>
                  <TableCell className="font-medium text-marron">
                    {unidad.nombre}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {unidad.conversion_a_base}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-marron/20 text-marron">
                      {getTipoLabel(unidad.tipo_medida)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-mostaza/10"
                        onClick={() => handleEdit(unidad)}
                      >
                        <Pencil className="h-4 w-4 text-mostaza" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-rojo/10"
                        onClick={() => setDeleteItem(unidad)}
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
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => {
        setEditOpen(open)
        if (!open) setEditItem(null)
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-marron">Editar Unidad de Medida</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-marron mb-1 block">Código *</label>
                <Input
                  value={editCodigo}
                  onChange={(e) => setEditCodigo(e.target.value)}
                  placeholder="kg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-marron mb-1 block">Nombre *</label>
                <Input
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  placeholder="Kilogramo"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-marron mb-1 block">Conversión a Base</label>
                <Input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={editConversion}
                  onChange={(e) => setEditConversion(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-marron mb-1 block">Tipo de Medida *</label>
                <Select value={editTipo} onValueChange={setEditTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_MEDIDA.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditOpen(false)
                  setEditItem(null)
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={saving || !editCodigo.trim() || !editNombre.trim() || !editTipo}
                className="bg-mostaza hover:bg-mostaza/90 text-marron font-semibold"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar unidad de medida?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La unidad &quot;{deleteItem?.nombre}&quot; ({deleteItem?.codigo}) será eliminada permanentemente.
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
