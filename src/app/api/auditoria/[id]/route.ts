import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/auditoria/[id] - Detalle de un evento de auditoría
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auditoria = await db.auditoria.findUnique({
      where: { id: parseInt(id) },
      include: {
        usuario: {
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
      },
    })

    if (!auditoria) {
      return NextResponse.json({ error: 'Evento de auditoría no encontrado' }, { status: 404 })
    }

    return NextResponse.json(auditoria)
  } catch (error) {
    console.error('Error al obtener detalle de auditoría:', error)
    return NextResponse.json({ error: 'Error al obtener detalle de auditoría' }, { status: 500 })
  }
}
