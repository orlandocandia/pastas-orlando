import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

// POST /api/2fa/activate - Generar secreto 2FA y código QR para un usuario
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id_usuario } = body

    if (!id_usuario) {
      return NextResponse.json(
        { error: 'id_usuario es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const usuario = await db.usuario.findUnique({
      where: { id: id_usuario },
      include: { persona: true },
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si ya tiene 2FA activado
    const twoFAExistente = await db.usuario2FA.findUnique({
      where: { id_usuario },
    })

    if (twoFAExistente?.activado) {
      return NextResponse.json(
        { error: 'El usuario ya tiene 2FA activado. Desactívelo primero.' },
        { status: 400 }
      )
    }

    // Generar secreto TOTP
    const userEmail = usuario.email
    const secret = speakeasy.generateSecret({
      name: `Pastas Orlando (${userEmail})`,
      length: 20,
    })

    // Generar código QR como data URL
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

    // Guardar o actualizar el secreto (aún no activado)
    if (twoFAExistente) {
      await db.usuario2FA.update({
        where: { id_usuario },
        data: {
          secret_2fa: secret.base32,
          activado: false,
          codigos_respaldo: null,
          fecha_activacion: null,
        },
      })
    } else {
      await db.usuario2FA.create({
        data: {
          id_usuario,
          secret_2fa: secret.base32,
          activado: false,
        },
      })
    }

    return NextResponse.json({
      secret: secret.base32,
      qr_code: qrCodeUrl,
      otpauth_url: secret.otpauth_url,
    })
  } catch (error) {
    console.error('Error al activar 2FA:', error)
    return NextResponse.json(
      { error: 'Error al generar secreto 2FA' },
      { status: 500 }
    )
  }
}
