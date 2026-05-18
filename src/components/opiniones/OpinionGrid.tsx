'use client'

import OpinionCard from './OpinionCard'

interface Opinion {
  id: number
  nombre: string
  calificacion: number
  comentario: string
  fecha: string
  destacado: boolean
}

interface OpinionGridProps {
  opiniones: Opinion[]
}

export default function OpinionGrid({ opiniones }: OpinionGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {opiniones.map((opinion) => (
        <OpinionCard
          key={opinion.id}
          nombre={opinion.nombre}
          calificacion={opinion.calificacion}
          comentario={opinion.comentario}
          fecha={opinion.fecha}
        />
      ))}
    </div>
  )
}
