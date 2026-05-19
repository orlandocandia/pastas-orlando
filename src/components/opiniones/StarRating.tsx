'use client'

import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  size?: number
  interactive?: boolean
  onChange?: (rating: number) => void
}

export default function StarRating({
  rating,
  size = 18,
  interactive = false,
  onChange,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`${
            interactive
              ? 'cursor-pointer hover:scale-110 transition-transform'
              : 'cursor-default'
          }`}
          aria-label={`${star} estrellas`}
        >
          <Star
            size={size}
            className={
              star <= rating
                ? 'fill-mostaza text-mostaza'
                : 'fill-none text-muted-foreground/40'
            }
          />
        </button>
      ))}
    </div>
  )
}
