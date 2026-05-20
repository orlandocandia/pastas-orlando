import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const entregaIncludes = {
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
      detalle: {
        include: {
          productoTerminado: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
              precio_venta: true,
            },
          },
        },
      },
    },
  },
  puntoEncuentro: true,
  notificaciones: {
    orderBy: { createdAt: 'desc' as const },
  },
}

// GET /api/logistica/entregas/[id] - Obtener una entrega por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const entrega = await db.entrega.findUnique({
      where: { id: parseInt(id) },
      include: entregaIncludes,
    })

    if (!entrega) {
      return NextResponse.json({ error: 'Entrega no encontrada' }, { status: 404 })
    }

    return NextResponse.json(entrega)
  } catch (error) {
    console.error('Error al obtener entrega:', error)
    return NextResponse.json({ error: 'Error al obtener entrega' }, { status: 500 })
  }
}

// PUT /api/logistica/entregas/[id] - Actualizar entrega
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      id_punto_encuentro,
      direccion_alternativa,
      fecha_programada,
      hora_desde,
      hora_hasta,
      nombre_recibe,
      telefono_recibe,
      observaciones,
      latitud_entrega,
      longitud_entrega,
    } = body

    const entregaExistente = await db.entrega.findUnique({
      where: { id: parseInt(id) },
    })
    if (!entregaExistente) {
      return NextResponse.json({ error: 'Entrega no encontrada' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (id_punto_encuentro !== undefined) updateData.id_punto_encuentro = id_punto_encuentro ? parseInt(id_punto_encuentro) : null
    if (direccion_alternativa !== undefined) updateData.direccion_alternativa = direccion_alternativa || null
    if (fecha_programada !== undefined) updateData.fecha_programada = new Date(fecha_programada)
    if (hora_desde !== undefined) updateData.hora_desde = hora_desde || null
    if (hora_hasta !== undefined) updateData.hora_hasta = hora_hasta || null
    if (nombre_recibe !== undefined) updateData.nombre_recibe = nombre_recibe || null
    if (telefono_recibe !== undefined) updateData.telefono_recibe = telefono_recibe || null
    if (observaciones !== undefined) updateData.observaciones = observaciones || null
    if (latitud_entrega !== undefined) updateData.latitud_entrega = latitud_entrega !== null ? parseFloat(latitud_entrega) : null
    if (longitud_entrega !== undefined) updateData.longitud_entrega = longitud_entrega !== null ? parseFloat(longitud_entrega) : null

    const entrega = await db.entrega.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: entregaIncludes,
    })

    return NextResponse.json(entrega)
  } catch (error) {
    console.error('Error al actualizar entrega:', error)
    return NextResponse.json({ error: 'Error al actualizar entrega' }, { status: 500 })
  }
}
