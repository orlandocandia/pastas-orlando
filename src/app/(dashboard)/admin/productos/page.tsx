'use client'

import { Package } from 'lucide-react'
import ProductosTable from '@/components/admin/ProductosTable'

export default function ProductosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-mostaza/10 p-2">
          <Package className="h-5 w-5 text-mostaza" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Productos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona el catálogo de pastas artesanales
          </p>
        </div>
      </div>

      <ProductosTable />
    </div>
  )
}
