import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { extraerVariables } from '@/lib/plantillas'

// PUT /api/notificaciones/plantillas/[id] - Actualizar una plantilla de notificación
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { canal, asunto, mensaje, activo } = body

    // Verificar que la plantilla existe
    const plantillaExistente = await db.plantillaNotificacion.findUnique({
      where: { id: parseInt(id) },
    })

    if (!plantillaExistente) {
      return NextResponse.json(
        { error: 'Plantilla no encontrada' },
        { status: 404 }
      )
    }

    // Construir datos de actualización solo con campos permitidos
    const updateData: Record<string, unknown> = {}
    if (canal !== undefined) updateData.canal = canal
    if (asunto !== undefined) updateData.asunto = asunto
    if (mensaje !== undefined) updateData.mensaje = mensaje
    if (activo !== undefined) updateData.activo = activo

    const plantilla = await db.plantillaNotificacion.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        _count: {
          select: { notificaciones: true },
        },
      },
    })

    // Extraer variables del mensaje actualizado (o del existente si no se actualizó)
    const mensajeParaVariables = mensaje || plantillaExistente.mensaje
    const variables = extraerVariables(mensajeParaVariables)

    return NextResponse.json({
      ...plantilla,
      notificacionesCount: plantilla._count.notificaciones,
      variables,
    })
  } catch (error) {
    console.error('Error al actualizar plantilla de notificación:', error)
    return NextResponse.json(
      { error: 'Error al actualizar plantilla de notificación' },
      { status: 500 }
    )
  }
}
