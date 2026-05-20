import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/reportes/hoja-ruta - Entregas del día
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fecha = searchParams.get('fecha') || new Date().toISOString().split('T')[0]

    const fechaInicio = new Date(fecha + 'T00:00:00.000Z')
    const fechaFin = new Date(fecha + 'T23:59:59.999Z')

    const entregas = await db.entrega.findMany({
      where: {
        fecha_programada: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        estado: { in: ['programado', 'en_camino'] },
      },
      include: {
        pedido: {
          include: {
            cliente: {
              include: {
                contactos: { where: { es_principal: true }, take: 1 },
                direcciones: { where: { es_principal: true }, take: 1 },
              },
            },
            detalle: { include: { productoTerminado: true } },
          },
        },
        puntoEncuentro: true,
      },
      orderBy: { hora_desde: 'asc' },
    })

    const resumen = {
      total_entregas: entregas.length,
      entregas_programadas: entregas.filter(e => e.estado === 'programado').length,
      entregas_en_camino: entregas.filter(e => e.estado === 'en_camino').length,
    }

    return NextResponse.json({ entregas, resumen, fecha })
  } catch (error) {
    console.error('Error al generar hoja de ruta:', error)
    return NextResponse.json({ error: 'Error al generar hoja de ruta' }, { status: 500 })
  }
}
