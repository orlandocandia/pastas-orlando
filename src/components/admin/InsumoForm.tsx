'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ImageUploaderProducto from './ImageUploaderProducto'

const insumoSchema = z.object({
  codigo: z.string().optional(),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  id_tipo_insumo: z.string().min(1, 'Seleccioná un tipo de insumo'),
  id_unidad_base: z.string().min(1, 'Seleccioná una unidad de medida'),
  stock_actual: z.coerce.number().min(0, 'El stock no puede ser negativo').default(0),
  stock_minimo: z.coerce.number().min(0, 'El stock mínimo no puede ser negativo').default(0),
  precio_compra_referencia: z.coerce.number().min(0, 'El precio no puede ser negativo').default(0),
  imagen: z.string().optional(),
  estado: z.boolean().default(true),
})

type InsumoFormValues = z.infer<typeof insumoSchema>

interface TipoInsumo {
  id: number
  nombre: string
}

interface UnidadMedida {
  id: number
  codigo: string
  nombre: string
}

interface InsumoFormProps {
  insumo?: any | null
  onSuccess: () => void
}

export default function InsumoForm({ insumo, onSuccess }: InsumoFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [imageUrl, setImageUrl] = useState(insumo?.imagen || '')
  const [tiposInsumo, setTiposInsumo] = useState<TipoInsumo[]>([])
  const [unidades, setUnidades] = useState<UnidadMedida[]>([])
  const [loadingTipos, setLoadingTipos] = useState(true)
  const [loadingUnidades, setLoadingUnidades] = useState(true)

  const isEditing = !!insumo

  const form = useForm<InsumoFormValues>({
    resolver: zodResolver(insumoSchema),
    defaultValues: {
      codigo: insumo?.codigo || '',
      nombre: insumo?.nombre || '',
      descripcion: insumo?.descripcion || '',
      id_tipo_insumo: insumo?.id_tipo_insumo?.toString() || '',
      id_unidad_base: insumo?.id_unidad_base?.toString() || '',
      stock_actual: insumo?.stock_actual ?? 0,
      stock_minimo: insumo?.stock_minimo ?? 0,
      precio_compra_referencia: insumo?.precio_compra_referencia ?? 0,
      imagen: insumo?.imagen || '',
      estado: insumo?.estado ?? true,
    },
  })

  useEffect(() => {
    async function fetchTipos() {
      try {
        const res = await fetch('/api/categorias?tipo=tipos-insumo')
        if (!res.ok) throw new Error('Error al cargar tipos')
        const data = await res.json()
        setTiposInsumo(Array.isArray(data) ? data : [])
      } catch {
        toast.error('Error al cargar tipos de insumo')
      } finally {
        setLoadingTipos(false)
      }
    }

    async function fetchUnidades() {
      try {
        const res = await fetch('/api/unidades-medida')
        if (!res.ok) throw new Error('Error al cargar unidades')
        const data = await res.json()
        setUnidades(Array.isArray(data) ? data : [])
      } catch {
        toast.error('Error al cargar unidades de medida')
      } finally {
        setLoadingUnidades(false)
      }
    }

    fetchTipos()
    fetchUnidades()
  }, [])

  async function onSubmit(data: InsumoFormValues) {
    setSubmitting(true)
    try {
      const payload = {
        ...data,
        imagen: imageUrl || null,
        descripcion: data.descripcion || null,
        codigo: data.codigo || null,
        id_tipo_insumo: parseInt(data.id_tipo_insumo),
        id_unidad_base: parseInt(data.id_unidad_base),
      }

      let url = '/api/insumos'
      let method = 'POST'

      if (isEditing) {
        url = `/api/insumos/${insumo.id}`
        method = 'PUT'
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Error al guardar insumo')
      }

      toast.success(isEditing ? 'Insumo actualizado' : 'Insumo creado', {
        description: isEditing
          ? 'Los cambios se guardaron correctamente'
          : 'El nuevo insumo se agregó al inventario',
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input placeholder="Bolsa de celofán" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="codigo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código</FormLabel>
              <FormControl>
                <Input placeholder="INS-001 (opcional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción del insumo..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="id_tipo_insumo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Insumo *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingTipos ? 'Cargando...' : 'Seleccionar...'} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tiposInsumo.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id.toString()}>
                        {tipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="id_unidad_base"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad Base *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingUnidades ? 'Cargando...' : 'Seleccionar...'} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {unidades.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.nombre} ({u.codigo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="stock_actual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Actual</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock_minimo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Mínimo</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="precio_compra_referencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio Compra Ref.</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel>Foto</FormLabel>
          <div className="mt-2">
            <ImageUploaderProducto
              currentImage={insumo?.imagen}
              onUpload={(url) => {
                setImageUrl(url)
                form.setValue('imagen', url)
              }}
              uploadUrl="/api/upload/insumo"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <Label className="text-sm font-normal cursor-pointer">
                  Activo
                </Label>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="submit"
            className="bg-mostaza hover:bg-mostaza/90 text-marron font-semibold"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : isEditing ? (
              'Guardar Cambios'
            ) : (
              'Crear Insumo'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
