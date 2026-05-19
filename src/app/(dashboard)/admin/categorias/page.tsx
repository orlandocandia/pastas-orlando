'use client'

import { FolderTree } from 'lucide-react'
import CategoriasManager from '@/components/admin/CategoriasManager'

export default function CategoriasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-mostaza/10 p-2">
          <FolderTree className="h-5 w-5 text-mostaza" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Categorías</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las categorías de materias primas, productos terminados e insumos
          </p>
        </div>
      </div>

      <CategoriasManager />
    </div>
  )
}
