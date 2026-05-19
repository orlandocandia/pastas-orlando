import { NextRequest, NextResponse } from 'next/server'
import {
  procesarAlertaStockBajo,
  procesarAlertaPedidoPendiente,
  procesarAlertaEntregaProxima,
  procesarAlertaProduccionAtrasada,
  procesarTodasLasAlertas,
} from '@/lib/notificaciones-service'

// POST /api/notificaciones/alertas/ejecutar - Ejecutar alertas manualmente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tipo } = body

    if (!tipo) {
      return NextResponse.json(
        { error: 'Falta el campo requerido: tipo' },
        { status: 400 }
      )
    }

    const tiposValidos = ['stock_bajo', 'pedido_pendiente', 'entrega_proxima', 'produccion_atrasada', 'todas']
    if (!tiposValidos.includes(tipo)) {
      return NextResponse.json(
        { error: `Tipo inválido. Debe ser uno de: ${tiposValidos.join(', ')}` },
        { status: 400 }
      )
    }

    let resultado

    switch (tipo) {
      case 'stock_bajo':
        resultado = await procesarAlertaStockBajo()
        break
      case 'pedido_pendiente':
        resultado = await procesarAlertaPedidoPendiente()
        break
      case 'entrega_proxima':
        resultado = await procesarAlertaEntregaProxima()
        break
      case 'produccion_atrasada':
        resultado = await procesarAlertaProduccionAtrasada()
        break
      case 'todas':
        resultado = await procesarTodasLasAlertas()
        break
    }

    return NextResponse.json({
      tipo,
      resultado,
    })
  } catch (error) {
    console.error('Error al ejecutar alertas:', error)
    return NextResponse.json(
      { error: 'Error al ejecutar alertas' },
      { status: 500 }
    )
  }
}
