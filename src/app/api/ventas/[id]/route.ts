import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const ventaIncludes = {
  cliente: {
    select: {
      id: true,
      nombre: true,
      apellido: true,
      razon_social: true,
      numero_documento: true,
      tipo_persona: true,
    },
  },
  vendedor: {
    select: {
      id: true,
      email: true,
      persona: {
        select: {
          nombre: true,
          apellido: true,
        },
      },
    },
  },
  formaPago: true,
  estado: true,
  pedido: {
    include: {
      estado: true,
      detalle: {
        include: {
          productoTerminado: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
            },
          },
        },
      },
    },
  },
  detalle: {
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
}

// GET /api/ventas/[id] - Obtener una venta por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const venta = await db.venta.findUnique({
      where: { id: parseInt(id) },
      include: ventaIncludes,
    })

    if (!venta) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })
    }

    return NextResponse.json(venta)
  } catch (error) {
    console.error('Error al obtener venta:', error)
    return NextResponse.json({ error: 'Error al obtener venta' }, { status: 500 })
  }
}

// PUT /api/ventas/[id] - Actualizar venta (estado, numero_comprobante)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { id_estado, numero_comprobante } = body

    const ventaExistente = await db.venta.findUnique({
      where: { id: parseInt(id) },
    })
    if (!ventaExistente) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (id_estado !== undefined) updateData.id_estado = parseInt(id_estado)
    if (numero_comprobante !== undefined) updateData.numero_comprobante = numero_comprobante || null

    const venta = await db.venta.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: ventaIncludes,
    })

    return NextResponse.json(venta)
  } catch (error) {
    console.error('Error al actualizar venta:', error)
    return NextResponse.json({ error: 'Error al actualizar venta' }, { status: 500 })
  }
}
