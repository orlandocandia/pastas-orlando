'use client'

import { ArrowLeftRight } from 'lucide-react'
import StockMovementsTable from '@/components/admin/StockMovementsTable'

export default function StockMovementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-oliva/10 p-2">
          <ArrowLeftRight className="h-5 w-5 text-oliva" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Movimientos de Stock</h1>
          <p className="text-sm text-muted-foreground">
            Historial de entradas, salidas y ajustes de inventario
          </p>
        </div>
      </div>

      <StockMovementsTable />
    </div>
  )
}
