'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ProductoTerminado {
  id: number
  nombre: string
  precio_venta: number
}

interface MateriaPrima {
  id: number
  codigo: string | null
  nombre: string
  precio_compra_referencia: number
  id_unidad_base: number
  unidadBase: { id: number; codigo: string; nombre: string }
}

interface Insumo {
  id: number
  codigo: string | null
  nombre: string
  precio_compra_referencia: number
  id_unidad_base: number
  unidadBase: { id: number; codigo: string; nombre: string }
}

interface UnidadMedida {
  id: number
  codigo: string
  nombre: string
}

interface DetalleRow {
  key: string
  tipo: 'mp' | 'insumo'
  idItem: string
  cantidadNecesaria: string
  idUnidad: string
  nombreUnidad: string
  costoEstimado: string
}

interface RecetaFormProps {
  receta?: any | null
  onSuccess: () => void
  onCancel: () => void
}

export default function RecetaForm({ receta, onSuccess, onCancel }: RecetaFormProps) {
  const isEditing = !!receta

  // Form fields
  const [nombreReceta, setNombreReceta] = useState('')
  const [idProductoTerminado, setIdProductoTerminado] = useState('')
  const [rendimientoUnidades, setRendimientoUnidades] = useState('1')
  const [activo, setActivo] = useState(true)

  // Detail rows
  const [detalles, setDetalles] = useState<DetalleRow[]>([])

  // Data
  const [productosTerminados, setProductosTerminados] = useState<ProductoTerminado[]>([])
  const [materiasPrimas, setMateriasPrimas] = useState<MateriaPrima[]>([])
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [unidades, setUnidades] = useState<UnidadMedida[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        const [ptRes, mpRes, insRes, uniRes] = await Promise.all([
          fetch('/api/productos-terminados?limite=200&estado=true'),
          fetch('/api/materias-primas?estado=true&limite=200'),
          fetch('/api/insumos?estado=true&limite=200'),
          fetch('/api/unidades-medida'),
        ])

        const ptData = await ptRes.json()
        const mpData = await mpRes.json()
        const insData = await insRes.json()
        const uniData = await uniRes.json()

        setProductosTerminados(
          (ptData.data || []).map((pt: any) => ({
            id: pt.id,
            nombre: pt.nombre,
            precio_venta: pt.precio_venta,
          }))
        )
        setMateriasPrimas(mpData.data || [])
        setInsumos(insData.data || [])
        setUnidades(Array.isArray(uniData) ? uniData : [])
      } catch {
        toast.error('Error al cargar datos del formulario')
      } finally {
        setLoadingData(false)
      }
    }
    loadData()
  }, [])

  // Populate form when editing
  useEffect(() => {
    if (receta) {
      setNombreReceta(receta.nombre_receta || '')
      setIdProductoTerminado(receta.id_producto_terminado?.toString() || '')
      setRendimientoUnidades(receta.rendimiento_unidades?.toString() || '1')
      setActivo(receta.activo !== false)

      if (receta.detalleRecetas && Array.isArray(receta.detalleRecetas)) {
        setDetalles(
          receta.detalleRecetas.map((d: any) => ({
            key: `row-${d.id}`,
            tipo: d.id_materia_prima ? 'mp' : 'insumo',
            idItem: (d.id_materia_prima || d.id_insumo)?.toString() || '',
            cantidadNecesaria: d.cantidad_necesaria?.toString() || '',
            idUnidad: d.id_unidad?.toString() || '',
            nombreUnidad: d.unidad?.nombre || '',
            costoEstimado: d.costo_estimado?.toString() || '',
          }))
        )
      }
    } else {
      addDetailRow()
    }
  }, [receta])

  // Add detail row
  const addDetailRow = () => {
    setDetalles((prev) => [
      ...prev,
      {
        key: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        tipo: 'mp',
        idItem: '',
        cantidadNecesaria: '',
        idUnidad: '',
        nombreUnidad: '',
        costoEstimado: '',
      },
    ])
  }

  // Remove detail row
  const removeDetailRow = (key: string) => {
    setDetalles((prev) => prev.filter((d) => d.key !== key))
  }

  // Get available items based on tipo
  const getAvailableItems = (tipo: 'mp' | 'insumo') => {
    return tipo === 'mp' ? materiasPrimas : insumos
  }

  // Find item by id and tipo
  const findItem = (tipo: 'mp' | 'insumo', id: string) => {
    if (tipo === 'mp') {
      return materiasPrimas.find((mp) => mp.id.toString() === id)
    }
    return insumos.find((ins) => ins.id.toString() === id)
  }

  // Update detail row
  const updateDetalle = (key: string, field: keyof DetalleRow, value: string) => {
    setDetalles((prev) =>
      prev.map((d) => {
        if (d.key !== key) return d

        const updated = { ...d, [field]: value }

        // When tipo changes, clear item selection and unit
        if (field === 'tipo') {
          updated.idItem = ''
          updated.idUnidad = ''
          updated.nombreUnidad = ''
          updated.costoEstimado = ''
        }

        // When item is selected, auto-fill the unidad
        if (field === 'idItem' && value) {
          const item = findItem(updated.tipo, value)
          if (item) {
            updated.idUnidad = item.unidadBase?.id?.toString() || item.id_unidad_base?.toString() || ''
            updated.nombreUnidad = item.unidadBase?.nombre || ''
            // Auto-calculate costo
            const cant = parseFloat(updated.cantidadNecesaria)
            if (!isNaN(cant) && cant > 0) {
              updated.costoEstimado = (cant * item.precio_compra_referencia).toFixed(2)
            }
          }
        }

        // When cantidad changes, recalculate costo
        if (field === 'cantidadNecesaria' && updated.idItem) {
          const item = findItem(updated.tipo, updated.idItem)
          if (item) {
            const cant = parseFloat(value)
            if (!isNaN(cant) && cant > 0) {
              updated.costoEstimado = (cant * item.precio_compra_referencia).toFixed(2)
            } else {
              updated.costoEstimado = ''
            }
          }
        }

        return updated
      })
    )
  }

  // Calculate total costo estimado
  const totalCostoEstimado = useMemo(() => {
    return detalles.reduce((sum, d) => {
      const costo = parseFloat(d.costoEstimado)
      return sum + (isNaN(costo) ? 0 : costo)
    }, 0)
  }, [detalles])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
  }

  // Submit
  const handleSubmit = async () => {
    // Validation
    if (!nombreReceta.trim()) {
      toast.error('Ingresá el nombre de la receta')
      return
    }
    if (!idProductoTerminado) {
      toast.error('Seleccioná un producto terminado')
      return
    }
    if (!rendimientoUnidades || parseInt(rendimientoUnidades) <= 0) {
      toast.error('Ingresá un rendimiento válido')
      return
    }
    if (detalles.length === 0) {
      toast.error('Agregá al menos un ingrediente a la receta')
      return
    }
    for (let i = 0; i < detalles.length; i++) {
      const d = detalles[i]
      if (!d.idItem) {
        toast.error(`Fila ${i + 1}: Seleccioná un ${d.tipo === 'mp' ? 'materia prima' : 'insumo'}`)
        return
      }
      if (!d.cantidadNecesaria || parseFloat(d.cantidadNecesaria) <= 0) {
        toast.error(`Fila ${i + 1}: Ingresá una cantidad válida`)
        return
      }
      if (!d.idUnidad) {
        toast.error(`Fila ${i + 1}: Falta la unidad de medida`)
        return
      }
    }

    setSubmitting(true)
    try {
      const payload = {
        nombre_receta: nombreReceta.trim(),
        id_producto_terminado: parseInt(idProductoTerminado),
        rendimiento_unidades: parseInt(rendimientoUnidades),
        activo,
        detalles: detalles.map((d) => ({
          tipo: d.tipo,
          id_materia_prima: d.tipo === 'mp' ? parseInt(d.idItem) : null,
          id_insumo: d.tipo === 'insumo' ? parseInt(d.idItem) : null,
          cantidad_necesaria: parseFloat(d.cantidadNecesaria),
          id_unidad: parseInt(d.idUnidad),
          costo_estimado: parseFloat(d.costoEstimado) || 0,
        })),
      }

      const url = isEditing ? `/api/recetas/${receta.id}` : '/api/recetas'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Error al guardar receta')
      }

      toast.success(isEditing ? 'Receta actualizada' : 'Receta registrada', {
        description: isEditing
          ? 'Los cambios se guardaron correctamente'
          : 'La nueva receta se registró exitosamente',
      })
      onSuccess()
    } catch (error: any) {
      toast.error('Error al guardar', {
        description: error.message || 'Intentá de nuevo más tarde',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-mostaza" />
        <span className="ml-2 text-muted-foreground">Cargando datos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header info */}
      {isEditing && (
        <div className="bg-muted/30 rounded-lg p-3 border border-marron/10">
          <p className="text-sm text-muted-foreground">
            Receta #{receta.id} — {receta.nombre_receta}
          </p>
        </div>
      )}

      {/* Main fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nombre Receta */}
        <div>
          <Label className="text-sm font-medium text-marron mb-1 block">Nombre Receta *</Label>
          <Input
            placeholder="Ej: Fettuccine al huevo"
            value={nombreReceta}
            onChange={(e) => setNombreReceta(e.target.value)}
          />
        </div>

        {/* Producto Terminado */}
        <div>
          <Label className="text-sm font-medium text-marron mb-1 block">Producto Terminado *</Label>
          <Select value={idProductoTerminado} onValueChange={setIdProductoTerminado}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {productosTerminados.map((pt) => (
                <SelectItem key={pt.id} value={pt.id.toString()}>
                  {pt.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rendimiento */}
        <div>
          <Label className="text-sm font-medium text-marron mb-1 block">Rendimiento (unidades) *</Label>
          <Input
            type="number"
            min="1"
            placeholder="1"
            value={rendimientoUnidades}
            onChange={(e) => setRendimientoUnidades(e.target.value)}
          />
        </div>

        {/* Activo */}
        <div className="flex items-center gap-2 pt-6">
          <Checkbox
            id="activo"
            checked={activo}
            onCheckedChange={(checked) => setActivo(checked === true)}
          />
          <Label htmlFor="activo" className="text-sm font-medium text-marron cursor-pointer">
            Activo
          </Label>
        </div>
      </div>

      {/* Detail rows */}
      <Separator />
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-semibold text-marron">Ingredientes de la Receta</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDetailRow}
            className="border-mostaza/30 text-mostaza hover:bg-mostaza/10"
          >
            <Plus className="mr-1 h-4 w-4" />
            Agregar Ingrediente
          </Button>
        </div>

        <div className="space-y-3">
          {detalles.map((detalle, index) => (
            <div
              key={detalle.key}
              className="p-3 rounded-lg border border-marron/10 bg-muted/20 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Ingrediente {index + 1}
                </span>
                {detalles.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-rojo/10"
                    onClick={() => removeDetailRow(detalle.key)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rojo" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* Tipo */}
                <div>
                  <Label className="text-xs text-muted-foreground">Tipo</Label>
                  <Select
                    value={detalle.tipo}
                    onValueChange={(v) => updateDetalle(detalle.key, 'tipo', v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mp">Materia Prima</SelectItem>
                      <SelectItem value="insumo">Insumo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Item */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs text-muted-foreground">
                    {detalle.tipo === 'mp' ? 'Materia Prima' : 'Insumo'}
                  </Label>
                  <Select
                    value={detalle.idItem}
                    onValueChange={(v) => updateDetalle(detalle.key, 'idItem', v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableItems(detalle.tipo).map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cantidad */}
                <div>
                  <Label className="text-xs text-muted-foreground">Cantidad</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    className="h-9"
                    value={detalle.cantidadNecesaria}
                    onChange={(e) => updateDetalle(detalle.key, 'cantidadNecesaria', e.target.value)}
                  />
                </div>

                {/* Unidad (auto-filled, read-only) */}
                <div>
                  <Label className="text-xs text-muted-foreground">Unidad</Label>
                  <Input
                    className="h-9 bg-muted/50"
                    value={detalle.nombreUnidad || '-'}
                    disabled
                  />
                </div>

                {/* Costo Estimado (auto-calculated) */}
                <div>
                  <Label className="text-xs text-muted-foreground">Costo Est.</Label>
                  <Input
                    className="h-9 bg-muted/50 font-semibold"
                    value={detalle.costoEstimado ? formatCurrency(parseFloat(detalle.costoEstimado)) : ''}
                    disabled
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <Separator />
      <div className="flex justify-end">
        <div className="w-full sm:w-72 space-y-2">
          <div className="flex justify-between text-base font-bold">
            <span className="text-marron">Costo Total Estimado</span>
            <span className="text-marron">{formatCurrency(totalCostoEstimado)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          className="bg-mostaza hover:bg-mostaza/90 text-marron font-semibold"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : isEditing ? (
            'Guardar Cambios'
          ) : (
            'Registrar Receta'
          )}
        </Button>
      </div>
    </div>
  )
}
