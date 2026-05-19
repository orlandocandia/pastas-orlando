'use client'

import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'
import { registrarAuditoria, AccionAuditoria, ModuloAuditoria } from '@/lib/auditoria-service'

interface ExportadorCSVProps {
  data: Record<string, unknown>[]
  filename: string
  columns?: { key: string; header: string }[]
  modulo?: string
  disabled?: boolean
}

export default function ExportadorCSV({ data, filename, columns, modulo, disabled }: ExportadorCSVProps) {
  const exportToCSV = () => {
    if (!data || data.length === 0) return

    let exportData = data
    if (columns) {
      exportData = data.map(row => {
        const obj: Record<string, unknown> = {}
        for (const col of columns) {
          obj[col.header] = row[col.key]
        }
        return obj
      })
    }

    const headers = Object.keys(exportData[0])
    const csvContent = [
      headers.join(','),
      ...exportData.map(row =>
        headers.map(h => {
          const val = String(row[h] ?? '')
          return val.includes(',') ? `"${val}"` : val
        }).join(',')
      ),
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.csv`
    link.click()
    URL.revokeObjectURL(link.href)

    // Registrar auditoría
    registrarAuditoria({
      accion: AccionAuditoria.EXPORT,
      modulo: (modulo as ModuloAuditoria) || ModuloAuditoria.REPORTES,
      detalles: { filename, format: 'csv', rows: data.length },
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={exportToCSV}
      disabled={disabled || !data || data.length === 0}
      className="gap-1.5 border-mostaza/30 text-mostaza hover:bg-mostaza/10"
    >
      <FileDown className="h-4 w-4" />
      CSV
    </Button>
  )
}
