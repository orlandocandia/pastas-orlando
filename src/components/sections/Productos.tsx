'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { PackageOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProductCard from '@/components/products/ProductCard'

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

const PRODUCTOS_POR_PAGINA = 6

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
  const [error, setError] = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState<string>('Todos')
  const [productosMostrados, setProductosMostrados] = useState(PRODUCTOS_POR_PAGINA)

  useEffect(() => {
    async function fetchProductos() {
      try {
        setError('')
        const res = await fetch('/api/productos-terminados/public')
        if (res.ok) {
          const data = await res.json()
          setProductos(data.productos || [])
        } else {
          setError('No se pudieron cargar los productos. Intentá más tarde.')
        }
      } catch {
        setError('Error de conexión. Verificá tu internet e intentá de nuevo.')
      } finally {
        setLoading(false)
      }
    }
    fetchProductos()
  }, [])

  // Extraer categorías únicas desde los productos
  const categorias = useMemo(() => {
    const cats = [...new Set(productos.map((p) => p.categoria.nombre))]
    cats.sort()
    return ['Todos', ...cats]
  }, [productos])

  // Filtrar productos por categoría
  const productosFiltrados = useMemo(() => {
    if (categoriaActiva === 'Todos') return productos
    return productos.filter((p) => p.categoria.nombre === categoriaActiva)
  }, [productos, categoriaActiva])

  const productosVisible = productosFiltrados.slice(0, productosMostrados)
  const hayMas = productosVisible.length < productosFiltrados.length

  // Cambiar categoría → reset paginación
  const handleCategoriaChange = (cat: string) => {
    setCategoriaActiva(cat)
    setProductosMostrados(PRODUCTOS_POR_PAGINA)
  }

  return (
    <section id="productos" className="min-h-screen flex flex-col justify-center py-12 sm:py-16 md:py-20 bg-crema">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Title */}
        <div className="text-center mb-10">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-16 bg-muted rounded" />
                  <div className="h-5 w-3/4 bg-muted rounded" />
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="flex justify-between items-center mt-2">
                    <div className="h-6 w-20 bg-muted rounded" />
                    <div className="h-8 w-24 bg-muted rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block">⚠️</span>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => {
                setLoading(true)
                setError('')
                fetch('/api/productos-terminados/public')
                  .then((res) => res.json())
                  .then((data) => {
                    setProductos(data.productos || [])
                  })
                  .catch(() => setError('Error de conexión.'))
                  .finally(() => setLoading(false))
              }}
              className="border-mostaza text-marron hover:bg-mostaza hover:text-marron"
            >
              Reintentar
            </Button>
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-12">
            <PackageOpen className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground text-lg mb-2">
              No hay productos disponibles
            </p>
            <p className="text-muted-foreground text-sm">
              Próximamente más productos disponibles
            </p>
          </div>
        ) : (
          <>
            {/* Tabs de categorías */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoriaChange(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    categoriaActiva === cat
                      ? 'bg-mostaza text-marron shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Título de categoría activa */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-marron">
                {categoriaActiva === 'Todos' ? 'Todos los productos' : categoriaActiva}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Mostrando {productosVisible.length} de {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Product Grid */}
            {productosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <PackageOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">
                  Próximamente más variedades
                </p>
              </div>
            ) : (
              <motion.div
                key={categoriaActiva}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {productosVisible.map((producto) => (
                  <motion.div key={producto.id} variants={cardVariants}>
                    <ProductCard producto={producto} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Ver más productos */}
            {hayMas && (
              <div className="text-center mt-8">
                <Button
                  onClick={() => setProductosMostrados((prev) => prev + PRODUCTOS_POR_PAGINA)}
                  className="bg-mostaza text-marron hover:bg-mostaza/80 font-semibold px-8 rounded-full"
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
