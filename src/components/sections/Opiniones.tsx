'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MessageSquarePlus, ChevronUp, ChevronDown } from 'lucide-react'
import OpinionForm from '@/components/opiniones/OpinionForm'
import StarRating from '@/components/opiniones/StarRating'

interface Opinion {
  id: number
  nombre: string
  calificacion: number
  comentario: string
  fecha: string
  destacado: boolean
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function Opiniones() {
  const [opiniones, setOpiniones] = useState<Opinion[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

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

  const total = opiniones.length

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total)
  }, [total])

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total)
  }, [total])

  // Auto-avanzar cada 6 segundos
  useEffect(() => {
    if (total <= 1) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [total, next])

  // Reset index si se eliminan opiniones
  useEffect(() => {
    if (currentIndex >= total && total > 0) {
      setCurrentIndex(total - 1)
    }
  }, [currentIndex, total])

  const currentOpinion = opiniones[currentIndex]

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

          {/* Vertical Carousel */}
          <motion.div
            className="lg:col-span-2 h-full flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="bg-crema rounded-xl shadow-md p-8 w-full max-w-md animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-muted" />
                    <div className="flex-1">
                      <div className="h-5 w-28 bg-muted rounded mb-2" />
                      <div className="h-3 w-20 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-full bg-muted rounded mb-2" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </div>
              </div>
            ) : opiniones.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 h-full">
                <MessageSquarePlus className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground text-lg">
                  Sé el primero en dejar tu opinión
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Flecha arriba */}
                <button
                  onClick={prev}
                  className="self-center p-2 rounded-full text-mostaza hover:bg-mostaza/10 transition-colors disabled:opacity-30"
                  disabled={total <= 1}
                  aria-label="Opinión anterior"
                >
                  <ChevronUp className="h-6 w-6" />
                </button>

                {/* Área del carrusel */}
                <div className="relative flex-1 min-h-[300px] overflow-hidden my-2">
                  <div
                    className="flex flex-col transition-transform duration-500 ease-in-out h-full"
                    style={{ transform: `translateY(-${currentIndex * 100}%)` }}
                  >
                    {opiniones.map((opinion) => (
                      <div
                        key={opinion.id}
                        className="h-full flex-shrink-0 flex items-center justify-center p-2"
                      >
                        <div className="bg-crema rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 sm:p-8 w-full max-w-lg mx-auto">
                          {/* Avatar + Nombre + Estrellas */}
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-mostaza flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                              {getInitials(opinion.nombre)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-marron text-lg truncate">{opinion.nombre}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(opinion.fecha).toLocaleDateString('es-AR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <StarRating rating={opinion.calificacion} size={20} />
                          </div>

                          {/* Comentario */}
                          <p className="text-muted-foreground text-base leading-relaxed">
                            &ldquo;{opinion.comentario}&rdquo;
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flecha abajo */}
                <button
                  onClick={next}
                  className="self-center p-2 rounded-full text-mostaza hover:bg-mostaza/10 transition-colors disabled:opacity-30"
                  disabled={total <= 1}
                  aria-label="Opinión siguiente"
                >
                  <ChevronDown className="h-6 w-6" />
                </button>

                {/* Indicadores de página (puntos) */}
                {total > 1 && (
                  <div className="flex justify-center gap-2 mt-3">
                    {opiniones.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          currentIndex === idx
                            ? 'w-6 bg-mostaza'
                            : 'w-2 bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Ir a opinión ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Contador */}
                {total > 1 && (
                  <p className="text-center text-xs text-muted-foreground mt-2">
                    {currentIndex + 1} de {total} opiniones
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
