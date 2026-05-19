import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/productos-terminados/public - Landing page (público, sin auth)
export async function GET() {
  try {
    const productos = await db.productoTerminado.findMany({
      where: {
        visible_en_landing: true,
        estado: true,
      },
      orderBy: [
        { destacado: 'desc' },
        { orden: 'asc' },
        { nombre: 'asc' },
      ],
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        precio_venta: true,
        peso_unitario_aprox: true,
        imagen: true,
        stock_actual: true,
        destacado: true,
        categoria: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    })

    return NextResponse.json({ productos })
  } catch (error) {
    console.error('Error al obtener productos públicos:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}
