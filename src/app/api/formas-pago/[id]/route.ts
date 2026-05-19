import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/formas-pago/[id] - Actualizar forma de pago
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nombre_forma, requiere_identificacion, requiere_cuenta } = body

    const existente = await db.formaPago.findUnique({
      where: { id: parseInt(id) },
    })
    if (!existente) {
      return NextResponse.json(
        { error: 'Forma de pago no encontrada' },
        { status: 404 }
      )
    }

    // Verificar nombre único (excluyendo el registro actual)
    if (nombre_forma) {
      const duplicado = await db.formaPago.findFirst({
        where: {
          nombre_forma,
          id: { not: parseInt(id) },
        },
      })
      if (duplicado) {
        return NextResponse.json(
          { error: 'Ya existe otra forma de pago con ese nombre' },
          { status: 400 }
        )
      }
    }

    const formaPago = await db.formaPago.update({
      where: { id: parseInt(id) },
      data: {
        nombre_forma: nombre_forma || undefined,
        requiere_identificacion: requiere_identificacion !== undefined ? requiere_identificacion : undefined,
        requiere_cuenta: requiere_cuenta !== undefined ? requiere_cuenta : undefined,
      },
    })

    return NextResponse.json(formaPago)
  } catch (error) {
    console.error('Error al actualizar forma de pago:', error)
    return NextResponse.json({ error: 'Error al actualizar forma de pago' }, { status: 500 })
  }
}

// DELETE /api/formas-pago/[id] - Eliminar forma de pago
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const formaPago = await db.formaPago.findUnique({
      where: { id: parseInt(id) },
      include: { compras: { select: { id: true }, take: 1 } },
    })

    if (!formaPago) {
      return NextResponse.json(
        { error: 'Forma de pago no encontrada' },
        { status: 404 }
      )
    }

    if (formaPago.compras.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la forma de pago porque está asociada a compras' },
        { status: 400 }
      )
    }

    await db.formaPago.delete({ where: { id: parseInt(id) } })

    return NextResponse.json({ message: 'Forma de pago eliminada' })
  } catch (error) {
    console.error('Error al eliminar forma de pago:', error)
    return NextResponse.json({ error: 'Error al eliminar forma de pago' }, { status: 500 })
  }
}
