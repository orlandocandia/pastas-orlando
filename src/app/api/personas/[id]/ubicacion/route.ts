import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/personas/[id]/ubicacion - Actualizar ubicación de persona
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { latitud, longitud, direccion_mapa } = body

    // Validar que la persona existe
    const personaExistente = await db.persona.findUnique({
      where: { id: parseInt(id) },
    })

    if (!personaExistente) {
      return NextResponse.json(
        { error: 'Persona no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar ubicación
    const persona = await db.persona.update({
      where: { id: parseInt(id) },
      data: {
        latitud,
        longitud,
        direccion_mapa: direccion_mapa || null,
        ubicacion_valida: true,
        fecha_actualizacion: new Date(),
      },
      include: {
        municipio: true,
        contactos: { include: { tipo: true } },
        direcciones: { include: { tipo: true, municipio: true } },
      },
    })

    return NextResponse.json(persona)
  } catch (error) {
    console.error('Error al actualizar ubicación:', error)
    return NextResponse.json(
      { error: 'Error al actualizar ubicación' },
      { status: 500 }
    )
  }
}
