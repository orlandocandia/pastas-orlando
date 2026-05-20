'use client'

import { Receipt } from 'lucide-react'
import VentasTable from '@/components/admin/VentasTable'

export default function VentasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-mostaza/10 p-2">
          <Receipt className="h-5 w-5 text-mostaza" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Ventas</h1>
          <p className="text-sm text-muted-foreground">
            Registra y gestiona las ventas a clientes
          </p>
        </div>
      </div>

      <VentasTable />
    </div>
  )
}
