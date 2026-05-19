import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/notificaciones/historial - Listar notificaciones con paginación y filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    const estado = searchParams.get('estado')
    const destinatario = searchParams.get('destinatario')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Construir filtros
    const where: Record<string, unknown> = {}

    if (tipo) where.tipo = tipo
    if (estado) where.estado = estado
    if (destinatario) {
      where.destinatario = { contains: destinatario }
    }

    // Calcular offset
    const skip = (page - 1) * limit

    // Obtener total y datos
    const [total, data] = await Promise.all([
      db.notificacion.count({ where }),
      db.notificacion.findMany({
        where,
        include: {
          plantilla: {
            select: { id: true, nombre: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data,
      total,
      page,
      totalPages,
    })
  } catch (error) {
    console.error('Error al obtener historial de notificaciones:', error)
    return NextResponse.json(
      { error: 'Error al obtener historial de notificaciones' },
      { status: 500 }
    )
  }
}
