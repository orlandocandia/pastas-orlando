'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Shield, Plus, Pencil, Trash2, Loader2, Users, KeyRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Permiso {
  id: number
  nombre: string
  codigo: string
  modulo: string
  descripcion: string | null
}

interface Rol {
  id: number
  nombre: string
  descripcion: string | null
  _count?: { usuarios: number }
  permisos: Permiso[]
}

interface PermisosResponse {
  permisos: Permiso[]
  modulos: string[]
  roles: Rol[]
}

const moduloLabels: Record<string, string> = {
  productos: 'Productos',
  compras: 'Compras',
  ventas: 'Ventas',
  produccion: 'Producción',
  usuarios: 'Usuarios',
  auditoria: 'Auditoría',
  reportes: 'Reportes',
  seguridad: 'Seguridad',
}

const moduloOrder = ['productos', 'compras', 'ventas', 'produccion', 'usuarios', 'auditoria', 'reportes', 'seguridad']

export default function PermisosPage() {
  const [data, setData] = useState<PermisosResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Rol | null>(null)
  const [roleName, setRoleName] = useState('')
  const [roleDescription, setRoleDescription] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Rol | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/usuarios/permisos')
      if (!res.ok) throw new Error('Error al cargar permisos')
      const result = await res.json()
      setData(result)
    } catch {
      toast.error('Error al cargar permisos y roles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreateDialog = () => {
    setEditingRole(null)
    setRoleName('')
    setRoleDescription('')
    setSelectedPermissions([])
    setDialogOpen(true)
  }

  const openEditDialog = (role: Rol) => {
    setEditingRole(role)
    setRoleName(role.nombre)
    setRoleDescription(role.descripcion || '')
    setSelectedPermissions(role.permisos.map(p => p.id))
    setDialogOpen(true)
  }

  const handleSaveRole = async () => {
    if (!roleName.trim()) {
      toast.error('El nombre del rol es obligatorio')
      return
    }
    setSaving(true)
    try {
      if (editingRole) {
        const res = await fetch('/api/seguridad/roles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingRole.id,
            nombre: roleName,
            descripcion: roleDescription,
            id_permisos: selectedPermissions,
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Error al actualizar rol')
        }
        toast.success('Rol actualizado correctamente')
      } else {
        const res = await fetch('/api/seguridad/roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: roleName,
            descripcion: roleDescription,
            id_permisos: selectedPermissions,
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Error al crear rol')
        }
        toast.success('Rol creado correctamente')
      }
      setDialogOpen(false)
      fetchData()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar rol')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRole = async () => {
    if (!roleToDelete) return
    setSaving(true)
    try {
      const res = await fetch(`/api/seguridad/roles?id=${roleToDelete.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al eliminar rol')
      }
      toast.success('Rol eliminado correctamente')
      setDeleteConfirmOpen(false)
      setRoleToDelete(null)
      fetchData()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar rol')
    } finally {
      setSaving(false)
    }
  }

  const togglePermission = (permId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(id => id !== permId)
        : [...prev, permId]
    )
  }

  const toggleModulePermissions = (modulo: string) => {
    if (!data) return
    const modulePermIds = data.permisos
      .filter(p => p.modulo === modulo)
      .map(p => p.id)
    const allSelected = modulePermIds.every(id => selectedPermissions.includes(id))
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !modulePermIds.includes(id)))
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...modulePermIds])])
    }
  }

  const groupedPermisos = (() => {
    if (!data) return {}
    const groups: Record<string, Permiso[]> = {}
    for (const permiso of data.permisos) {
      if (!groups[permiso.modulo]) groups[permiso.modulo] = []
      groups[permiso.modulo].push(permiso)
    }
    return groups
  })()

  const sortedModulos = Object.keys(groupedPermisos).sort(
    (a, b) => moduloOrder.indexOf(a) - moduloOrder.indexOf(b)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-mostaza" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-mostaza/10 p-2">
            <Shield className="h-5 w-5 text-mostaza" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-marron">Roles y Permisos</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona los roles del sistema y sus permisos de acceso
            </p>
          </div>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-mostaza hover:bg-mostaza/90 text-marron font-semibold gap-2"
        >
          <Plus className="h-4 w-4" />
          Crear Rol
        </Button>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data?.roles.map(role => (
          <Card
            key={role.id}
            className="border-marron/10 hover:border-mostaza/30 transition-colors cursor-pointer group"
            onClick={() => openEditDialog(role)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-marron">{role.nombre}</CardTitle>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => { e.stopPropagation(); openEditDialog(role) }}
                  >
                    <Pencil className="h-3.5 w-3.5 text-mostaza" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={(role._count?.usuarios ?? 0) > 0}
                    onClick={(e) => {
                      e.stopPropagation()
                      setRoleToDelete(role)
                      setDeleteConfirmOpen(true)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rojo" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {role.descripcion || 'Sin descripción'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{role._count?.usuarios ?? 0} usuario{((role._count?.usuarios ?? 0) !== 1) ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>{role.permisos.length} permiso{role.permisos.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permission Matrix */}
      <div>
        <h2 className="text-lg font-semibold text-marron mb-3">Matriz de Permisos</h2>
        <div className="rounded-lg border border-marron/10 bg-card overflow-hidden">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="min-w-[200px]">Permiso</TableHead>
                  {data?.roles.map(role => (
                    <TableHead key={role.id} className="text-center min-w-[100px]">
                      {role.nombre}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedModulos.map(modulo => (
                  <>
                    <TableRow key={`header-${modulo}`} className="bg-mostaza/5">
                      <TableCell
                        colSpan={(data?.roles.length ?? 0) + 1}
                        className="font-semibold text-marron text-sm py-2"
                      >
                        {moduloLabels[modulo] || modulo}
                      </TableCell>
                    </TableRow>
                    {groupedPermisos[modulo]?.map(permiso => (
                      <TableRow key={permiso.id}>
                        <TableCell className="text-sm text-muted-foreground pl-6">
                          {permiso.nombre}
                        </TableCell>
                        {data?.roles.map(role => {
                          const hasPermission = role.permisos.some(p => p.id === permiso.id)
                          return (
                            <TableCell key={role.id} className="text-center">
                              <Checkbox
                                checked={hasPermission}
                                disabled
                                className="mx-auto data-[state=checked]:bg-mostaza data-[state=checked]:border-mostaza"
                              />
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>

      {/* Create/Edit Role Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-marron">
              {editingRole ? `Editar Rol: ${editingRole.nombre}` : 'Crear Nuevo Rol'}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? 'Modifica el nombre, descripción y permisos del rol.'
                : 'Define un nuevo rol con sus permisos de acceso.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-marron">Nombre del Rol</label>
                <Input
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Ej: Supervisor de Ventas"
                  className="border-marron/20 focus:border-mostaza"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-marron">Descripción</label>
                <Input
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Describe el rol y sus responsabilidades"
                  className="border-marron/20 focus:border-mostaza"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-marron">Permisos</label>
                {sortedModulos.map(modulo => (
                  <div key={modulo} className="border border-marron/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Checkbox
                        checked={
                          groupedPermisos[modulo]?.length > 0 &&
                          groupedPermisos[modulo].every(p => selectedPermissions.includes(p.id))
                        }
                        onCheckedChange={() => toggleModulePermissions(modulo)}
                        className="data-[state=checked]:bg-mostaza data-[state=checked]:border-mostaza"
                      />
                      <span className="font-medium text-sm text-marron">
                        {moduloLabels[modulo] || modulo}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {groupedPermisos[modulo]?.filter(p => selectedPermissions.includes(p.id)).length}/{groupedPermisos[modulo]?.length ?? 0}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                      {groupedPermisos[modulo]?.map(permiso => (
                        <label
                          key={permiso.id}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedPermissions.includes(permiso.id)}
                            onCheckedChange={() => togglePermission(permiso.id)}
                            className="data-[state=checked]:bg-mostaza data-[state=checked]:border-mostaza"
                          />
                          {permiso.nombre}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveRole}
              disabled={saving || !roleName.trim()}
              className="bg-mostaza hover:bg-mostaza/90 text-marron font-semibold"
            >
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
              ) : (
                editingRole ? 'Guardar Cambios' : 'Crear Rol'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-marron">Eliminar Rol</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el rol &quot;{roleToDelete?.nombre}&quot;?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {(roleToDelete?._count?.usuarios ?? 0) > 0 && (
            <div className="bg-rojo/10 border border-rojo/20 rounded-lg p-3 text-sm text-rojo">
              Este rol tiene {roleToDelete?._count?.usuarios} usuario{(roleToDelete?._count?.usuarios ?? 0) !== 1 ? 's' : ''} asignado{(roleToDelete?._count?.usuarios ?? 0) !== 1 ? 's' : ''}.
              Reasigna los usuarios antes de eliminar.
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRole}
              disabled={saving || (roleToDelete?._count?.usuarios ?? 0) > 0}
            >
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Eliminando...</>
              ) : (
                'Eliminar Rol'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
