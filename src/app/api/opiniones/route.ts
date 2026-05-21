import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/opiniones - Obtener opiniones aprobadas (público) o todas (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const admin = searchParams.get('admin') === 'true'

    const where: Record<string, unknown> = {}
    if (!admin) {
      where.estado = 'approved'
    } else if (estado) {
      where.estado = estado
    }

    const opiniones = await db.opinion.findMany({
      where,
      orderBy: [
        { destacado: 'desc' },
        { orden: 'asc' },
        { fecha: 'desc' },
      ],
    })

    return NextResponse.json(opiniones)
  } catch (error) {
    console.error('Error al obtener opiniones:', error)
    return NextResponse.json({ error: 'Error al obtener opiniones' }, { status: 500 })
  }
}

// POST /api/opiniones - Crear opinión (público)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, email, calificacion, comentario } = body

    if (!nombre || !calificacion || !comentario) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
    }

    if (calificacion < 1 || calificacion > 5) {
      return NextResponse.json({ error: 'La calificación debe ser entre 1 y 5' }, { status: 400 })
    }

    // Obtener IP del cliente
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || null

    const opinion = await db.opinion.create({
      data: {
        nombre,
        email: email || null,
        calificacion: parseInt(calificacion),
        comentario,
        ip,
        estado: 'pending',
      },
    })

    return NextResponse.json(opinion, { status: 201 })
  } catch (error) {
    console.error('Error al crear opinión:', error)
    return NextResponse.json({ error: 'Error al crear opinión' }, { status: 500 })
  }
}

// PUT /api/opiniones - Aprobar/rechazar opinión (admin)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, estado, id_aprobador, respuesta, destacado } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (estado) {
      updateData.estado = estado
      if (estado === 'approved') {
        updateData.fecha_aprobacion = new Date()
        updateData.id_aprobador = id_aprobador || null
      }
    }
    if (respuesta !== undefined) {
      updateData.respuesta = respuesta
      updateData.fecha_respuesta = new Date()
    }
    if (destacado !== undefined) {
      updateData.destacado = destacado
    }

    const opinion = await db.opinion.update({
      where: { id: parseInt(id) },
      data: updateData,
    })

    return NextResponse.json(opinion)
  } catch (error) {
    console.error('Error al actualizar opinión:', error)
    return NextResponse.json({ error: 'Error al actualizar opinión' }, { status: 500 })
  }
}

// DELETE /api/opiniones - Eliminar opinión (admin)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    await db.opinion.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: 'Opinión eliminada' })
  } catch (error) {
    console.error('Error al eliminar opinión:', error)
    return NextResponse.json({ error: 'Error al eliminar opinión' }, { status: 500 })
  }
}
