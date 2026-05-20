import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const compraIncludes = {
  proveedor: {
    select: {
      id: true,
      nombre: true,
      apellido: true,
      razon_social: true,
      numero_documento: true,
      tipo_persona: true,
    },
  },
  formaPago: true,
  estado: true,
  detalle: {
    include: {
      materiaPrima: true,
      insumo: true,
      marca: true,
      unidadCompra: true,
    },
  },
}

// GET /api/compras/[id] - Obtener una compra por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const compra = await db.compra.findUnique({
      where: { id: parseInt(id) },
      include: compraIncludes,
    })

    if (!compra) {
      return NextResponse.json({ error: 'Compra no encontrada' }, { status: 404 })
    }

    return NextResponse.json(compra)
  } catch (error) {
    console.error('Error al obtener compra:', error)
    return NextResponse.json({ error: 'Error al obtener compra' }, { status: 500 })
  }
}

// PUT /api/compras/[id] - Actualizar compra (solo observaciones, numero_factura, id_estado)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { observaciones, numero_factura, id_estado } = body

    const compraExistente = await db.compra.findUnique({
      where: { id: parseInt(id) },
    })
    if (!compraExistente) {
      return NextResponse.json({ error: 'Compra no encontrada' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (observaciones !== undefined) updateData.observaciones = observaciones || null
    if (numero_factura !== undefined) updateData.numero_factura = numero_factura || null
    if (id_estado !== undefined) updateData.id_estado = parseInt(id_estado)

    const compra = await db.compra.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: compraIncludes,
    })

    return NextResponse.json(compra)
  } catch (error) {
    console.error('Error al actualizar compra:', error)
    return NextResponse.json({ error: 'Error al actualizar compra' }, { status: 500 })
  }
}

// DELETE /api/compras/[id] - Eliminar compra (solo si estado es pendiente, revirtiendo stock)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const compra = await db.compra.findUnique({
      where: { id: parseInt(id) },
      include: {
        estado: true,
        detalle: true,
      },
    })

    if (!compra) {
      return NextResponse.json({ error: 'Compra no encontrada' }, { status: 404 })
    }

    // Solo permitir eliminación si el estado es "pendiente"
    if (compra.estado.nombre_estado !== 'pendiente') {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar compras en estado pendiente' },
        { status: 400 }
      )
    }

    // Ejecutar en transacción: revertir stock y eliminar compra
    await db.$transaction(async (tx) => {
      // Revertir stock para cada detalle
      for (const detalle of compra.detalle) {
        if (detalle.id_materia_prima) {
          const mp = await tx.materiaPrima.findUnique({
            where: { id: detalle.id_materia_prima },
          })
          if (mp) {
            await tx.materiaPrima.update({
              where: { id: detalle.id_materia_prima },
              data: { stock_actual: mp.stock_actual - detalle.cantidad_base },
            })
          }
        } else if (detalle.id_insumo) {
          const ins = await tx.insumo.findUnique({
            where: { id: detalle.id_insumo },
          })
          if (ins) {
            await tx.insumo.update({
              where: { id: detalle.id_insumo },
              data: { stock_actual: ins.stock_actual - detalle.cantidad_base },
            })
          }
        }

        // Crear movimiento de stock de reversión
        if (detalle.id_materia_prima) {
          const mp = await tx.materiaPrima.findUnique({
            where: { id: detalle.id_materia_prima },
          })
          if (mp) {
            await tx.stockMovement.create({
              data: {
                tipo_movimiento: 'ajuste_out',
                id_materia_prima: detalle.id_materia_prima,
                cantidad: detalle.cantidad_base,
                id_unidad: mp.id_unidad_base,
                stock_antes: mp.stock_actual + detalle.cantidad_base,
                stock_despues: mp.stock_actual,
                referencia_id: compra.id,
                referencia_tabla: 'compra',
                observacion: `Reversión por eliminación de Compra #${compra.id}`,
              },
            })
          }
        } else if (detalle.id_insumo) {
          const ins = await tx.insumo.findUnique({
            where: { id: detalle.id_insumo },
          })
          if (ins) {
            await tx.stockMovement.create({
              data: {
                tipo_movimiento: 'ajuste_out',
                id_insumo: detalle.id_insumo,
                cantidad: detalle.cantidad_base,
                id_unidad: ins.id_unidad_base,
                stock_antes: ins.stock_actual + detalle.cantidad_base,
                stock_despues: ins.stock_actual,
                referencia_id: compra.id,
                referencia_tabla: 'compra',
                observacion: `Reversión por eliminación de Compra #${compra.id}`,
              },
            })
          }
        }
      }

      // Eliminar la compra (los detalles se eliminan en cascada)
      await tx.compra.delete({ where: { id: compra.id } })
    })

    return NextResponse.json({ message: 'Compra eliminada y stock revertido' })
  } catch (error) {
    console.error('Error al eliminar compra:', error)
    return NextResponse.json({ error: 'Error al eliminar compra' }, { status: 500 })
  }
}
