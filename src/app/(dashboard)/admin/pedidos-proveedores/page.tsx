'use client'

import { ClipboardList } from 'lucide-react'
import PedidosProveedoresTable from '@/components/admin/PedidosProveedoresTable'

export default function PedidosProveedoresPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-marron/10 p-2">
          <ClipboardList className="h-5 w-5 text-marron" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Pedidos a Proveedores</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los pedidos y seguimiento de entregas
          </p>
        </div>
      </div>

      <PedidosProveedoresTable />
    </div>
  )
}
