'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ProductGridSkeleton from '@/components/skeletons/ProductGridSkeleton'

interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  categoria: string
  precio: number
  peso: string
  imagen: string | null
  stock: boolean
  destacado: boolean
  orden: number
}

const priceFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    async function fetchProductos() {
      try {
        const res = await fetch('/api/productos?stock=true')
        if (res.ok) {
          const data = await res.json()
          setProductos(data)
        }
      } catch {
        console.error('Error al cargar productos')
      } finally {
        setLoading(false)
      }
    }
    fetchProductos()
  }, [])

  const displayed = showAll ? productos : productos.slice(0, 8)
  const hasMore = productos.length > 8

  return (
    <section id="productos" className="py-16 sm:py-20 bg-crema">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-marron">
            Nuestros <span className="text-rojo">Productos</span>
          </h2>
          <div className="h-1 w-20 bg-mostaza mx-auto mt-4 rounded-full" />
        </div>

        {/* Loading */}
        {loading ? (
          <ProductGridSkeleton />
        ) : (
          <>
            {/* Product Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              {displayed.map((producto) => (
                <motion.div
                  key={producto.id}
                  variants={cardVariants}
                  className="group rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {producto.imagen ? (
                      <Image
                        src={producto.imagen}
                        alt={producto.nombre}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
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
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-mostaza/20 text-marron text-xs hover:bg-mostaza/30 border-0">
                        {producto.peso}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {producto.categoria}
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
                    <p className="text-mostaza font-bold text-lg">
                      {priceFormatter.format(producto.precio)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Show More Button */}
            {hasMore && !showAll && (
              <div className="text-center mt-10">
                <Button
                  onClick={() => setShowAll(true)}
                  variant="outline"
                  className="border-mostaza text-marron hover:bg-mostaza hover:text-marron font-semibold px-8"
                >
                  Ver más
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
