import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/presupuestos/[id]/convertir-pedido - Convertir presupuesto a pedido de cliente
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const presupuesto = await db.presupuesto.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true,
        detalle: { include: { productoTerminado: true } },
      },
    })

    if (!presupuesto) {
      return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 })
    }

    if (presupuesto.estado !== 'aprobado') {
      return NextResponse.json({ error: 'Solo se pueden convertir presupuestos aprobados' }, { status: 400 })
    }

    if (presupuesto.id_pedido) {
      return NextResponse.json({ error: 'Este presupuesto ya fue convertido a pedido' }, { status: 400 })
    }

    // Find "pendiente" estado for pedidos_cliente
    const estadoPendiente = await db.estadoGeneral.findFirst({
      where: { nombre_estado: 'pendiente', entidad_aplicable: { contains: 'pedido' } }
    })
    const idEstado = estadoPendiente?.id || 1

    // Create PedidoCliente from presupuesto
    const pedido = await db.pedidoCliente.create({
      data: {
        id_cliente: presupuesto.id_cliente,
        fecha_pedido: new Date(),
        fecha_entrega_solicitada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        subtotal: presupuesto.subtotal,
        total: presupuesto.total,
        senia: 0,
        id_estado: idEstado,
        observaciones: `Generado desde presupuesto ${presupuesto.numero}`,
        detalle: {
          create: presupuesto.detalle.map(d => ({
            id_producto_terminado: d.id_producto_terminado,
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario,
            subtotal: d.subtotal,
          })),
        },
      },
      include: {
        cliente: true,
        detalle: { include: { productoTerminado: true } },
      },
    })

    // Update presupuesto with pedido id and estado
    await db.presupuesto.update({
      where: { id: parseInt(id) },
      data: { id_pedido: pedido.id, estado: 'convertido' },
    })

    return NextResponse.json(pedido, { status: 201 })
  } catch (error) {
    console.error('Error al convertir presupuesto:', error)
    return NextResponse.json({ error: 'Error al convertir presupuesto a pedido' }, { status: 500 })
  }
}
