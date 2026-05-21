'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import type { CarouselApi } from '@/components/ui/carousel'
import OpinionCard from './OpinionCard'

interface Opinion {
  id: number
  nombre: string
  calificacion: number
  comentario: string
  fecha: string
  destacado: boolean
}

interface OpinionCarouselProps {
  opiniones: Opinion[]
}

export default function OpinionCarousel({ opiniones }: OpinionCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const initialized = useRef(false)

  useEffect(() => {
    if (!api) return

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap())
      setCount(api.scrollSnapList().length)
    }

    api.on('select', handleSelect)
    api.on('reInit', handleSelect)

    if (!initialized.current) {
      initialized.current = true
      queueMicrotask(() => {
        handleSelect()
      })
    }

    return () => {
      api.off('select', handleSelect)
      api.off('reInit', handleSelect)
    }
  }, [api])

  // Autoplay
  useEffect(() => {
    if (!api) return
    const interval = setInterval(() => {
      api.scrollNext()
    }, 6000)
    return () => clearInterval(interval)
  }, [api])

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
      {/* Flecha izquierda — fuera del contenedor */}
      <button
        onClick={() => api?.scrollPrev()}
        className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-mostaza hover:bg-mostaza hover:text-white transition-colors flex-shrink-0 order-1 sm:order-1"
        aria-label="Opinión anterior"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      {/* Contenedor del carrusel */}
      <div className="flex-1 w-full order-2">
        <Carousel
          setApi={setApi}
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {opiniones.map((opinion) => (
              <CarouselItem key={opinion.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <OpinionCard
                  nombre={opinion.nombre}
                  calificacion={opinion.calificacion}
                  comentario={opinion.comentario}
                  fecha={opinion.fecha}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === current
                  ? 'bg-mostaza w-6'
                  : 'bg-muted-foreground/30 w-2.5 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Ir a opinión ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Flecha derecha — fuera del contenedor */}
      <button
        onClick={() => api?.scrollNext()}
        className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-mostaza hover:bg-mostaza hover:text-white transition-colors flex-shrink-0 order-3"
        aria-label="Siguiente opinión"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  )
}
