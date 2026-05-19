import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/notificaciones/plantillas - Listar todas las plantillas con conteo de notificaciones
export async function GET() {
  try {
    const plantillas = await db.plantillaNotificacion.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { notificaciones: true },
        },
      },
    })

    // Mapear para incluir el conteo como campo plano
    const result = plantillas.map(p => ({
      id: p.id,
      nombre: p.nombre,
      canal: p.canal,
      asunto: p.asunto,
      mensaje: p.mensaje,
      activo: p.activo,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      notificacionesCount: p._count.notificaciones,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error al obtener plantillas de notificación:', error)
    return NextResponse.json(
      { error: 'Error al obtener plantillas de notificación' },
      { status: 500 }
    )
  }
}
