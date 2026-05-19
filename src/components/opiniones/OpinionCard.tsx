'use client'

import StarRating from './StarRating'

interface OpinionCardProps {
  nombre: string
  calificacion: number
  comentario: string
  fecha: string
}

export default function OpinionCard({
  nombre,
  calificacion,
  comentario,
  fecha,
}: OpinionCardProps) {
  const formattedDate = new Date(fecha).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-bold text-marron">{nombre}</p>
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </div>
        <StarRating rating={calificacion} size={16} />
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed">
        &ldquo;{comentario}&rdquo;
      </p>
    </div>
  )
}
