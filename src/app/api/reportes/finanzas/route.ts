import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/reportes/finanzas - Datos financieros (ingresos vs egresos, margen)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fecha_desde = searchParams.get('fecha_desde')
    const fecha_hasta = searchParams.get('fecha_hasta')

    // Ingresos (Ventas)
    const whereVentas: Record<string, unknown> = {}
    if (fecha_desde || fecha_hasta) {
      whereVentas.fecha_venta = {}
      if (fecha_desde) (whereVentas.fecha_venta as Record<string, unknown>).gte = new Date(fecha_desde)
      if (fecha_hasta) (whereVentas.fecha_venta as Record<string, unknown>).lte = new Date(fecha_hasta)
    }

    const ventas = await db.venta.findMany({
      where: whereVentas,
      include: {
        detalle: {
          include: {
            productoTerminado: { select: { nombre: true, precio_venta: true } },
          },
        },
      },
    })

    // Egresos (Compras)
    const whereCompras: Record<string, unknown> = {}
    if (fecha_desde || fecha_hasta) {
      whereCompras.fecha_compra = {}
      if (fecha_desde) (whereCompras.fecha_compra as Record<string, unknown>).gte = new Date(fecha_desde)
      if (fecha_hasta) (whereCompras.fecha_compra as Record<string, unknown>).lte = new Date(fecha_hasta)
    }

    const compras = await db.compra.findMany({ where: whereCompras })

    // Costos de producción
    const whereProduccion: Record<string, unknown> = {}
    if (fecha_desde || fecha_hasta) {
      whereProduccion.fecha_produccion = {}
      if (fecha_desde) (whereProduccion.fecha_produccion as Record<string, unknown>).gte = new Date(fecha_desde)
      if (fecha_hasta) (whereProduccion.fecha_produccion as Record<string, unknown>).lte = new Date(fecha_hasta)
    }

    const producciones = await db.produccion.findMany({ where: whereProduccion })

    const ingresos = ventas.reduce((acc, v) => acc + v.total, 0)
    const egresosCompras = compras.reduce((acc, c) => acc + c.total, 0)
    const egresosProduccion = producciones.reduce((acc, p) => acc + p.costo_total, 0)
    const totalEgresos = egresosCompras + egresosProduccion
    const resultado = ingresos - totalEgresos
    const margenPromedio = ingresos > 0 ? (resultado / ingresos) * 100 : 0

    // Margen por producto
    const margenPorProducto = new Map<string, { producto: string; ingreso: number; costoProduccion: number; margen: number }>()
    for (const venta of ventas) {
      for (const det of venta.detalle) {
        const nombre = det.productoTerminado.nombre
        const existing = margenPorProducto.get(nombre) || { producto: nombre, ingreso: 0, costoProduccion: 0, margen: 0 }
        existing.ingreso += det.subtotal
        margenPorProducto.set(nombre, existing)
      }
    }

    // Estimar costo de producción por producto usando las producciones
    for (const prod of producciones) {
      const receta = await db.receta.findUnique({
        where: { id: prod.id_receta },
        include: { productoTerminado: { select: { nombre: true } } },
      })
      if (receta) {
        const nombre = receta.productoTerminado.nombre
        const existing = margenPorProducto.get(nombre) || { producto: nombre, ingreso: 0, costoProduccion: 0, margen: 0 }
        existing.costoProduccion += prod.costo_total
        margenPorProducto.set(nombre, existing)
      }
    }

    const margenesPorProducto = Array.from(margenPorProducto.values()).map(m => ({
      ...m,
      margen: m.ingreso > 0 ? ((m.ingreso - m.costoProduccion) / m.ingreso) * 100 : 0,
    })).sort((a, b) => b.margen - a.margen)

    // Datos por mes (para gráfico)
    const mesMap = new Map<string, { mes: string; ingresos: number; egresosCompras: number; egresosProduccion: number }>()
    for (const v of ventas) {
      const mes = new Date(v.fecha_venta).toISOString().substring(0, 7)
      const existing = mesMap.get(mes) || { mes, ingresos: 0, egresosCompras: 0, egresosProduccion: 0 }
      existing.ingresos += v.total
      mesMap.set(mes, existing)
    }
    for (const c of compras) {
      const mes = new Date(c.fecha_compra).toISOString().substring(0, 7)
      const existing = mesMap.get(mes) || { mes, ingresos: 0, egresosCompras: 0, egresosProduccion: 0 }
      existing.egresosCompras += c.total
      mesMap.set(mes, existing)
    }
    for (const p of producciones) {
      const mes = new Date(p.fecha_produccion).toISOString().substring(0, 7)
      const existing = mesMap.get(mes) || { mes, ingresos: 0, egresosCompras: 0, egresosProduccion: 0 }
      existing.egresosProduccion += p.costo_total
      mesMap.set(mes, existing)
    }
    const datosPorMes = Array.from(mesMap.values()).sort((a, b) => a.mes.localeCompare(b.mes))

    return NextResponse.json({
      resumen: {
        ingresos,
        egresosCompras,
        egresosProduccion,
        totalEgresos,
        resultado,
        margenPromedio,
        cantidadVentas: ventas.length,
        cantidadCompras: compras.length,
      },
      datosPorMes,
      margenesPorProducto,
    })
  } catch (error) {
    console.error('Error al obtener reporte financiero:', error)
    return NextResponse.json({ error: 'Error al obtener reporte financiero' }, { status: 500 })
  }
}
