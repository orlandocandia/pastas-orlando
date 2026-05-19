'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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

interface Marca {
  id: number
  nombre: string
  descripcion?: string | null
}

export default function MarcasManager() {
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [loading, setLoading] = useState(true)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevaDescripcion, setNuevaDescripcion] = useState('')
  const [creating, setCreating] = useState(false)

  // Edit dialog
  const [editItem, setEditItem] = useState<Marca | null>(null)
  const [editNombre, setEditNombre] = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Delete
  const [deleteItem, setDeleteItem] = useState<Marca | null>(null)

  const fetchMarcas = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/marcas')
      if (!res.ok) throw new Error('Error al cargar marcas')
      const data = await res.json()
      setMarcas(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Error al cargar marcas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMarcas()
  }, [fetchMarcas])

  const handleCreate = async () => {
    if (!nuevoNombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/marcas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoNombre.trim(),
          descripcion: nuevaDescripcion.trim() || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al crear marca')
      }
      toast.success('Marca creada')
      setNuevoNombre('')
      setNuevaDescripcion('')
      fetchMarcas()
    } catch (error: any) {
      toast.error(error.message || 'Error al crear marca')
    } finally {
      setCreating(false)
    }
  }

  const handleEdit = (marca: Marca) => {
    setEditItem(marca)
    setEditNombre(marca.nombre)
    setEditDescripcion(marca.descripcion || '')
    setEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editItem || !editNombre.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/marcas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editItem.id,
          nombre: editNombre.trim(),
          descripcion: editDescripcion.trim() || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al actualizar marca')
      }
      toast.success('Marca actualizada')
      setEditOpen(false)
      setEditItem(null)
      fetchMarcas()
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar marca')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    try {
      const res = await fetch(`/api/marcas?id=${deleteItem.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al eliminar marca')
      }
      toast.success('Marca eliminada')
      fetchMarcas()
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar marca')
    } finally {
      setDeleteItem(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Inline create form */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end p-4 rounded-lg border border-marron/10 bg-muted/30">
        <div className="flex-1 w-full">
          <label className="text-sm font-medium text-marron mb-1 block">Nombre *</label>
          <Input
            placeholder="Nombre de la marca..."
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
            }}
          />
        </div>
        <div className="flex-1 w-full">
          <label className="text-sm font-medium text-marron mb-1 block">Descripción</label>
          <Input
            placeholder="Descripción (opcional)..."
            value={nuevaDescripcion}
            onChange={(e) => setNuevaDescripcion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
            }}
          />
        </div>
        <Button
          onClick={handleCreate}
          disabled={creating || !nuevoNombre.trim()}
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
      ) : marcas.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay marcas cargadas
        </div>
      ) : (
        <div className="rounded-lg border border-marron/10 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden sm:table-cell">Descripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marcas.map((marca) => (
                <TableRow key={marca.id} className="hover:bg-mostaza/5">
                  <TableCell className="font-medium text-marron">
                    {marca.nombre}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {marca.descripcion || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-mostaza/10"
                        onClick={() => handleEdit(marca)}
                      >
                        <Pencil className="h-4 w-4 text-mostaza" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-rojo/10"
                        onClick={() => setDeleteItem(marca)}
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
            <DialogTitle className="text-marron">Editar Marca</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-marron mb-1 block">Nombre *</label>
              <Input
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
                placeholder="Nombre de la marca..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-marron mb-1 block">Descripción</label>
              <Textarea
                value={editDescripcion}
                onChange={(e) => setEditDescripcion(e.target.value)}
                placeholder="Descripción (opcional)..."
                className="resize-none"
                rows={3}
              />
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
                disabled={saving || !editNombre.trim()}
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
            <AlertDialogTitle>¿Eliminar marca?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La marca &quot;{deleteItem?.nombre}&quot; será eliminada permanentemente.
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
