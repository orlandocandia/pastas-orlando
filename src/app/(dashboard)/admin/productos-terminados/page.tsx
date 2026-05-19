'use client'

import { UtensilsCrossed } from 'lucide-react'
import ProductosTerminadosTable from '@/components/admin/ProductosTerminadosTable'

export default function ProductosTerminadosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-rojo/10 p-2">
          <UtensilsCrossed className="h-5 w-5 text-rojo" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Productos Terminados</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los productos terminados para producción y ventas
          </p>
        </div>
      </div>

      <ProductosTerminadosTable />
    </div>
  )
}
