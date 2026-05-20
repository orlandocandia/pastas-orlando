import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const pedidoIncludes = {
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
  estado: true,
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
  reservas: {
    include: {
      productoTerminado: {
        select: {
          id: true,
          codigo: true,
          nombre: true,
        },
      },
      estado: true,
    },
  },
  venta: {
    include: {
      estado: true,
      formaPago: true,
    },
  },
}

// GET /api/pedidos-clientes/[id] - Obtener un pedido de cliente por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const pedido = await db.pedidoCliente.findUnique({
      where: { id: parseInt(id) },
      include: pedidoIncludes,
    })

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Error al obtener pedido de cliente:', error)
    return NextResponse.json({ error: 'Error al obtener pedido de cliente' }, { status: 500 })
  }
}

// PUT /api/pedidos-clientes/[id] - Actualizar pedido de cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { id_estado, observaciones, fecha_entrega_real } = body

    const pedidoExistente = await db.pedidoCliente.findUnique({
      where: { id: parseInt(id) },
    })
    if (!pedidoExistente) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (id_estado !== undefined) updateData.id_estado = parseInt(id_estado)
    if (observaciones !== undefined) updateData.observaciones = observaciones || null
    if (fecha_entrega_real !== undefined) {
      updateData.fecha_entrega_real = fecha_entrega_real ? new Date(fecha_entrega_real) : null
    }

    const pedido = await db.pedidoCliente.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: pedidoIncludes,
    })

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Error al actualizar pedido de cliente:', error)
    return NextResponse.json({ error: 'Error al actualizar pedido de cliente' }, { status: 500 })
  }
}
