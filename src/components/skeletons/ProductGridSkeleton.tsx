import { Skeleton } from '@/components/ui/skeleton'

export default function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card overflow-hidden"
        >
          {/* Image skeleton */}
          <Skeleton className="h-48 w-full rounded-none" />
          <div className="p-4 space-y-3">
            {/* Badge + Category */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            {/* Name */}
            <Skeleton className="h-5 w-3/4" />
            {/* Description */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            {/* Price + Button */}
            <div className="flex items-center justify-between pt-1">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
