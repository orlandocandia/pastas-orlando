import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/produccion/[id]/completar - Completar producción: ejecutar movimientos de stock
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const produccionId = parseInt(id)

    if (isNaN(produccionId)) {
      return NextResponse.json(
        { error: 'ID de producción inválido' },
        { status: 400 }
      )
    }

    // Buscar la producción con todos sus detalles
    const produccion = await db.produccion.findUnique({
      where: { id: produccionId },
      include: {
        estado: true,
        detalleConsumos: {
          include: {
            materiaPrima: true,
            insumo: true,
            unidad: true,
          },
        },
        detalleGenerados: {
          include: {
            productoTerminado: true,
            unidad: false,
          },
        },
      },
    })

    if (!produccion) {
      return NextResponse.json(
        { error: 'Producción no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el estado actual sea "planificado" o "en_curso"
    const estadoNombre = produccion.estado.nombre_estado.toLowerCase()
    if (estadoNombre !== 'planificado' && estadoNombre !== 'en_curso') {
      return NextResponse.json(
        { error: `La producción no puede completarse porque su estado actual es "${produccion.estado.nombre_estado}". Solo se pueden completar producciones en estado "planificado" o "en_curso".` },
        { status: 400 }
      )
    }

    // Obtener el estado "completado"
    const estadoCompletado = await db.estadoGeneral.findFirst({
      where: { nombre_estado: 'completado' },
    })
    if (!estadoCompletado) {
      return NextResponse.json(
        { error: 'No se encontró el estado "completado" en la base de datos' },
        { status: 400 }
      )
    }

    // Ejecutar todo en una transacción
    const produccionActualizada = await db.$transaction(async (tx) => {
      // Procesar consumos: descontar stock de materias primas e insumos
      for (const consumo of produccion.detalleConsumos) {
        if (consumo.id_materia_prima && consumo.materiaPrima) {
          const stockAntes = consumo.materiaPrima.stock_actual
          const stockDespues = stockAntes - consumo.cantidad_consumida

          // Actualizar stock de materia prima
          await tx.materiaPrima.update({
            where: { id: consumo.id_materia_prima },
            data: { stock_actual: stockDespues },
          })

          // Crear registro de movimiento de stock (consumo - cantidad negativa)
          await tx.stockMovement.create({
            data: {
              tipo_movimiento: 'produccion_consumo',
              id_materia_prima: consumo.id_materia_prima,
              cantidad: -consumo.cantidad_consumida,
              id_unidad: consumo.id_unidad,
              stock_antes: stockAntes,
              stock_despues: stockDespues,
              referencia_id: produccionId,
              referencia_tabla: 'produccion',
              observacion: `Producción #${produccionId} - Consumo de ${consumo.materiaPrima.nombre}`,
            },
          })
        } else if (consumo.id_insumo && consumo.insumo) {
          const stockAntes = consumo.insumo.stock_actual
          const stockDespues = stockAntes - consumo.cantidad_consumida

          // Actualizar stock de insumo
          await tx.insumo.update({
            where: { id: consumo.id_insumo },
            data: { stock_actual: stockDespues },
          })

          // Crear registro de movimiento de stock (consumo - cantidad negativa)
          await tx.stockMovement.create({
            data: {
              tipo_movimiento: 'produccion_consumo',
              id_insumo: consumo.id_insumo,
              cantidad: -consumo.cantidad_consumida,
              id_unidad: consumo.id_unidad,
              stock_antes: stockAntes,
              stock_despues: stockDespues,
              referencia_id: produccionId,
              referencia_tabla: 'produccion',
              observacion: `Producción #${produccionId} - Consumo de ${consumo.insumo.nombre}`,
            },
          })
        }
      }

      // Procesar generados: agregar stock de productos terminados
      for (const generado of produccion.detalleGenerados) {
        const stockAntes = generado.productoTerminado.stock_actual
        const stockDespues = stockAntes + generado.cantidad_generada

        // Actualizar stock de producto terminado
        await tx.productoTerminado.update({
          where: { id: generado.id_producto_terminado },
          data: { stock_actual: stockDespues },
        })

        // Obtener la unidad por defecto para productos terminados (tipo "unidad")
        const unidadDefault = await tx.unidadMedida.findFirst({
          where: { tipo_medida: 'unidad' },
        })
        const idUnidad = unidadDefault?.id ?? 1

        // Crear registro de movimiento de stock (generación - cantidad positiva)
        await tx.stockMovement.create({
          data: {
            tipo_movimiento: 'produccion_genera',
            id_producto_terminado: generado.id_producto_terminado,
            cantidad: generado.cantidad_generada,
            id_unidad: idUnidad,
            stock_antes: stockAntes,
            stock_despues: stockDespues,
            referencia_id: produccionId,
            referencia_tabla: 'produccion',
            observacion: `Producción #${produccionId} - Generación de ${generado.productoTerminado.nombre}`,
          },
        })
      }

      // Actualizar el estado de la producción a "completado"
      await tx.produccion.update({
        where: { id: produccionId },
        data: { id_estado: estadoCompletado.id },
      })

      // Retornar la producción actualizada con todos los includes
      return tx.produccion.findUnique({
        where: { id: produccionId },
        include: {
          receta: {
            include: {
              productoTerminado: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true,
                  precio_venta: true,
                },
              },
            },
          },
          supervisor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              razon_social: true,
              numero_documento: true,
              contactos: {
                include: {
                  tipo: true,
                },
              },
            },
          },
          estado: true,
          detalleConsumos: {
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
              unidad: true,
            },
          },
          detalleGenerados: {
            include: {
              productoTerminado: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true,
                  precio_venta: true,
                  stock_actual: true,
                },
              },
            },
          },
        },
      })
    })

    return NextResponse.json(produccionActualizada)
  } catch (error) {
    console.error('Error al completar producción:', error)
    return NextResponse.json({ error: 'Error al completar producción' }, { status: 500 })
  }
}
