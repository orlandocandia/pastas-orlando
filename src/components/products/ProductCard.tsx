'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

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
    `¡Hola! Me interesa consultar por ${producto.nombre}. ¿Tienen disponibilidad?`
  )
  const whatsappUrl = `https://wa.me/5493754419324?text=${whatsappMessage}`

  const formatPeso = (kg: number) => {
    if (kg >= 1) return `${kg} kg`
    return `${Math.round(kg * 1000)}g`
  }

  return (
    <div
      className={`group rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 ${
        sinStock ? 'opacity-80' : ''
      }`}
    >
      {/* Image */}
      <div className="relative h-48 bg-muted overflow-hidden">
        {producto.imagen ? (
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill
            className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
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
            <span className="text-4xl">🍝</span>
          </div>
        )}
        {/* Fallback overlay */}
        {!producto.imagen && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-5xl">🍝</span>
          </div>
        )}

        {/* SIN STOCK Badge */}
        {sinStock && (
          <div className="absolute top-3 right-3 z-10">
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
                className="bg-whatsapp hover:bg-whatsapp/90 text-white font-semibold gap-1.5"
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
