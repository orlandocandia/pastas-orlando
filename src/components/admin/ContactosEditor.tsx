'use client'

import { Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export interface ContactoInput {
  id_tipo_contacto: number
  valor: string
  es_principal: boolean
}

interface TipoContacto {
  id: number
  nombre: string
}

interface ContactosEditorProps {
  contactos: ContactoInput[]
  onChange: (contactos: ContactoInput[]) => void
  tiposContacto: TipoContacto[]
}

export default function ContactosEditor({ contactos, onChange, tiposContacto }: ContactosEditorProps) {
  const addContacto = () => {
    const firstTipoId = tiposContacto[0]?.id || 0
    onChange([
      ...contactos,
      {
        id_tipo_contacto: firstTipoId,
        valor: '',
        es_principal: contactos.length === 0,
      },
    ])
  }

  const removeContacto = (index: number) => {
    const updated = contactos.filter((_, i) => i !== index)
    // Si eliminamos el principal y quedan contactos, marcar el primero como principal
    if (contactos[index].es_principal && updated.length > 0) {
      updated[0] = { ...updated[0], es_principal: true }
    }
    onChange(updated)
  }

  const updateContacto = (index: number, field: keyof ContactoInput, value: unknown) => {
    const updated = [...contactos]
    updated[index] = { ...updated[index], [field]: value }

    // Si se marca uno como principal, desmarcar los demás
    if (field === 'es_principal' && value === true) {
      updated.forEach((c, i) => {
        if (i !== index) {
          updated[i] = { ...updated[i], es_principal: false }
        }
      })
    }

    onChange(updated)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-marron">Contactos</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addContacto}
          className="border-mostaza/30 text-mostaza hover:bg-mostaza/10"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Agregar contacto
        </Button>
      </div>

      {contactos.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          No hay contactos cargados. Agregá al menos uno.
        </p>
      )}

      <div className="space-y-2">
        {contactos.map((contacto, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 rounded-lg border border-marron/10 bg-crema/50"
          >
            <Select
              value={contacto.id_tipo_contacto ? String(contacto.id_tipo_contacto) : ''}
              onValueChange={(val) => updateContacto(index, 'id_tipo_contacto', parseInt(val))}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposContacto.map((tipo) => (
                  <SelectItem key={tipo.id} value={String(tipo.id)}>
                    {tipo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Valor (teléfono, email, etc.)"
              value={contacto.valor}
              onChange={(e) => updateContacto(index, 'valor', e.target.value)}
              className="flex-1"
            />

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex items-center gap-1.5">
                <Checkbox
                  id={`principal-${index}`}
                  checked={contacto.es_principal}
                  onCheckedChange={(checked) =>
                    updateContacto(index, 'es_principal', checked === true)
                  }
                />
                <Label
                  htmlFor={`principal-${index}`}
                  className="text-xs text-muted-foreground cursor-pointer whitespace-nowrap"
                >
                  Principal
                </Label>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-rojo/10"
                onClick={() => removeContacto(index)}
              >
                <Trash2 className="h-3.5 w-3.5 text-rojo" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
