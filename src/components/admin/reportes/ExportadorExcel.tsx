'use client'

import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet } from 'lucide-react'
import { registrarAuditoria, AccionAuditoria, ModuloAuditoria } from '@/lib/auditoria-service'

interface ExportadorExcelProps {
  data: Record<string, unknown>[]
  filename: string
  columns?: { key: string; header: string }[]
  modulo?: string
  disabled?: boolean
}

export default function ExportadorExcel({ data, filename, columns, modulo, disabled }: ExportadorExcelProps) {
  const exportToExcel = () => {
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

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, filename.substring(0, 31))
    XLSX.writeFile(wb, `${filename}.xlsx`)

    // Registrar auditoría
    registrarAuditoria({
      accion: AccionAuditoria.EXPORT,
      modulo: (modulo as ModuloAuditoria) || ModuloAuditoria.REPORTES,
      detalles: { filename, format: 'excel', rows: data.length },
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={exportToExcel}
      disabled={disabled || !data || data.length === 0}
      className="gap-1.5 border-oliva/30 text-oliva hover:bg-oliva/10"
    >
      <FileSpreadsheet className="h-4 w-4" />
      Excel
    </Button>
  )
}
