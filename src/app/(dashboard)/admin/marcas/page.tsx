'use client'

import { Tag } from 'lucide-react'
import MarcasManager from '@/components/admin/MarcasManager'

export default function MarcasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-oliva/10 p-2">
          <Tag className="h-5 w-5 text-oliva" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Marcas</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las marcas de productos y materias primas
          </p>
        </div>
      </div>

      <MarcasManager />
    </div>
  )
}
