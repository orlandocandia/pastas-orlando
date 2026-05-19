import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/contacto - Registrar interacción WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tipo, mensaje_enviado } = body

    if (!tipo || !mensaje_enviado) {
      return NextResponse.json({ error: 'Tipo y mensaje son requeridos' }, { status: 400 })
    }

    // Obtener IP del cliente
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || null

    const interaccion = await db.interaccionWhatsApp.create({
      data: {
        tipo,
        mensaje_enviado,
        ip,
      },
    })

    return NextResponse.json(interaccion, { status: 201 })
  } catch (error) {
    console.error('Error al registrar interacción:', error)
    return NextResponse.json({ error: 'Error al registrar interacción' }, { status: 500 })
  }
}

// GET /api/contacto - Obtener interacciones (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dias = parseInt(searchParams.get('dias') || '30')

    const fechaDesde = new Date()
    fechaDesde.setDate(fechaDesde.getDate() - dias)

    const interacciones = await db.interaccionWhatsApp.findMany({
      where: {
        fecha: {
          gte: fechaDesde,
        },
      },
      orderBy: { fecha: 'desc' },
    })

    // Estadísticas por día
    const porDia: Record<string, number> = {}
    interacciones.forEach((i) => {
      const dia = i.fecha.toISOString().split('T')[0]
      porDia[dia] = (porDia[dia] || 0) + 1
    })

    // Estadísticas por tipo
    const porTipo: Record<string, number> = {}
    interacciones.forEach((i) => {
      porTipo[i.tipo] = (porTipo[i.tipo] || 0) + 1
    })

    return NextResponse.json({
      interacciones,
      estadisticas: {
        total: interacciones.length,
        porDia,
        porTipo,
      },
    })
  } catch (error) {
    console.error('Error al obtener interacciones:', error)
    return NextResponse.json({ error: 'Error al obtener interacciones' }, { status: 500 })
  }
}
