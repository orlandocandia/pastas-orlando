import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/productos-terminados/[id] - Obtener producto terminado por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productoTerminado = await db.productoTerminado.findUnique({
      where: { id: parseInt(id) },
      include: {
        categoria: true,
      },
    })

    if (!productoTerminado) {
      return NextResponse.json({ error: 'Producto terminado no encontrado' }, { status: 404 })
    }

    return NextResponse.json(productoTerminado)
  } catch (error) {
    console.error('Error al obtener producto terminado:', error)
    return NextResponse.json({ error: 'Error al obtener producto terminado' }, { status: 500 })
  }
}

// PUT /api/productos-terminados/[id] - Actualizar producto terminado
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      codigo,
      codigo_barras,
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

    // Verificar código único (excluyendo el registro actual)
    if (codigo) {
      const existente = await db.productoTerminado.findFirst({
        where: {
          codigo,
          id: { not: parseInt(id) },
        },
      })
      if (existente) {
        return NextResponse.json(
          { error: 'Ya existe otro producto terminado con ese código' },
          { status: 400 }
        )
      }
    }

    // Verificar código de barras único (excluyendo el registro actual)
    if (codigo_barras) {
      const existenteCB = await db.productoTerminado.findFirst({
        where: {
          codigo_barras,
          id: { not: parseInt(id) },
        },
      })
      if (existenteCB) {
        return NextResponse.json(
          { error: 'Ya existe otro producto terminado con ese código de barras' },
          { status: 400 }
        )
      }
    }

    const productoTerminado = await db.productoTerminado.update({
      where: { id: parseInt(id) },
      data: {
        codigo: codigo !== undefined ? codigo || null : undefined,
        codigo_barras: codigo_barras !== undefined ? codigo_barras || null : undefined,
        nombre: nombre || undefined,
        descripcion: descripcion !== undefined ? descripcion || null : undefined,
        id_categoria: id_categoria ? parseInt(id_categoria) : undefined,
        peso_unitario_aprox: peso_unitario_aprox !== undefined ? parseFloat(peso_unitario_aprox) : undefined,
        precio_venta: precio_venta !== undefined ? parseFloat(precio_venta) : undefined,
        stock_minimo: stock_minimo !== undefined ? parseFloat(stock_minimo) : undefined,
        destacado: destacado !== undefined ? destacado : undefined,
        orden: orden !== undefined ? parseInt(orden) : undefined,
        visible_en_landing: visible_en_landing !== undefined ? visible_en_landing : undefined,
        imagen: imagen !== undefined ? imagen || null : undefined,
        estado: estado !== undefined ? estado : undefined,
      },
      include: {
        categoria: true,
      },
    })

    return NextResponse.json(productoTerminado)
  } catch (error) {
    console.error('Error al actualizar producto terminado:', error)
    return NextResponse.json({ error: 'Error al actualizar producto terminado' }, { status: 500 })
  }
}

// DELETE /api/productos-terminados/[id] - Eliminar producto terminado
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const productoTerminado = await db.productoTerminado.findUnique({
      where: { id: parseInt(id) },
    })

    if (!productoTerminado) {
      return NextResponse.json({ error: 'Producto terminado no encontrado' }, { status: 404 })
    }

    await db.productoTerminado.delete({ where: { id: parseInt(id) } })

    return NextResponse.json({ message: 'Producto terminado eliminado' })
  } catch (error) {
    console.error('Error al eliminar producto terminado:', error)
    return NextResponse.json({ error: 'Error al eliminar producto terminado' }, { status: 500 })
  }
}
