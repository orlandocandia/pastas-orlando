'use client'

import { ClipboardList } from 'lucide-react'
import PedidosClientesTable from '@/components/admin/PedidosClientesTable'

export default function PedidosClientesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-mostaza/10 p-2">
          <ClipboardList className="h-5 w-5 text-mostaza" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Pedidos de Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los pedidos realizados por los clientes
          </p>
        </div>
      </div>

      <PedidosClientesTable />
    </div>
  )
}
