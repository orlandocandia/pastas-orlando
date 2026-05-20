'use client'

import { Factory } from 'lucide-react'
import ProduccionTable from '@/components/admin/ProduccionTable'

export default function ProduccionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-mostaza/10 p-2">
          <Factory className="h-5 w-5 text-mostaza" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Producción</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona la producción de pastas y consumo de stock
          </p>
        </div>
      </div>

      <ProduccionTable />
    </div>
  )
}
