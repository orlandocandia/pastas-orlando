'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageCircle, Package } from 'lucide-react'

interface ProductCardProps {
  producto: {
    id: number
    nombre: string
    descripcion: string | null
    precio_venta: number
    peso_unitario_aprox: number
    imagen: string | null
    stock_actual: number
    destacado: boolean
    tipo_harina?: string | null
    categoria: {
      id: number
      nombre: string
    }
  }
}

const priceFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

export default function ProductCard({ producto }: ProductCardProps) {
  const sinStock = producto.stock_actual <= 0

  const whatsappMessage = encodeURIComponent(
    `Hola Orlando, quiero consultar por ${producto.nombre}`
  )
  const whatsappUrl = `https://wa.me/5493754419324?text=${whatsappMessage}`

  const formatPeso = (kg: number) => {
    if (kg >= 1) return `${kg} kg`
    return `${Math.round(kg * 1000)}g`
  }

  return (
    <div
      className={`group rounded-xl border border-border bg-card overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-mostaza/40 transition-all duration-300 ${
        sinStock ? 'opacity-80' : ''
      }`}
    >
      {/* Image — overflow-hidden for zoom containment */}
      <div className="relative h-48 bg-muted overflow-hidden">
        {producto.imagen ? (
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill
            className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
              sinStock ? 'grayscale-[50%]' : ''
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Package className="h-12 w-12 text-mostaza/40" strokeWidth={1.2} />
          </div>
        )}

        {/* SIN STOCK overlay */}
        {sinStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <Badge className="bg-rojo text-white text-xs font-bold px-3 py-1 shadow-md border-0">
              SIN STOCK
            </Badge>
          </div>
        )}

        {/* Destacado Badge */}
        {producto.destacado && !sinStock && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-mostaza text-marron text-xs font-bold px-3 py-1 shadow-md border-0">
              ⭐ Destacado
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-mostaza/20 text-marron text-xs hover:bg-mostaza/30 border-0">
            {formatPeso(producto.peso_unitario_aprox)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {producto.categoria?.nombre}
          </span>
          {producto.tipo_harina && (
            <Badge
              className={`
                text-xs border-0
                ${producto.tipo_harina === 'sin_gluten'
                  ? 'bg-oliva/15 text-oliva'
                  : producto.tipo_harina === 'integral'
                  ? 'bg-mostaza/15 text-mostaza'
                  : 'bg-marron/8 text-marron/60'
                }
              `}
            >
              {producto.tipo_harina === 'con_gluten'
                ? 'Con Gluten'
                : producto.tipo_harina === 'integral'
                ? 'Integral'
                : 'Sin Gluten'}
            </Badge>
          )}
        </div>
        <h3 className="font-bold text-marron text-base mb-1 line-clamp-1">
          {producto.nombre}
        </h3>
        {producto.descripcion && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
            {producto.descripcion}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <p className="text-mostaza font-bold text-lg">
            {priceFormatter.format(producto.precio_venta)}
          </p>
          {sinStock ? (
            <span className="text-xs text-muted-foreground italic">
              No disponible
            </span>
          ) : (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="sm"
                className="bg-whatsapp hover:bg-[#1DA851] text-white font-semibold gap-1.5 transition-colors duration-300"
              >
                <MessageCircle className="h-4 w-4" />
                Consultar
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
