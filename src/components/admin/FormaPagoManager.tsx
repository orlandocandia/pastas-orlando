'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Loader2, Check, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
import { Badge } from '@/components/ui/badge'

interface FormaPago {
  id: number
  nombre_forma: string
  requiere_identificacion: boolean
  requiere_cuenta: boolean
}

export default function FormaPagoManager() {
  const [formasPago, setFormasPago] = useState<FormaPago[]>([])
  const [loading, setLoading] = useState(true)

  // Inline create form
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoReqIdent, setNuevoReqIdent] = useState(false)
  const [nuevoReqCuenta, setNuevoReqCuenta] = useState(false)
  const [creating, setCreating] = useState(false)

  // Edit dialog
  const [editItem, setEditItem] = useState<FormaPago | null>(null)
  const [editNombre, setEditNombre] = useState('')
  const [editReqIdent, setEditReqIdent] = useState(false)
  const [editReqCuenta, setEditReqCuenta] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Delete
  const [deleteItem, setDeleteItem] = useState<FormaPago | null>(null)

  const fetchFormasPago = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/formas-pago')
      if (!res.ok) throw new Error('Error al cargar formas de pago')
      const data = await res.json()
      setFormasPago(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Error al cargar formas de pago')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFormasPago()
  }, [fetchFormasPago])

  const handleCreate = async () => {
    if (!nuevoNombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/formas-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_forma: nuevoNombre.trim(),
          requiere_identificacion: nuevoReqIdent,
          requiere_cuenta: nuevoReqCuenta,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al crear forma de pago')
      }
      toast.success('Forma de pago creada')
      setNuevoNombre('')
      setNuevoReqIdent(false)
      setNuevoReqCuenta(false)
      fetchFormasPago()
    } catch (error: any) {
      toast.error(error.message || 'Error al crear forma de pago')
    } finally {
      setCreating(false)
    }
  }

  const handleEdit = (fp: FormaPago) => {
    setEditItem(fp)
    setEditNombre(fp.nombre_forma)
    setEditReqIdent(fp.requiere_identificacion)
    setEditReqCuenta(fp.requiere_cuenta)
    setEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editItem || !editNombre.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/formas-pago', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editItem.id,
          nombre_forma: editNombre.trim(),
          requiere_identificacion: editReqIdent,
          requiere_cuenta: editReqCuenta,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al actualizar forma de pago')
      }
      toast.success('Forma de pago actualizada')
      setEditOpen(false)
      setEditItem(null)
      fetchFormasPago()
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar forma de pago')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    try {
      const res = await fetch(`/api/formas-pago?id=${deleteItem.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al eliminar forma de pago')
      }
      toast.success('Forma de pago eliminada')
      fetchFormasPago()
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar forma de pago')
    } finally {
      setDeleteItem(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Inline create form */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end p-4 rounded-lg border border-marron/10 bg-muted/30">
        <div className="flex-1 w-full">
          <Label className="text-sm font-medium text-marron mb-1 block">Nombre *</Label>
          <Input
            placeholder="Ej: Efectivo, Transferencia..."
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
            }}
          />
        </div>
        <div className="flex items-center gap-4 pt-1 sm:pb-1">
          <div className="flex items-center gap-2">
            <Checkbox
              id="req-ident-new"
              checked={nuevoReqIdent}
              onCheckedChange={(checked) => setNuevoReqIdent(checked === true)}
            />
            <Label htmlFor="req-ident-new" className="text-sm font-normal cursor-pointer">
              Req. Identificación
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="req-cuenta-new"
              checked={nuevoReqCuenta}
              onCheckedChange={(checked) => setNuevoReqCuenta(checked === true)}
            />
            <Label htmlFor="req-cuenta-new" className="text-sm font-normal cursor-pointer">
              Req. Cuenta
            </Label>
          </div>
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
      ) : formasPago.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay formas de pago cargadas
        </div>
      ) : (
        <div className="rounded-lg border border-marron/10 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nombre</TableHead>
                <TableHead className="text-center">Req. Identificación</TableHead>
                <TableHead className="text-center">Req. Cuenta</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formasPago.map((fp) => (
                <TableRow key={fp.id} className="hover:bg-mostaza/5">
                  <TableCell className="font-medium text-marron">
                    {fp.nombre_forma}
                  </TableCell>
                  <TableCell className="text-center">
                    {fp.requiere_identificacion ? (
                      <Check className="h-4 w-4 text-oliva mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {fp.requiere_cuenta ? (
                      <Check className="h-4 w-4 text-oliva mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-mostaza/10"
                        onClick={() => handleEdit(fp)}
                      >
                        <Pencil className="h-4 w-4 text-mostaza" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-rojo/10"
                        onClick={() => setDeleteItem(fp)}
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
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setEditItem(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-marron">Editar Forma de Pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-marron mb-1 block">Nombre *</Label>
              <Input
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
                placeholder="Nombre de la forma de pago..."
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="req-ident-edit"
                  checked={editReqIdent}
                  onCheckedChange={(checked) => setEditReqIdent(checked === true)}
                />
                <Label htmlFor="req-ident-edit" className="text-sm font-normal cursor-pointer">
                  Requiere Identificación
                </Label>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="req-cuenta-edit"
                  checked={editReqCuenta}
                  onCheckedChange={(checked) => setEditReqCuenta(checked === true)}
                />
                <Label htmlFor="req-cuenta-edit" className="text-sm font-normal cursor-pointer">
                  Requiere Cuenta
                </Label>
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
            <AlertDialogTitle>¿Eliminar forma de pago?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La forma de pago &quot;{deleteItem?.nombre_forma}&quot; será eliminada permanentemente.
              Si está siendo usada en compras, no se podrá eliminar.
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
