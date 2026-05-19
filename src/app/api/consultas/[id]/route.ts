import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/consultas/[id] - Obtener detalle de consulta
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const consulta = await db.consulta.findUnique({
      where: { id: parseInt(id) },
    })

    if (!consulta) {
      return NextResponse.json({ error: 'Consulta no encontrada' }, { status: 404 })
    }

    return NextResponse.json(consulta)
  } catch (error) {
    console.error('Error al obtener consulta:', error)
    return NextResponse.json({ error: 'Error al obtener consulta' }, { status: 500 })
  }
}

// PUT /api/consultas/[id] - Actualizar estado de consulta
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { leido, respondido } = body

    const updateData: Record<string, unknown> = {}
    if (leido !== undefined) updateData.leido = leido
    if (respondido !== undefined) {
      updateData.respondido = respondido
      if (respondido) updateData.leido = true // Si se marca como respondido, también se marca como leído
    }

    const consulta = await db.consulta.update({
      where: { id: parseInt(id) },
      data: updateData,
    })

    return NextResponse.json(consulta)
  } catch (error) {
    console.error('Error al actualizar consulta:', error)
    return NextResponse.json({ error: 'Error al actualizar consulta' }, { status: 500 })
  }
}

// DELETE /api/consultas/[id] - Eliminar consulta
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.consulta.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: 'Consulta eliminada' })
  } catch (error) {
    console.error('Error al eliminar consulta:', error)
    return NextResponse.json({ error: 'Error al eliminar consulta' }, { status: 500 })
  }
}
