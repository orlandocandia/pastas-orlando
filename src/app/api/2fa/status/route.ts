import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/2fa/status - Verificar estado de 2FA para un usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idUsuario = searchParams.get('id_usuario')

    if (!idUsuario) {
      return NextResponse.json(
        { error: 'id_usuario es requerido' },
        { status: 400 }
      )
    }

    const twoFA = await db.usuario2FA.findUnique({
      where: { id_usuario: parseInt(idUsuario) },
      select: {
        activado: true,
        fecha_activacion: true,
        fecha_ultimo_uso: true,
      },
    })

    if (!twoFA) {
      return NextResponse.json({
        activado: false,
      })
    }

    return NextResponse.json({
      activado: twoFA.activado,
      fecha_activacion: twoFA.fecha_activacion?.toISOString() || null,
      fecha_ultimo_uso: twoFA.fecha_ultimo_uso?.toISOString() || null,
    })
  } catch (error) {
    console.error('Error al verificar estado 2FA:', error)
    return NextResponse.json(
      { error: 'Error al verificar estado 2FA' },
      { status: 500 }
    )
  }
}
