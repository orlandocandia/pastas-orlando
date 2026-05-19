'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import ProductCard from '@/components/products/ProductCard'
import ProductGridSkeleton from '@/components/skeletons/ProductGridSkeleton'

interface ProductoPublico {
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
  const [productos, setProductos] = useState<ProductoPublico[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    async function fetchProductos() {
      try {
        const res = await fetch('/api/productos-terminados/public')
        if (res.ok) {
          const data = await res.json()
          setProductos(data.productos || [])
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
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-sm sm:text-base">
            Pastas artesanales elaboradas con ingredientes frescos y de calidad. Stock en tiempo real.
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <ProductGridSkeleton />
        ) : productos.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block">🍝</span>
            <p className="text-muted-foreground">
              Próximamente más productos disponibles
            </p>
          </div>
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
                <motion.div key={producto.id} variants={cardVariants}>
                  <ProductCard producto={producto} />
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
                  Ver más productos
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
