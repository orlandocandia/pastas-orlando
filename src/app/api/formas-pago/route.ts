import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/formas-pago - Listar formas de pago
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nombre = searchParams.get('nombre')

    const where: Record<string, unknown> = {}
    if (nombre) {
      where.nombre_forma = { contains: nombre }
    }

    const formasPago = await db.formaPago.findMany({
      where,
      orderBy: { nombre_forma: 'asc' },
    })

    return NextResponse.json(formasPago)
  } catch (error) {
    console.error('Error al obtener formas de pago:', error)
    return NextResponse.json({ error: 'Error al obtener formas de pago' }, { status: 500 })
  }
}

// POST /api/formas-pago - Crear forma de pago
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre_forma, requiere_identificacion, requiere_cuenta } = body

    if (!nombre_forma) {
      return NextResponse.json(
        { error: 'El nombre de la forma de pago es requerido' },
        { status: 400 }
      )
    }

    // Verificar nombre único
    const existente = await db.formaPago.findUnique({
      where: { nombre_forma },
    })
    if (existente) {
      return NextResponse.json(
        { error: 'Ya existe una forma de pago con ese nombre' },
        { status: 400 }
      )
    }

    const formaPago = await db.formaPago.create({
      data: {
        nombre_forma,
        requiere_identificacion: requiere_identificacion === true,
        requiere_cuenta: requiere_cuenta === true,
      },
    })

    return NextResponse.json(formaPago, { status: 201 })
  } catch (error) {
    console.error('Error al crear forma de pago:', error)
    return NextResponse.json({ error: 'Error al crear forma de pago' }, { status: 500 })
  }
}
