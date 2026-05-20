import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/pedidos-clientes/[id]/estado - Cambiar estado de un pedido de cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { id_estado } = body

    if (!id_estado) {
      return NextResponse.json(
        { error: 'Se requiere id_estado' },
        { status: 400 }
      )
    }

    const pedidoExistente = await db.pedidoCliente.findUnique({
      where: { id: parseInt(id) },
    })
    if (!pedidoExistente) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    // Verificar que el estado existe
    const estado = await db.estadoGeneral.findUnique({
      where: { id: parseInt(id_estado) },
    })
    if (!estado) {
      return NextResponse.json({ error: 'Estado no encontrado' }, { status: 400 })
    }

    const pedido = await db.pedidoCliente.update({
      where: { id: parseInt(id) },
      data: { id_estado: parseInt(id_estado) },
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
      },
    })

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Error al cambiar estado del pedido de cliente:', error)
    return NextResponse.json({ error: 'Error al cambiar estado del pedido de cliente' }, { status: 500 })
  }
}
