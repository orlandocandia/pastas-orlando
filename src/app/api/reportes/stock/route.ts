import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/reportes/stock - Datos para reporte de stock
export async function GET() {
  try {
    // Materias Primas
    const materiasPrimas = await db.materiaPrima.findMany({
      where: { estado: true },
      include: { categoria: true, unidadBase: true },
      orderBy: { nombre: 'asc' },
    })

    // Insumos
    const insumos = await db.insumo.findMany({
      where: { estado: true },
      include: { tipoInsumo: true, unidadBase: true },
      orderBy: { nombre: 'asc' },
    })

    // Productos Terminados
    const productosTerminados = await db.productoTerminado.findMany({
      where: { estado: true },
      include: { categoria: true },
      orderBy: { nombre: 'asc' },
    })

    // Stock crítico (MP e Insumos por debajo del mínimo)
    const mpCritico = materiasPrimas.filter(mp => mp.stock_actual <= mp.stock_minimo)
    const insumoCritico = insumos.filter(ins => ins.stock_actual <= ins.stock_minimo)
    const ptCritico = productosTerminados.filter(pt => pt.stock_actual <= pt.stock_minimo)

    // Valorización de stock
    const valorMP = materiasPrimas.reduce((acc, mp) => acc + (mp.stock_actual * mp.precio_compra_referencia), 0)
    const valorInsumos = insumos.reduce((acc, ins) => acc + (ins.stock_actual * ins.precio_compra_referencia), 0)
    const valorPT = productosTerminados.reduce((acc, pt) => acc + (pt.stock_actual * pt.precio_venta), 0)

    return NextResponse.json({
      resumen: {
        totalMP: materiasPrimas.length,
        totalInsumos: insumos.length,
        totalPT: productosTerminados.length,
        stockCriticoMP: mpCritico.length,
        stockCriticoInsumos: insumoCritico.length,
        stockCriticoPT: ptCritico.length,
        valorStockMP: valorMP,
        valorStockInsumos: valorInsumos,
        valorStockPT: valorPT,
        valorStockTotal: valorMP + valorInsumos + valorPT,
      },
      alertasStock: [...mpCritico.map(mp => ({
        tipo: 'Materia Prima',
        nombre: mp.nombre,
        stock_actual: mp.stock_actual,
        stock_minimo: mp.stock_minimo,
        unidad: mp.unidadBase?.codigo || '',
      })), ...insumoCritico.map(ins => ({
        tipo: 'Insumo',
        nombre: ins.nombre,
        stock_actual: ins.stock_actual,
        stock_minimo: ins.stock_minimo,
        unidad: ins.unidadBase?.codigo || '',
      })), ...ptCritico.map(pt => ({
        tipo: 'Producto Terminado',
        nombre: pt.nombre,
        stock_actual: pt.stock_actual,
        stock_minimo: pt.stock_minimo,
        unidad: 'u',
      }))],
      materiasPrimas,
      insumos,
      productosTerminados,
    })
  } catch (error) {
    console.error('Error al obtener reporte de stock:', error)
    return NextResponse.json({ error: 'Error al obtener reporte de stock' }, { status: 500 })
  }
}
