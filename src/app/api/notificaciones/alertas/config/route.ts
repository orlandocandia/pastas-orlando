import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/notificaciones/alertas/config - Obtener todas las configuraciones de alertas
export async function GET() {
  try {
    const configuraciones = await db.alertaConfiguracion.findMany({
      orderBy: { tipo: 'asc' },
    })

    return NextResponse.json(configuraciones)
  } catch (error) {
    console.error('Error al obtener configuración de alertas:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración de alertas' },
      { status: 500 }
    )
  }
}

// PUT /api/notificaciones/alertas/config - Actualizar configuración de alertas
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // El body es un array de configuraciones: { tipo, activo?, umbral?, destinatarios?, frecuencia? }
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'El body debe ser un array de configuraciones' },
        { status: 400 }
      )
    }

    const resultados = []

    for (const item of body) {
      const { tipo, activo, umbral, destinatarios, frecuencia } = item

      if (!tipo) {
        resultados.push({ tipo, error: 'Tipo de alerta es requerido' })
        continue
      }

      // Verificar que la configuración existe
      const configExistente = await db.alertaConfiguracion.findUnique({
        where: { tipo },
      })

      if (!configExistente) {
        resultados.push({ tipo, error: `Configuración para tipo "${tipo}" no encontrada` })
        continue
      }

      // Construir datos de actualización
      const updateData: Record<string, unknown> = {}
      if (activo !== undefined) updateData.activo = activo
      if (umbral !== undefined) updateData.umbral = umbral
      if (destinatarios !== undefined) {
        // Si destinatarios es un array, convertirlo a JSON string
        updateData.destinatarios = Array.isArray(destinatarios)
          ? JSON.stringify(destinatarios)
          : destinatarios
      }
      if (frecuencia !== undefined) updateData.frecuencia = frecuencia

      const updated = await db.alertaConfiguracion.update({
        where: { tipo },
        data: updateData,
      })

      resultados.push(updated)
    }

    return NextResponse.json(resultados)
  } catch (error) {
    console.error('Error al actualizar configuración de alertas:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración de alertas' },
      { status: 500 }
    )
  }
}
