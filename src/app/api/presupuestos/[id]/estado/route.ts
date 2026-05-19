import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/presupuestos/[id]/estado - Cambiar estado de un presupuesto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { estado } = body

    const estadosValidos = ['pendiente', 'aprobado', 'rechazado', 'expirado', 'convertido']
    if (!estado || !estadosValidos.includes(estado)) {
      return NextResponse.json(
        { error: `Estado inválido. Valores válidos: ${estadosValidos.join(', ')}` },
        { status: 400 }
      )
    }

    const presupuestoExistente = await db.presupuesto.findUnique({
      where: { id: parseInt(id) },
    })

    if (!presupuestoExistente) {
      return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 })
    }

    // Si se convierte a "convertido", crear un PedidoCliente
    if (estado === 'convertido' && presupuestoExistente.estado !== 'convertido') {
      // Obtener estado "pendiente" para el pedido
      const estadoPendiente = await db.estadoGeneral.findFirst({
        where: { nombre_estado: 'pendiente' },
      })

      if (!estadoPendiente) {
        return NextResponse.json(
          { error: 'No se encontró el estado "pendiente" en la base de datos' },
          { status: 400 }
        )
      }

      // Obtener los detalles del presupuesto
      const detalles = await db.detallePresupuesto.findMany({
        where: { id_presupuesto: parseInt(id) },
      })

      // Crear el pedido
      const pedido = await db.pedidoCliente.create({
        data: {
          id_cliente: presupuestoExistente.id_cliente,
          fecha_pedido: new Date(),
          fecha_entrega_solicitada: presupuestoExistente.fecha_validez,
          subtotal: presupuestoExistente.subtotal,
          total: presupuestoExistente.total,
          senia: 0,
          id_estado: estadoPendiente.id,
          observaciones: `Generado desde presupuesto ${presupuestoExistente.numero}`,
          detalle: {
            create: detalles.map(d => ({
              id_producto_terminado: d.id_producto_terminado,
              cantidad: d.cantidad,
              precio_unitario: d.precio_unitario,
              subtotal: d.subtotal,
            })),
          },
        },
      })

      // Actualizar presupuesto con id_pedido y estado
      const presupuesto = await db.presupuesto.update({
        where: { id: parseInt(id) },
        data: {
          estado: 'convertido',
          id_pedido: pedido.id,
        },
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              razon_social: true,
              cuit: true,
              condicion_iva: true,
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
          pedido: {
            select: { id: true },
          },
        },
      })

      return NextResponse.json(presupuesto)
    }

    // Cambio de estado simple
    const presupuesto = await db.presupuesto.update({
      where: { id: parseInt(id) },
      data: { estado },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            razon_social: true,
            cuit: true,
            condicion_iva: true,
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
        pedido: {
          select: { id: true },
        },
      },
    })

    return NextResponse.json(presupuesto)
  } catch (error) {
    console.error('Error al cambiar estado del presupuesto:', error)
    return NextResponse.json({ error: 'Error al cambiar estado del presupuesto' }, { status: 500 })
  }
}
