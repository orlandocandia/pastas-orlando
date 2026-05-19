import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/reportes/compras-pendientes - Productos con stock bajo
export async function GET() {
  try {
    // Materias primas con stock bajo
    const materiasPrimas = (await db.materiaPrima.findMany({
      where: { estado: true },
      include: { categoria: true, unidadBase: true },
    })).filter(mp => mp.stock_actual <= mp.stock_minimo)

    // Insumos con stock bajo
    const insumos = (await db.insumo.findMany({
      where: { estado: true },
      include: { tipoInsumo: true, unidadBase: true },
    })).filter(i => i.stock_actual <= i.stock_minimo)

    // Productos terminados con stock bajo
    const productosTerminados = (await db.productoTerminado.findMany({
      where: { estado: true },
      include: { categoria: true },
    })).filter(pt => pt.stock_actual <= pt.stock_minimo)

    return NextResponse.json({
      materiasPrimas: materiasPrimas.map(mp => ({
        ...mp,
        tipo: 'materia_prima',
        cantidad_sugerida: mp.stock_minimo - mp.stock_actual + Math.ceil(mp.stock_minimo * 0.5),
      })),
      insumos: insumos.map(i => ({
        ...i,
        tipo: 'insumo',
        cantidad_sugerida: i.stock_minimo - i.stock_actual + Math.ceil(i.stock_minimo * 0.5),
      })),
      productosTerminados: productosTerminados.map(pt => ({
        ...pt,
        tipo: 'producto_terminado',
        cantidad_sugerida: pt.stock_minimo - pt.stock_actual + Math.ceil(pt.stock_minimo * 0.5),
      })),
      totalItems: materiasPrimas.length + insumos.length + productosTerminados.length,
    })
  } catch (error) {
    console.error('Error al generar reporte:', error)
    return NextResponse.json({ error: 'Error al generar reporte de compras pendientes' }, { status: 500 })
  }
}
