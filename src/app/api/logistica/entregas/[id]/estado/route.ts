import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Transiciones válidas de estado
const validTransitions: Record<string, string[]> = {
  programado: ['en_camino', 'entregado', 'cancelado', 'reagendado'],
  en_camino: ['entregado'],
}

// PUT /api/logistica/entregas/[id]/estado - Cambiar estado de una entrega
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { estado, fecha_programada } = body

    if (!estado) {
      return NextResponse.json(
        { error: 'Se requiere el campo estado' },
        { status: 400 }
      )
    }

    const entregaExistente = await db.entrega.findUnique({
      where: { id: parseInt(id) },
    })
    if (!entregaExistente) {
      return NextResponse.json({ error: 'Entrega no encontrada' }, { status: 404 })
    }

    // Validar transición de estado
    const estadoActual = entregaExistente.estado
    const allowed = validTransitions[estadoActual]

    if (!allowed || !allowed.includes(estado)) {
      return NextResponse.json(
        { error: `Transición no válida: de "${estadoActual}" a "${estado}"` },
        { status: 400 }
      )
    }

    // Si es reagendado, requiere nueva fecha_programada
    if (estado === 'reagendado' && !fecha_programada) {
      return NextResponse.json(
        { error: 'Para reagendar se requiere fecha_programada' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = { estado }

    // Si cambia a entregado, setear fecha_realizada
    if (estado === 'entregado') {
      updateData.fecha_realizada = new Date()
    }

    // Si es reagendado, actualizar fecha_programada
    if (estado === 'reagendado' && fecha_programada) {
      updateData.fecha_programada = new Date(fecha_programada)
    }

    const entrega = await db.entrega.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        pedido: {
          include: {
            cliente: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                razon_social: true,
                numero_documento: true,
                tipo_persona: true,
              },
            },
          },
        },
        puntoEncuentro: true,
        notificaciones: {
          orderBy: { createdAt: 'desc' as const },
        },
      },
    })

    return NextResponse.json(entrega)
  } catch (error) {
    console.error('Error al cambiar estado de entrega:', error)
    return NextResponse.json({ error: 'Error al cambiar estado de entrega' }, { status: 500 })
  }
}
