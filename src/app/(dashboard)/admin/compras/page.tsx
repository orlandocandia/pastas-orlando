'use client'

import { ShoppingCart } from 'lucide-react'
import ComprasTable from '@/components/admin/ComprasTable'

export default function ComprasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-mostaza/10 p-2">
          <ShoppingCart className="h-5 w-5 text-mostaza" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Compras a Proveedores</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las compras y actualiza el stock automáticamente
          </p>
        </div>
      </div>

      <ComprasTable />
    </div>
  )
}
