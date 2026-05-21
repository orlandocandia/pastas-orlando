'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
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

    // Initialize on first render via microtask to avoid synchronous setState in effect
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
    <div className="relative max-w-5xl mx-auto pl-4 md:pl-8">
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
        <CarouselPrevious className="hidden sm:flex left-2 bg-mostaza text-marron border-mostaza hover:bg-mostaza/90" />
        <CarouselNext className="hidden sm:flex right-2 bg-mostaza text-marron border-mostaza hover:bg-mostaza/90" />
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
  )
}
