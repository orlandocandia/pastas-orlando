import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendConsultaNotifications } from '@/lib/notifications'

// GET /api/consultas - Listar consultas con filtros y paginación
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const estado = searchParams.get('estado') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { email: { contains: search } },
      ]
    }

    if (estado === 'no-leido') {
      where.leido = false
      where.respondido = false
    } else if (estado === 'leido') {
      where.leido = true
      where.respondido = false
    } else if (estado === 'respondido') {
      where.respondido = true
    }

    const [consultas, total] = await Promise.all([
      db.consulta.findMany({
        where,
        orderBy: { fecha: 'desc' },
        skip,
        take: limit,
      }),
      db.consulta.count({ where }),
    ])

    // Get counts for summary
    const [totalAll, noLeidos, leidos, respondidos] = await Promise.all([
      db.consulta.count(),
      db.consulta.count({ where: { leido: false, respondido: false } }),
      db.consulta.count({ where: { leido: true, respondido: false } }),
      db.consulta.count({ where: { respondido: true } }),
    ])

    return NextResponse.json({
      consultas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        total: totalAll,
        noLeidos,
        leidos,
        respondidos,
      },
    })
  } catch (error) {
    console.error('Error al obtener consultas:', error)
    return NextResponse.json({ error: 'Error al obtener consultas', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

// POST /api/consultas - Crear consulta (formulario de contacto)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, email, telefono, mensaje } = body

    if (!nombre || !email || !mensaje) {
      return NextResponse.json({ error: 'Nombre, email y mensaje son requeridos' }, { status: 400 })
    }

    const consulta = await db.consulta.create({
      data: {
        nombre,
        email,
        telefono: telefono || '',
        mensaje,
        leido: false,
        respondido: false,
      },
    })

    // Send email + WhatsApp notifications (await to guarantee delivery in serverless)
    // Errors are caught internally — won't affect the API response
    await sendConsultaNotifications({ nombre, email, telefono: telefono || '', mensaje })

    return NextResponse.json(consulta, { status: 201 })
  } catch (error) {
    console.error('Error al crear consulta:', error)
    return NextResponse.json({ error: 'Error al crear consulta', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
