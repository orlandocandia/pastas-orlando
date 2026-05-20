import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/logistica/entregas - Listar entregas con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const fecha = searchParams.get('fecha')

    const where: Record<string, unknown> = {}

    if (estado) where.estado = estado

    // SQLite: usar comparación de strings para fechas (formato ISO)
    if (fecha) {
      where.fecha_programada = {
        gte: new Date(fecha + 'T00:00:00.000Z'),
        lte: new Date(fecha + 'T23:59:59.999Z'),
      }
    }

    const entregas = await db.entrega.findMany({
      where,
      include: {
        pedido: {
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
          },
        },
        puntoEncuentro: true,
      },
      orderBy: { fecha_programada: 'desc' },
    })

    return NextResponse.json(entregas)
  } catch (error) {
    console.error('Error al obtener entregas:', error)
    return NextResponse.json({ error: 'Error al obtener entregas' }, { status: 500 })
  }
}

// POST /api/logistica/entregas - Crear entrega
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id_pedido,
      fecha_programada,
      id_punto_encuentro,
      direccion_alternativa,
      hora_desde,
      hora_hasta,
      nombre_recibe,
      telefono_recibe,
      observaciones,
      latitud_entrega,
      longitud_entrega,
    } = body

    if (!id_pedido || !fecha_programada) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: id_pedido, fecha_programada' },
        { status: 400 }
      )
    }

    // Verificar que el pedido existe
    const pedidoExistente = await db.pedidoCliente.findUnique({
      where: { id: parseInt(id_pedido) },
    })
    if (!pedidoExistente) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 400 })
    }

    const entrega = await db.entrega.create({
      data: {
        id_pedido: parseInt(id_pedido),
        fecha_programada: new Date(fecha_programada),
        id_punto_encuentro: id_punto_encuentro ? parseInt(id_punto_encuentro) : null,
        direccion_alternativa: direccion_alternativa || null,
        hora_desde: hora_desde || null,
        hora_hasta: hora_hasta || null,
        nombre_recibe: nombre_recibe || null,
        telefono_recibe: telefono_recibe || null,
        observaciones: observaciones || null,
        latitud_entrega: latitud_entrega !== undefined ? parseFloat(latitud_entrega) : null,
        longitud_entrega: longitud_entrega !== undefined ? parseFloat(longitud_entrega) : null,
        estado: 'programado',
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
                numero_documento: true,
                tipo_persona: true,
              },
            },
          },
        },
        puntoEncuentro: true,
      },
    })

    return NextResponse.json(entrega, { status: 201 })
  } catch (error) {
    console.error('Error al crear entrega:', error)
    return NextResponse.json({ error: 'Error al crear entrega' }, { status: 500 })
  }
}
