'use client'

import { CalendarCheck } from 'lucide-react'
import ReservasClientesTable from '@/components/admin/ReservasClientesTable'

export default function ReservasClientesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-mostaza/10 p-2">
          <CalendarCheck className="h-5 w-5 text-mostaza" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Reservas de Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las reservas de productos para clientes
          </p>
        </div>
      </div>

      <ReservasClientesTable />
    </div>
  )
}
