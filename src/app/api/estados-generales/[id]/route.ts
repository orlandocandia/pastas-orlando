import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/estados-generales/[id] - Actualizar estado general
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nombre_estado, entidad_aplicable, es_final } = body

    const existente = await db.estadoGeneral.findUnique({
      where: { id: parseInt(id) },
    })
    if (!existente) {
      return NextResponse.json(
        { error: 'Estado general no encontrado' },
        { status: 404 }
      )
    }

    // Verificar nombre único (excluyendo el registro actual)
    if (nombre_estado) {
      const duplicado = await db.estadoGeneral.findFirst({
        where: {
          nombre_estado,
          id: { not: parseInt(id) },
        },
      })
      if (duplicado) {
        return NextResponse.json(
          { error: 'Ya existe otro estado general con ese nombre' },
          { status: 400 }
        )
      }
    }

    const estadoGeneral = await db.estadoGeneral.update({
      where: { id: parseInt(id) },
      data: {
        nombre_estado: nombre_estado || undefined,
        entidad_aplicable: entidad_aplicable !== undefined ? entidad_aplicable || null : undefined,
        es_final: es_final !== undefined ? es_final : undefined,
      },
    })

    return NextResponse.json(estadoGeneral)
  } catch (error) {
    console.error('Error al actualizar estado general:', error)
    return NextResponse.json({ error: 'Error al actualizar estado general' }, { status: 500 })
  }
}

// DELETE /api/estados-generales/[id] - Eliminar estado general (solo si no está en uso)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const estadoGeneral = await db.estadoGeneral.findUnique({
      where: { id: parseInt(id) },
      include: {
        compras: { select: { id: true }, take: 1 },
        pedidosProveedor: { select: { id: true }, take: 1 },
      },
    })

    if (!estadoGeneral) {
      return NextResponse.json(
        { error: 'Estado general no encontrado' },
        { status: 404 }
      )
    }

    if (estadoGeneral.compras.length > 0 || estadoGeneral.pedidosProveedor.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el estado general porque está asociado a compras o pedidos' },
        { status: 400 }
      )
    }

    await db.estadoGeneral.delete({ where: { id: parseInt(id) } })

    return NextResponse.json({ message: 'Estado general eliminado' })
  } catch (error) {
    console.error('Error al eliminar estado general:', error)
    return NextResponse.json({ error: 'Error al eliminar estado general' }, { status: 500 })
  }
}
