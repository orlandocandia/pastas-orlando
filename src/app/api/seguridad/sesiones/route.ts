import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/seguridad/sesiones - Listar sesiones activas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idUsuario = searchParams.get('id_usuario')

    const where: Record<string, unknown> = {
      estado: 'active',
      fecha_expiracion: { gt: new Date() },
    }

    if (idUsuario) {
      where.id_usuario = parseInt(idUsuario)
    }

    const sesiones = await db.sesionActiva.findMany({
      where,
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
      orderBy: { fecha_inicio: 'desc' },
    })

    return NextResponse.json({
      data: sesiones,
      total: sesiones.length,
    })
  } catch (error) {
    console.error('Error al obtener sesiones activas:', error)
    return NextResponse.json(
      { error: 'Error al obtener sesiones activas' },
      { status: 500 }
    )
  }
}
