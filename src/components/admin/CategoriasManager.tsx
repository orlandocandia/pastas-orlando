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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CategoriaItem {
  id: number
  nombre: string
  descripcion?: string | null
}

type TipoCategoria = 'materias-primas' | 'productos-terminados' | 'tipos-insumo'

const TABS: { value: TipoCategoria; label: string }[] = [
  { value: 'materias-primas', label: 'Materias Primas' },
  { value: 'productos-terminados', label: 'Productos Terminados' },
  { value: 'tipos-insumo', label: 'Tipos de Insumo' },
]

export default function CategoriasManager() {
  const [activeTab, setActiveTab] = useState<TipoCategoria>('materias-primas')
  const [categorias, setCategorias] = useState<CategoriaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevaDescripcion, setNuevaDescripcion] = useState('')
  const [creating, setCreating] = useState(false)

  // Edit dialog
  const [editItem, setEditItem] = useState<CategoriaItem | null>(null)
  const [editNombre, setEditNombre] = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Delete
  const [deleteItem, setDeleteItem] = useState<CategoriaItem | null>(null)

  const fetchCategorias = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/categorias?tipo=${activeTab}`)
      if (!res.ok) throw new Error('Error al cargar categorías')
      const data = await res.json()
      setCategorias(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchCategorias()
  }, [fetchCategorias])

  const handleCreate = async () => {
    if (!nuevoNombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: activeTab,
          nombre: nuevoNombre.trim(),
          descripcion: nuevaDescripcion.trim() || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al crear categoría')
      }
      toast.success('Categoría creada')
      setNuevoNombre('')
      setNuevaDescripcion('')
      fetchCategorias()
    } catch (error: any) {
      toast.error(error.message || 'Error al crear categoría')
    } finally {
      setCreating(false)
    }
  }

  const handleEdit = (item: CategoriaItem) => {
    setEditItem(item)
    setEditNombre(item.nombre)
    setEditDescripcion(item.descripcion || '')
    setEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editItem || !editNombre.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/categorias', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editItem.id,
          tipo: activeTab,
          nombre: editNombre.trim(),
          descripcion: editDescripcion.trim() || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al actualizar categoría')
      }
      toast.success('Categoría actualizada')
      setEditOpen(false)
      setEditItem(null)
      fetchCategorias()
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar categoría')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    try {
      const res = await fetch(`/api/categorias?id=${deleteItem.id}&tipo=${activeTab}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al eliminar categoría')
      }
      toast.success('Categoría eliminada')
      fetchCategorias()
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar categoría')
    } finally {
      setDeleteItem(null)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TipoCategoria)}>
        <TabsList className="grid w-full grid-cols-3">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            {/* Inline create form */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end p-4 rounded-lg border border-marron/10 bg-muted/30">
              <div className="flex-1 w-full">
                <label className="text-sm font-medium text-marron mb-1 block">Nombre *</label>
                <Input
                  placeholder="Nombre de la categoría..."
                  value={tab.value === activeTab ? nuevoNombre : ''}
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
                  value={tab.value === activeTab ? nuevaDescripcion : ''}
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
            ) : categorias.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay categorías de {tab.label.toLowerCase()} cargadas
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
                    {categorias.map((cat) => (
                      <TableRow key={cat.id} className="hover:bg-mostaza/5">
                        <TableCell className="font-medium text-marron">
                          {cat.nombre}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {cat.descripcion || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-mostaza/10"
                              onClick={() => handleEdit(cat)}
                            >
                              <Pencil className="h-4 w-4 text-mostaza" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-rojo/10"
                              onClick={() => setDeleteItem(cat)}
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
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => {
        setEditOpen(open)
        if (!open) setEditItem(null)
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-marron">Editar Categoría</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-marron mb-1 block">Nombre *</label>
              <Input
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
                placeholder="Nombre de la categoría..."
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
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La categoría &quot;{deleteItem?.nombre}&quot; será eliminada permanentemente.
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
