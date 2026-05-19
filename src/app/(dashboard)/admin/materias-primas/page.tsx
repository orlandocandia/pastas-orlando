'use client'

import { Leaf } from 'lucide-react'
import MateriasPrimasTable from '@/components/admin/MateriasPrimasTable'

export default function MateriasPrimasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-oliva/10 p-2">
          <Leaf className="h-5 w-5 text-oliva" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Materias Primas</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las materias primas e insumos de producción
          </p>
        </div>
      </div>

      <MateriasPrimasTable />
    </div>
  )
}
