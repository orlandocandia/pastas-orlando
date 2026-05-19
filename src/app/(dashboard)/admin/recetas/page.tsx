'use client'

import { BookOpen } from 'lucide-react'
import RecetasTable from '@/components/admin/RecetasTable'

export default function RecetasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-mostaza/10 p-2">
          <BookOpen className="h-5 w-5 text-mostaza" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Recetas</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las recetas de producción
          </p>
        </div>
      </div>

      <RecetasTable />
    </div>
  )
}
