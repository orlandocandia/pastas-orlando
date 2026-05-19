import { NextRequest, NextResponse } from 'next/server'
import { enviarNotificacion } from '@/lib/notificaciones-service'

// POST /api/notificaciones/enviar - Enviar una notificación manualmente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id_plantilla,
      tipo,
      destinatario,
      asunto,
      mensaje,
      variables,
      fecha_programada,
    } = body

    // Validaciones
    if (!tipo || !destinatario || !mensaje) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: tipo, destinatario, mensaje' },
        { status: 400 }
      )
    }

    if (!['email', 'whatsapp'].includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo inválido. Debe ser "email" o "whatsapp"' },
        { status: 400 }
      )
    }

    // Enviar la notificación
    const result = await enviarNotificacion({
      id_plantilla: id_plantilla || null,
      tipo,
      destinatario,
      asunto: asunto || undefined,
      mensaje,
      variables: variables || undefined,
      fecha_programada: fecha_programada || null,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al enviar la notificación', result },
        { status: 400 }
      )
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error al enviar notificación:', error)
    return NextResponse.json(
      { error: 'Error al enviar notificación' },
      { status: 500 }
    )
  }
}
