import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const pedidoIncludes = {
  proveedor: {
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
      materiaPrima: true,
      insumo: true,
      unidad: true,
    },
  },
}

// GET /api/pedidos-proveedores/[id] - Obtener un pedido por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const pedido = await db.pedidoProveedor.findUnique({
      where: { id: parseInt(id) },
      include: pedidoIncludes,
    })

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Error al obtener pedido:', error)
    return NextResponse.json({ error: 'Error al obtener pedido' }, { status: 500 })
  }
}

// PUT /api/pedidos-proveedores/[id] - Actualizar pedido (estado, observaciones, fecha_entrega_real)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { id_estado, observaciones, fecha_entrega_real } = body

    const pedidoExistente = await db.pedidoProveedor.findUnique({
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

    const pedido = await db.pedidoProveedor.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: pedidoIncludes,
    })

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Error al actualizar pedido:', error)
    return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 })
  }
}

// DELETE /api/pedidos-proveedores/[id] - Eliminar pedido (solo si estado es pendiente)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pedido = await db.pedidoProveedor.findUnique({
      where: { id: parseInt(id) },
      include: { estado: true },
    })

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    // Solo permitir eliminación si el estado es "pendiente"
    if (pedido.estado.nombre_estado !== 'pendiente') {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar pedidos en estado pendiente' },
        { status: 400 }
      )
    }

    // Eliminar pedido (los detalles se eliminan en cascada)
    await db.pedidoProveedor.delete({ where: { id: parseInt(id) } })

    return NextResponse.json({ message: 'Pedido eliminado' })
  } catch (error) {
    console.error('Error al eliminar pedido:', error)
    return NextResponse.json({ error: 'Error al eliminar pedido' }, { status: 500 })
  }
}
