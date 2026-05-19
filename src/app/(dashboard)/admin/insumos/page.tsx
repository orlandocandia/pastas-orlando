'use client'

import { PackageOpen } from 'lucide-react'
import InsumosTable from '@/components/admin/InsumosTable'

export default function InsumosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-mostaza/10 p-2">
          <PackageOpen className="h-5 w-5 text-mostaza" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Insumos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los insumos y materiales de empaque
          </p>
        </div>
      </div>

      <InsumosTable />
    </div>
  )
}
