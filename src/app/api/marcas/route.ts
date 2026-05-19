import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/marcas - Listar todas las marcas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const buscar = searchParams.get('buscar')

    const where: Record<string, unknown> = {}
    if (buscar) {
      where.nombre = { contains: buscar }
    }

    const marcas = await db.marca.findMany({
      where,
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json(marcas)
  } catch (error) {
    console.error('Error al obtener marcas:', error)
    return NextResponse.json({ error: 'Error al obtener marcas' }, { status: 500 })
  }
}

// POST /api/marcas - Crear marca
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, descripcion } = body

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    // Verificar nombre único
    const existente = await db.marca.findUnique({ where: { nombre } })
    if (existente) {
      return NextResponse.json(
        { error: 'Ya existe una marca con ese nombre' },
        { status: 400 }
      )
    }

    const marca = await db.marca.create({
      data: {
        nombre,
        descripcion: descripcion || null,
      },
    })

    return NextResponse.json(marca, { status: 201 })
  } catch (error) {
    console.error('Error al crear marca:', error)
    return NextResponse.json({ error: 'Error al crear marca' }, { status: 500 })
  }
}

// PUT /api/marcas - Actualizar marca
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, nombre, descripcion } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    // Verificar nombre único (excluyendo la marca actual)
    if (nombre) {
      const existente = await db.marca.findFirst({
        where: {
          nombre,
          id: { not: parseInt(id) },
        },
      })
      if (existente) {
        return NextResponse.json(
          { error: 'Ya existe otra marca con ese nombre' },
          { status: 400 }
        )
      }
    }

    const marca = await db.marca.update({
      where: { id: parseInt(id) },
      data: {
        nombre: nombre || undefined,
        descripcion: descripcion !== undefined ? descripcion || null : undefined,
      },
    })

    return NextResponse.json(marca)
  } catch (error) {
    console.error('Error al actualizar marca:', error)
    return NextResponse.json({ error: 'Error al actualizar marca' }, { status: 500 })
  }
}

// DELETE /api/marcas - Eliminar marca
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    await db.marca.delete({ where: { id: parseInt(id) } })

    return NextResponse.json({ message: 'Marca eliminada' })
  } catch (error) {
    console.error('Error al eliminar marca:', error)
    return NextResponse.json({ error: 'Error al eliminar marca' }, { status: 500 })
  }
}
