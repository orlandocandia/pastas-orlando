import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/estados-generales - Listar estados generales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entidad_aplicable = searchParams.get('entidad_aplicable')

    const where: Record<string, unknown> = {}
    if (entidad_aplicable) {
      where.entidad_aplicable = { contains: entidad_aplicable }
    }

    const estadosGenerales = await db.estadoGeneral.findMany({
      where,
      orderBy: { nombre_estado: 'asc' },
    })

    return NextResponse.json(estadosGenerales)
  } catch (error) {
    console.error('Error al obtener estados generales:', error)
    return NextResponse.json({ error: 'Error al obtener estados generales' }, { status: 500 })
  }
}

// POST /api/estados-generales - Crear estado general
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre_estado, entidad_aplicable, es_final } = body

    if (!nombre_estado) {
      return NextResponse.json(
        { error: 'El nombre del estado es requerido' },
        { status: 400 }
      )
    }

    // Verificar nombre único
    const existente = await db.estadoGeneral.findUnique({
      where: { nombre_estado },
    })
    if (existente) {
      return NextResponse.json(
        { error: 'Ya existe un estado general con ese nombre' },
        { status: 400 }
      )
    }

    const estadoGeneral = await db.estadoGeneral.create({
      data: {
        nombre_estado,
        entidad_aplicable: entidad_aplicable || null,
        es_final: es_final === true,
      },
    })

    return NextResponse.json(estadoGeneral, { status: 201 })
  } catch (error) {
    console.error('Error al crear estado general:', error)
    return NextResponse.json({ error: 'Error al crear estado general' }, { status: 500 })
  }
}
