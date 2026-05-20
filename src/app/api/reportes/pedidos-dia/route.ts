import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/reportes/pedidos-dia - Resumen de pedidos del día
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fecha = searchParams.get('fecha') || new Date().toISOString().split('T')[0]

    const fechaInicio = new Date(fecha + 'T00:00:00.000Z')
    const fechaFin = new Date(fecha + 'T23:59:59.999Z')

    // Pedidos del día
    const pedidos = await db.pedidoCliente.findMany({
      where: {
        fecha_pedido: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      include: {
        cliente: { include: { contactos: { where: { es_principal: true }, take: 1 } } },
        estado: true,
        detalle: { include: { productoTerminado: true } },
      },
      orderBy: { fecha_pedido: 'desc' },
    })

    // Productos más pedidos
    const productoCount: Record<string, { nombre: string; cantidad: number }> = {}
    for (const pedido of pedidos) {
      for (const det of pedido.detalle) {
        const key = String(det.id_producto_terminado)
        if (!productoCount[key]) {
          productoCount[key] = { nombre: det.productoTerminado.nombre, cantidad: 0 }
        }
        productoCount[key].cantidad += det.cantidad
      }
    }
    const productosMasPedidos = Object.values(productoCount)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10)

    // Resumen
    const totalPesos = pedidos.reduce((sum, p) => sum + p.total, 0)
    const pedidosPendientes = pedidos.filter(p => p.estado?.nombre_estado === 'pendiente').length

    return NextResponse.json({
      fecha,
      resumen: {
        total_pedidos: pedidos.length,
        total_pesos: totalPesos,
        pedidos_pendientes: pedidosPendientes,
      },
      productosMasPedidos,
      pedidos,
    })
  } catch (error) {
    console.error('Error al generar resumen:', error)
    return NextResponse.json({ error: 'Error al generar resumen del día' }, { status: 500 })
  }
}
