'use client'

import { Ruler } from 'lucide-react'
import UnidadesMedidaManager from '@/components/admin/UnidadesMedidaManager'

export default function UnidadesMedidaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-marron/10 p-2">
          <Ruler className="h-5 w-5 text-marron" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Unidades de Medida</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las unidades de medida para stock y producción
          </p>
        </div>
      </div>

      <UnidadesMedidaManager />
    </div>
  )
}
