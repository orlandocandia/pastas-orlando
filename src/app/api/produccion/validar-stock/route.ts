import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/produccion/validar-stock - Validar si hay stock suficiente para una producción
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id_receta = searchParams.get('id_receta')
    const cantidad_producida = searchParams.get('cantidad_producida')

    if (!id_receta || !cantidad_producida) {
      return NextResponse.json(
        { error: 'Se requieren los parámetros id_receta y cantidad_producida' },
        { status: 400 }
      )
    }

    const cantidadNum = parseInt(cantidad_producida)
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      return NextResponse.json(
        { error: 'cantidad_producida debe ser un número mayor a 0' },
        { status: 400 }
      )
    }

    // Cargar la receta con sus detalles
    const receta = await db.receta.findUnique({
      where: { id: parseInt(id_receta) },
      include: {
        detalleRecetas: {
          include: {
            materiaPrima: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
                stock_actual: true,
              },
            },
            insumo: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
                stock_actual: true,
              },
            },
            unidad: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
          },
        },
        productoTerminado: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
      },
    })

    if (!receta) {
      return NextResponse.json(
        { error: `Receta con id ${id_receta} no encontrada` },
        { status: 404 }
      )
    }

    // Calcular el factor de escala
    const factorEscala = cantidadNum / receta.rendimiento_unidades

    // Verificar stock para cada ingrediente
    const faltantes: Array<{
      tipo: 'materia_prima' | 'insumo'
      id: number
      nombre: string
      codigo: string | null
      required: number
      available: number
      deficit: number
      unidad: string
    }> = []

    for (const detalle of receta.detalleRecetas) {
      const cantidadRequerida = detalle.cantidad_necesaria * factorEscala

      if (detalle.materiaPrima) {
        const disponible = detalle.materiaPrima.stock_actual
        const deficit = Math.max(0, cantidadRequerida - disponible)

        faltantes.push({
          tipo: 'materia_prima',
          id: detalle.materiaPrima.id,
          nombre: detalle.materiaPrima.nombre,
          codigo: detalle.materiaPrima.codigo,
          required: cantidadRequerida,
          available: disponible,
          deficit,
          unidad: detalle.unidad.nombre,
        })
      } else if (detalle.insumo) {
        const disponible = detalle.insumo.stock_actual
        const deficit = Math.max(0, cantidadRequerida - disponible)

        faltantes.push({
          tipo: 'insumo',
          id: detalle.insumo.id,
          nombre: detalle.insumo.nombre,
          codigo: detalle.insumo.codigo,
          required: cantidadRequerida,
          available: disponible,
          deficit,
          unidad: detalle.unidad.nombre,
        })
      }
    }

    const puedeProducir = faltantes.every((f) => f.deficit === 0)

    return NextResponse.json({
      puede_producir: puedeProducir,
      receta: {
        id: receta.id,
        nombre: receta.nombre_receta,
        rendimiento_unidades: receta.rendimiento_unidades,
        producto_terminado: receta.productoTerminado,
      },
      cantidad_solicitada: cantidadNum,
      factor_escala: factorEscala,
      faltantes,
    })
  } catch (error) {
    console.error('Error al validar stock para producción:', error)
    return NextResponse.json({ error: 'Error al validar stock para producción' }, { status: 500 })
  }
}
