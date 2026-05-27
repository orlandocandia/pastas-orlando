'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, Check, ChevronsUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

interface Cliente {
  id: number
  nombre: string
  apellido: string
  razon_social: string | null
}

interface EstadoGeneral {
  id: number
  nombre_estado: string
  entidad_aplicable: string | null
}

interface ProductoTerminado {
  id: number
  nombre: string
  precio_venta: number
}

interface ReservaClienteFormProps {
  reserva?: any | null
  onSuccess: () => void
  onCancel: () => void
}

export default function ReservaClienteForm({ reserva, onSuccess, onCancel }: ReservaClienteFormProps) {
  const isEditing = !!reserva

  // Form fields
  const [idCliente, setIdCliente] = useState('')
  const [idProductoTerminado, setIdProductoTerminado] = useState('')
  const [cantidadReservada, setCantidadReservada] = useState('')
  const [fechaValidezHasta, setFechaValidezHasta] = useState('')
  const [senia, setSenia] = useState('')
  const [idEstado, setIdEstado] = useState('')
  const [cantidadConfirmada, setCantidadConfirmada] = useState('')
  const [observaciones, setObservaciones] = useState('')

  // Data
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [estados, setEstados] = useState<EstadoGeneral[]>([])
  const [productosTerminados, setProductosTerminados] = useState<ProductoTerminado[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  // Combobox open states
  const [clienteOpen, setClienteOpen] = useState(false)

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        const [cliRes, estRes, ptRes] = await Promise.all([
          fetch('/api/personas?tipo=cliente&limite=100'),
          fetch('/api/estados-generales?entidad_aplicable=reserva_cliente'),
          fetch('/api/productos-terminados?limite=200&estado=true'),
        ])

        const cliData = await cliRes.json()
        const estData = await estRes.json()
        const ptData = await ptRes.json()

        setClientes(cliData.personas || [])
        setEstados(Array.isArray(estData) ? estData : [])
        setProductosTerminados(
          (ptData.data || []).map((pt: any) => ({
            id: pt.id,
            nombre: pt.nombre,
            precio_venta: pt.precio_venta,
          }))
        )
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
    if (reserva) {
      setIdCliente(reserva.id_cliente?.toString() || '')
      setIdProductoTerminado(reserva.id_producto_terminado?.toString() || '')
      setCantidadReservada(reserva.cantidad_reservada?.toString() || '')
      setFechaValidezHasta(
        reserva.fecha_validez_hasta ? reserva.fecha_validez_hasta.split('T')[0] : ''
      )
      setSenia(reserva.senia?.toString() || '')
      setIdEstado(reserva.id_estado?.toString() || '')
      setCantidadConfirmada(reserva.cantidad_confirmada?.toString() || '')
      setObservaciones(reserva.observaciones || '')
    }
  }, [reserva])

  // Submit
  const handleSubmit = async () => {
    // Validation
    if (!isEditing) {
      if (!idCliente) {
        toast.error('Seleccioná un cliente')
        return
      }
      if (!idProductoTerminado) {
        toast.error('Seleccioná un producto terminado')
        return
      }
      if (!cantidadReservada || parseFloat(cantidadReservada) <= 0) {
        toast.error('Ingresá una cantidad reservada válida')
        return
      }
      if (!fechaValidezHasta) {
        toast.error('Ingresá la fecha de validez')
        return
      }
    }

    setSubmitting(true)
    try {
      const payload = isEditing
        ? {
            id: reserva.id,
            id_estado: idEstado ? parseInt(idEstado) : undefined,
            cantidad_confirmada: cantidadConfirmada ? parseFloat(cantidadConfirmada) : 0,
            observaciones: observaciones.trim() || null,
          }
        : {
            id_cliente: parseInt(idCliente),
            id_producto_terminado: parseInt(idProductoTerminado),
            cantidad_reservada: parseFloat(cantidadReservada),
            fecha_validez_hasta: fechaValidezHasta,
            senia: senia ? parseFloat(senia) : 0,
            observaciones: observaciones.trim() || null,
          }

      const url = isEditing ? `/api/reservas-clientes/${reserva.id}` : '/api/reservas-clientes'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Error al guardar reserva')
      }

      toast.success(isEditing ? 'Reserva actualizada' : 'Reserva registrada', {
        description: isEditing
          ? 'Los cambios se guardaron correctamente'
          : 'La nueva reserva se registró exitosamente',
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
            Reserva #{reserva.id} — Cliente: {reserva.cliente?.razon_social || `${reserva.cliente?.nombre} ${reserva.cliente?.apellido}`} — Producto: {reserva.productoTerminado?.nombre}
          </p>
        </div>
      )}

      {/* Main fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Cliente - searchable combobox */}
        <div>
          <Label className="text-sm font-medium text-marron mb-1 block">Cliente *</Label>
          {isEditing ? (
            <Input
              value={reserva.cliente?.razon_social || `${reserva.cliente?.nombre} ${reserva.cliente?.apellido}`}
              disabled
              className="bg-muted/50"
            />
          ) : (
            <Popover open={clienteOpen} onOpenChange={setClienteOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={clienteOpen}
                  className={cn(
                    'w-full justify-between',
                    !idCliente && 'text-muted-foreground'
                  )}
                >
                  {idCliente
                    ? (() => {
                        const cli = clientes.find((c) => c.id.toString() === idCliente)
                        return cli?.razon_social || `${cli?.nombre} ${cli?.apellido}` || 'Seleccionar...'
                      })()
                    : 'Buscar cliente...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar cliente..." />
                  <CommandList>
                    <CommandEmpty>No se encontró cliente</CommandEmpty>
                    <CommandGroup>
                      {clientes.map((cli) => (
                        <CommandItem
                          key={cli.id}
                          value={cli.razon_social || `${cli.nombre} ${cli.apellido}`}
                          onSelect={() => {
                            setIdCliente(cli.id.toString())
                            setClienteOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              idCliente === cli.id.toString() ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {cli.razon_social || `${cli.nombre} ${cli.apellido}`}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Producto Terminado */}
        <div>
          <Label className="text-sm font-medium text-marron mb-1 block">Producto Terminado *</Label>
          {isEditing ? (
            <Input
              value={reserva.productoTerminado?.nombre || ''}
              disabled
              className="bg-muted/50"
            />
          ) : (
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
          )}
        </div>

        {/* Cantidad Reservada */}
        <div>
          <Label className="text-sm font-medium text-marron mb-1 block">Cantidad Reservada *</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0"
            value={cantidadReservada}
            onChange={(e) => setCantidadReservada(e.target.value)}
            disabled={isEditing}
          />
        </div>

        {/* Fecha Validez Hasta */}
        <div>
          <Label className="text-sm font-medium text-marron mb-1 block">Válida Hasta *</Label>
          <Input
            type="date"
            value={fechaValidezHasta}
            onChange={(e) => setFechaValidezHasta(e.target.value)}
            disabled={isEditing}
          />
        </div>

        {/* Seña */}
        <div>
          <Label className="text-sm font-medium text-marron mb-1 block">Seña</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={senia}
            onChange={(e) => setSenia(e.target.value)}
            disabled={isEditing}
          />
        </div>

        {/* Estado (only in edit mode) */}
        {isEditing && (
          <div>
            <Label className="text-sm font-medium text-marron mb-1 block">Estado</Label>
            <Select value={idEstado} onValueChange={setIdEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {estados.map((est) => (
                  <SelectItem key={est.id} value={est.id.toString()}>
                    {est.nombre_estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Cantidad Confirmada (only in edit mode) */}
        {isEditing && (
          <div>
            <Label className="text-sm font-medium text-marron mb-1 block">Cantidad Confirmada</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              value={cantidadConfirmada}
              onChange={(e) => setCantidadConfirmada(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Observaciones */}
      <div>
        <Label className="text-sm font-medium text-marron mb-1 block">Observaciones</Label>
        <Textarea
          placeholder="Observaciones sobre la reserva..."
          className="resize-none"
          rows={2}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
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
            'Registrar Reserva'
          )}
        </Button>
      </div>
    </div>
  )
}
