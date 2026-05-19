import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/logistica/mapa/entregas - Entregas con coordenadas para el mapa
export async function GET() {
  try {
    const entregas = await db.entrega.findMany({
      where: {
        estado: { in: ['programado', 'en_camino'] },
        latitud_entrega: { not: null },
        longitud_entrega: { not: null },
      },
      include: {
        pedido: {
          include: {
            cliente: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                razon_social: true,
              },
            },
          },
        },
        puntoEncuentro: {
          select: {
            id: true,
            nombre: true,
            direccion: true,
          },
        },
      },
      orderBy: { fecha_programada: 'asc' },
    })

    // Formatear resultado para el mapa
    const results = entregas.map((entrega) => ({
      id: entrega.id,
      estado: entrega.estado,
      fecha_programada: entrega.fecha_programada,
      cliente_nombre: entrega.pedido.cliente.razon_social
        || `${entrega.pedido.cliente.nombre} ${entrega.pedido.cliente.apellido}`,
      lat: entrega.latitud_entrega,
      lng: entrega.longitud_entrega,
      pedido_id: entrega.id_pedido,
      punto_encuentro_nombre: entrega.puntoEncuentro?.nombre || null,
    }))

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error al obtener entregas para mapa:', error)
    return NextResponse.json({ error: 'Error al obtener entregas para mapa' }, { status: 500 })
  }
}
