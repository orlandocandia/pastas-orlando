'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquarePlus } from 'lucide-react'
import OpinionForm from '@/components/opiniones/OpinionForm'
import OpinionGrid from '@/components/opiniones/OpinionGrid'
import OpinionCarousel from '@/components/opiniones/OpinionCarousel'

interface Opinion {
  id: number
  nombre: string
  calificacion: number
  comentario: string
  fecha: string
  destacado: boolean
}

export default function Opiniones() {
  const [opiniones, setOpiniones] = useState<Opinion[]>([])
  const [loading, setLoading] = useState(true)

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

          {/* Opinions Display */}
          <motion.div
            className="lg:col-span-2 h-full flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex-grow">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-crema rounded-xl shadow-md p-5 animate-pulse"
                    >
                      <div className="h-5 w-32 bg-muted rounded mb-2" />
                      <div className="h-4 w-24 bg-muted rounded mb-3" />
                      <div className="h-4 w-full bg-muted rounded" />
                    </div>
                  ))}
                </div>
              ) : opiniones.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <MessageSquarePlus className="h-12 w-12 text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground text-lg">
                    Sé el primero en dejar tu opinión
                  </p>
                </div>
              ) : opiniones.length <= 3 ? (
                <OpinionGrid opiniones={opiniones} />
              ) : (
                <OpinionCarousel opiniones={opiniones} />
              )}
            </div>

            {/* Texto al pie: pegado al fondo */}
            {opiniones.length > 0 && (
              <div className="text-center text-gray-400 text-sm pt-4 border-t border-gray-100 mt-4">
                ✨ Compartí tu experiencia
              </div>
            )}
          </motion.div>
        </div>

        {/* Enlace a FAQ — solo si hay opiniones */}
        {opiniones.length > 0 && (
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <a
              href="#faq"
              className="inline-flex items-center gap-1.5 text-mostaza hover:text-yellow-700 font-medium transition-colors text-sm sm:text-base"
            >
              📖 Tenés más dudas? Mirá nuestras Preguntas Frecuentes
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
