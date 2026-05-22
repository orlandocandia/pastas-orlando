'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquarePlus, ChevronLeft, ChevronRight } from 'lucide-react'
import OpinionForm from '@/components/opiniones/OpinionForm'
import OpinionCard from '@/components/opiniones/OpinionCard'

interface Opinion {
  id: number
  nombre: string
  calificacion: number
  comentario: string
  fecha: string
  destacado: boolean
}

const OPINIONES_POR_PAGINA = 4

export default function Opiniones() {
  const [opiniones, setOpiniones] = useState<Opinion[]>([])
  const [loading, setLoading] = useState(true)
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    async function fetchOpiniones() {
      try {
        const res = await fetch('/api/opiniones')
        if (res.ok) {
          const data = await res.json()
          setOpiniones(data)
        }
      } catch {
        console.error('Error al cargar opiniones')
      } finally {
        setLoading(false)
      }
    }
    fetchOpiniones()
  }, [])

  const totalPaginas = Math.ceil(opiniones.length / OPINIONES_POR_PAGINA)
  const mostrarPaginacion = opiniones.length > OPINIONES_POR_PAGINA

  // Reset page si queda fuera de rango
  useEffect(() => {
    if (pagina > totalPaginas && totalPaginas > 0) {
      setPagina(totalPaginas)
    }
  }, [pagina, totalPaginas])

  const paginaEfectiva = Math.min(pagina, Math.max(totalPaginas, 1))
  const opinionesPagina = opiniones.slice(
    (paginaEfectiva - 1) * OPINIONES_POR_PAGINA,
    paginaEfectiva * OPINIONES_POR_PAGINA
  )

  return (
    <section id="opiniones" className="min-h-screen flex flex-col justify-center py-12 sm:py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-marron">
            <span className="text-rojo">Opiniones</span> de nuestros clientes
          </h2>
          <div className="h-1 w-20 bg-mostaza mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Form */}
          <motion.div
            className="lg:col-span-1 h-full"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <OpinionForm />
          </motion.div>

          {/* Opinions Grid + Pagination */}
          <motion.div
            className="lg:col-span-2 h-full flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-crema rounded-xl shadow-md p-5 animate-pulse"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-muted" />
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-muted rounded mb-1" />
                        <div className="h-3 w-20 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-full bg-muted rounded mb-2" />
                    <div className="h-4 w-3/4 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : opiniones.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 h-full">
                <MessageSquarePlus className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground text-lg">
                  Sé el primero en dejar tu opinión
                </p>
              </div>
            ) : (
              <>
                {/* Grid fijo: 2 columnas desktop, 1 mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                  {opinionesPagina.map((opinion) => (
                    <OpinionCard
                      key={opinion.id}
                      nombre={opinion.nombre}
                      calificacion={opinion.calificacion}
                      comentario={opinion.comentario}
                      fecha={opinion.fecha}
                    />
                  ))}
                </div>

                {/* Paginación */}
                {mostrarPaginacion && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setPagina((p) => Math.max(1, p - 1))}
                      disabled={paginaEfectiva === 1}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-mostaza/10 text-marron hover:bg-mostaza/20"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </button>

                    <span className="text-sm text-muted-foreground">
                      Página {paginaEfectiva} de {totalPaginas}
                    </span>

                    <button
                      onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                      disabled={paginaEfectiva === totalPaginas}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-mostaza/10 text-marron hover:bg-mostaza/20"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Indicador cuando no hay paginación */}
                {!mostrarPaginacion && opiniones.length > 0 && (
                  <div className="text-center text-sm text-muted-foreground mt-4">
                    Mostrando {opiniones.length} opinión{opiniones.length !== 1 ? 'es' : ''}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
