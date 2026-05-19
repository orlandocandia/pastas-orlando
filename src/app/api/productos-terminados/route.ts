import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/productos-terminados - Listar productos terminados con filtros y paginación
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const buscar = searchParams.get('buscar')
    const id_categoria = searchParams.get('id_categoria')
    const estado = searchParams.get('estado')
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = parseInt(searchParams.get('limite') || '10')

    const where: Record<string, unknown> = {}
    if (id_categoria) where.id_categoria = parseInt(id_categoria)
    if (estado !== null && estado !== '') where.estado = estado === 'true'
    if (buscar) {
      where.OR = [
        { nombre: { contains: buscar } },
        { codigo: { contains: buscar } },
      ]
    }

    const [data, total] = await Promise.all([
      db.productoTerminado.findMany({
        where,
        include: {
          categoria: true,
        },
        orderBy: { nombre: 'asc' },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      db.productoTerminado.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    })
  } catch (error) {
    console.error('Error al obtener productos terminados:', error)
    return NextResponse.json({ error: 'Error al obtener productos terminados' }, { status: 500 })
  }
}

// POST /api/productos-terminados - Crear producto terminado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      codigo,
      nombre,
      descripcion,
      id_categoria,
      peso_unitario_aprox,
      precio_venta,
      stock_minimo,
      destacado,
      orden,
      visible_en_landing,
      imagen,
      estado,
    } = body

    // Verificar código único si se proporciona
    if (codigo) {
      const existente = await db.productoTerminado.findUnique({ where: { codigo } })
      if (existente) {
        return NextResponse.json(
          { error: 'Ya existe un producto terminado con ese código' },
          { status: 400 }
        )
      }
    }

    const productoTerminado = await db.productoTerminado.create({
      data: {
        codigo: codigo || null,
        nombre,
        descripcion: descripcion || null,
        id_categoria: parseInt(id_categoria),
        peso_unitario_aprox: parseFloat(peso_unitario_aprox) || 0,
        precio_venta: parseFloat(precio_venta) || 0,
        stock_minimo: parseFloat(stock_minimo) || 0,
        destacado: destacado === true,
        orden: parseInt(orden) || 0,
        visible_en_landing: visible_en_landing !== false,
        imagen: imagen || null,
        estado: estado !== false,
      },
      include: {
        categoria: true,
      },
    })

    return NextResponse.json(productoTerminado, { status: 201 })
  } catch (error) {
    console.error('Error al crear producto terminado:', error)
    return NextResponse.json({ error: 'Error al crear producto terminado' }, { status: 500 })
  }
}
