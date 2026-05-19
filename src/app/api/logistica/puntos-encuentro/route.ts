import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/logistica/puntos-encuentro - Listar puntos de encuentro
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activo = searchParams.get('activo')

    const where: Record<string, unknown> = {}

    if (activo === 'true') where.activo = true
    else if (activo === 'false') where.activo = false

    const puntos = await db.puntoEncuentro.findMany({
      where,
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json(puntos)
  } catch (error) {
    console.error('Error al obtener puntos de encuentro:', error)
    return NextResponse.json({ error: 'Error al obtener puntos de encuentro' }, { status: 500 })
  }
}

// POST /api/logistica/puntos-encuentro - Crear punto de encuentro
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, direccion, latitud, longitud, horarios, activo } = body

    if (!nombre || !direccion) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: nombre, direccion' },
        { status: 400 }
      )
    }

    const punto = await db.puntoEncuentro.create({
      data: {
        nombre,
        direccion,
        latitud: latitud !== undefined ? parseFloat(latitud) : null,
        longitud: longitud !== undefined ? parseFloat(longitud) : null,
        horarios: horarios || null,
        activo: activo !== undefined ? activo : true,
      },
    })

    return NextResponse.json(punto, { status: 201 })
  } catch (error) {
    console.error('Error al crear punto de encuentro:', error)
    return NextResponse.json({ error: 'Error al crear punto de encuentro' }, { status: 500 })
  }
}
