import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/reportes/compras - Datos para reporte de compras
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fecha_desde = searchParams.get('fecha_desde')
    const fecha_hasta = searchParams.get('fecha_hasta')

    const where: Record<string, unknown> = {}
    if (fecha_desde || fecha_hasta) {
      where.fecha_compra = {}
      if (fecha_desde) (where.fecha_compra as Record<string, unknown>).gte = new Date(fecha_desde)
      if (fecha_hasta) (where.fecha_compra as Record<string, unknown>).lte = new Date(fecha_hasta)
    }

    const compras = await db.compra.findMany({
      where,
      include: {
        proveedor: {
          select: { id: true, nombre: true, apellido: true, razon_social: true },
        },
        formaPago: true,
        estado: true,
        detalle: {
          include: {
            materiaPrima: { select: { id: true, nombre: true } },
            insumo: { select: { id: true, nombre: true } },
            marca: { select: { id: true, nombre: true } },
          },
        },
      },
      orderBy: { fecha_compra: 'desc' },
    })

    const totalCompras = compras.reduce((acc, c) => acc + c.total, 0)
    const cantidadCompras = compras.length

    // Proveedores más utilizados
    const proveedoresMap = new Map<number, { nombre: string; compras: number; total: number }>()
    for (const compra of compras) {
      const key = compra.id_proveedor
      const nombre = compra.proveedor.razon_social || `${compra.proveedor.nombre} ${compra.proveedor.apellido}`
      const existing = proveedoresMap.get(key) || { nombre, compras: 0, total: 0 }
      existing.compras += 1
      existing.total += compra.total
      proveedoresMap.set(key, existing)
    }
    const proveedoresMasUtilizados = Array.from(proveedoresMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    // Productos más comprados
    const productosMap = new Map<string, { nombre: string; cantidad: number; total: number }>()
    for (const compra of compras) {
      for (const det of compra.detalle) {
        const nombre = det.materiaPrima?.nombre || det.insumo?.nombre || 'Sin nombre'
        const existing = productosMap.get(nombre) || { nombre, cantidad: 0, total: 0 }
        existing.cantidad += det.cantidad_comprada
        existing.total += det.precio_total
        productosMap.set(nombre, existing)
      }
    }
    const productosMasComprados = Array.from(productosMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    return NextResponse.json({
      resumen: { totalCompras, cantidadCompras, promedioCompra: cantidadCompras > 0 ? totalCompras / cantidadCompras : 0 },
      proveedoresMasUtilizados,
      productosMasComprados,
      compras,
    })
  } catch (error) {
    console.error('Error al obtener reporte de compras:', error)
    return NextResponse.json({ error: 'Error al obtener reporte de compras' }, { status: 500 })
  }
}
