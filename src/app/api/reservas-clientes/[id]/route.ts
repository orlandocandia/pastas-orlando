import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const reservaIncludes = {
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
  productoTerminado: {
    select: {
      id: true,
      codigo: true,
      nombre: true,
      precio_venta: true,
      categoria: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
  },
  estado: true,
  pedido: {
    select: {
      id: true,
      fecha_pedido: true,
      subtotal: true,
      total: true,
      estado: true,
      detalle: {
        include: {
          productoTerminado: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
            },
          },
        },
      },
    },
  },
}

// GET /api/reservas-clientes/[id] - Obtener una reserva por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reserva = await db.reservaCliente.findUnique({
      where: { id: parseInt(id) },
      include: reservaIncludes,
    })

    if (!reserva) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }

    return NextResponse.json(reserva)
  } catch (error) {
    console.error('Error al obtener reserva de cliente:', error)
    return NextResponse.json({ error: 'Error al obtener reserva de cliente' }, { status: 500 })
  }
}

// PUT /api/reservas-clientes/[id] - Actualizar reserva (estado, cantidad_confirmada)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { id_estado, cantidad_confirmada } = body

    const reservaExistente = await db.reservaCliente.findUnique({
      where: { id: parseInt(id) },
    })
    if (!reservaExistente) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (id_estado !== undefined) updateData.id_estado = parseInt(id_estado)
    if (cantidad_confirmada !== undefined) updateData.cantidad_confirmada = parseFloat(cantidad_confirmada)

    const reserva = await db.reservaCliente.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: reservaIncludes,
    })

    return NextResponse.json(reserva)
  } catch (error) {
    console.error('Error al actualizar reserva de cliente:', error)
    return NextResponse.json({ error: 'Error al actualizar reserva de cliente' }, { status: 500 })
  }
}
