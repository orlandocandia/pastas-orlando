'use client'

import StarRating from './StarRating'

interface OpinionCardProps {
  nombre: string
  calificacion: number
  comentario: string
  fecha: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
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
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar por iniciales */}
        <div className="w-10 h-10 rounded-full bg-mostaza flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {getInitials(nombre)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-marron truncate">{nombre}</p>
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
