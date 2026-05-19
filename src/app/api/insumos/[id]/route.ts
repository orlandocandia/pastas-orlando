import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/insumos/[id] - Obtener insumo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const insumo = await db.insumo.findUnique({
      where: { id: parseInt(id) },
      include: {
        tipoInsumo: true,
        unidadBase: true,
      },
    })

    if (!insumo) {
      return NextResponse.json({ error: 'Insumo no encontrado' }, { status: 404 })
    }

    return NextResponse.json(insumo)
  } catch (error) {
    console.error('Error al obtener insumo:', error)
    return NextResponse.json({ error: 'Error al obtener insumo' }, { status: 500 })
  }
}

// PUT /api/insumos/[id] - Actualizar insumo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      codigo,
      nombre,
      descripcion,
      id_tipo_insumo,
      id_unidad_base,
      stock_actual,
      stock_minimo,
      precio_compra_referencia,
      imagen,
      estado,
    } = body

    // Verificar código único (excluyendo el registro actual)
    if (codigo) {
      const existente = await db.insumo.findFirst({
        where: {
          codigo,
          id: { not: parseInt(id) },
        },
      })
      if (existente) {
        return NextResponse.json(
          { error: 'Ya existe otro insumo con ese código' },
          { status: 400 }
        )
      }
    }

    const insumo = await db.insumo.update({
      where: { id: parseInt(id) },
      data: {
        codigo: codigo !== undefined ? codigo || null : undefined,
        nombre: nombre || undefined,
        descripcion: descripcion !== undefined ? descripcion || null : undefined,
        id_tipo_insumo: id_tipo_insumo ? parseInt(id_tipo_insumo) : undefined,
        id_unidad_base: id_unidad_base ? parseInt(id_unidad_base) : undefined,
        stock_actual: stock_actual !== undefined ? parseFloat(stock_actual) : undefined,
        stock_minimo: stock_minimo !== undefined ? parseFloat(stock_minimo) : undefined,
        precio_compra_referencia: precio_compra_referencia !== undefined ? parseFloat(precio_compra_referencia) : undefined,
        imagen: imagen !== undefined ? imagen || null : undefined,
        estado: estado !== undefined ? estado : undefined,
      },
      include: {
        tipoInsumo: true,
        unidadBase: true,
      },
    })

    return NextResponse.json(insumo)
  } catch (error) {
    console.error('Error al actualizar insumo:', error)
    return NextResponse.json({ error: 'Error al actualizar insumo' }, { status: 500 })
  }
}

// DELETE /api/insumos/[id] - Eliminar insumo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const insumo = await db.insumo.findUnique({
      where: { id: parseInt(id) },
    })

    if (!insumo) {
      return NextResponse.json({ error: 'Insumo no encontrado' }, { status: 404 })
    }

    await db.insumo.delete({ where: { id: parseInt(id) } })

    return NextResponse.json({ message: 'Insumo eliminado' })
  } catch (error) {
    console.error('Error al eliminar insumo:', error)
    return NextResponse.json({ error: 'Error al eliminar insumo' }, { status: 500 })
  }
}
