import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { enviarNotificacion } from '@/lib/notificaciones-service'

// PUT /api/notificaciones/historial/[id] - Reenviar una notificación
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { accion } = body

    if (accion !== 'reenviar') {
      return NextResponse.json(
        { error: 'Acción no válida. Solo se permite "reenviar"' },
        { status: 400 }
      )
    }

    // Obtener la notificación original
    const notificacionOriginal = await db.notificacion.findUnique({
      where: { id: parseInt(id) },
      include: {
        plantilla: {
          select: { id: true, nombre: true },
        },
      },
    })

    if (!notificacionOriginal) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      )
    }

    // Reenviar usando los mismos datos
    const result = await enviarNotificacion({
      id_plantilla: notificacionOriginal.id_plantilla,
      tipo: notificacionOriginal.tipo as 'email' | 'whatsapp',
      destinatario: notificacionOriginal.destinatario,
      asunto: notificacionOriginal.asunto || undefined,
      mensaje: notificacionOriginal.mensaje,
      metadata: notificacionOriginal.metadata
        ? JSON.parse(notificacionOriginal.metadata)
        : undefined,
    })

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Error al reenviar la notificación',
          notificacion_original: notificacionOriginal,
          result,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Notificación reenviada correctamente',
      notificacion_original: {
        id: notificacionOriginal.id,
        tipo: notificacionOriginal.tipo,
        destinatario: notificacionOriginal.destinatario,
        estado: notificacionOriginal.estado,
      },
      nueva_notificacion: result.notificacion,
      envio: result.envio,
    })
  } catch (error) {
    console.error('Error al reenviar notificación:', error)
    return NextResponse.json(
      { error: 'Error al reenviar notificación' },
      { status: 500 }
    )
  }
}
