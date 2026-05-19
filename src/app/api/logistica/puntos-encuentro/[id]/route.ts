import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/logistica/puntos-encuentro/[id] - Actualizar punto de encuentro
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nombre, direccion, latitud, longitud, horarios, activo } = body

    const puntoExistente = await db.puntoEncuentro.findUnique({
      where: { id: parseInt(id) },
    })
    if (!puntoExistente) {
      return NextResponse.json({ error: 'Punto de encuentro no encontrado' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (nombre !== undefined) updateData.nombre = nombre
    if (direccion !== undefined) updateData.direccion = direccion
    if (latitud !== undefined) updateData.latitud = latitud !== null ? parseFloat(latitud) : null
    if (longitud !== undefined) updateData.longitud = longitud !== null ? parseFloat(longitud) : null
    if (horarios !== undefined) updateData.horarios = horarios || null
    if (activo !== undefined) updateData.activo = activo

    const punto = await db.puntoEncuentro.update({
      where: { id: parseInt(id) },
      data: updateData,
    })

    return NextResponse.json(punto)
  } catch (error) {
    console.error('Error al actualizar punto de encuentro:', error)
    return NextResponse.json({ error: 'Error al actualizar punto de encuentro' }, { status: 500 })
  }
}

// DELETE /api/logistica/puntos-encuentro/[id] - Eliminar punto de encuentro
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const puntoExistente = await db.puntoEncuentro.findUnique({
      where: { id: parseInt(id) },
    })
    if (!puntoExistente) {
      return NextResponse.json({ error: 'Punto de encuentro no encontrado' }, { status: 404 })
    }

    await db.puntoEncuentro.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: 'Punto de encuentro eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar punto de encuentro:', error)
    return NextResponse.json({ error: 'Error al eliminar punto de encuentro' }, { status: 500 })
  }
}
