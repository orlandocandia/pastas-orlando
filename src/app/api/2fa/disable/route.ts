import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import speakeasy from 'speakeasy'
import { registrarAuditoria, ModuloAuditoria, AccionAuditoria } from '@/lib/auditoria-service'

// POST /api/2fa/disable - Desactivar 2FA para un usuario
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id_usuario, codigo } = body

    if (!id_usuario || !codigo) {
      return NextResponse.json(
        { error: 'id_usuario y codigo son requeridos' },
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

    // Obtener el registro 2FA del usuario
    const twoFA = await db.usuario2FA.findUnique({
      where: { id_usuario },
    })

    if (!twoFA || !twoFA.activado) {
      return NextResponse.json(
        { error: '2FA no está activado para este usuario' },
        { status: 400 }
      )
    }

    // Verificar el código TOTP o código de respaldo
    let verified = false

    // Primero verificar como código TOTP
    if (twoFA.secret_2fa) {
      verified = speakeasy.totp.verify({
        secret: twoFA.secret_2fa,
        encoding: 'base32',
        token: codigo,
      })
    }

    // Si no es TOTP válido, verificar como código de respaldo
    if (!verified && twoFA.codigos_respaldo) {
      const codigosRespaldo: string[] = JSON.parse(twoFA.codigos_respaldo)
      const indice = codigosRespaldo.indexOf(codigo.toUpperCase())
      if (indice !== -1) {
        verified = true
        // Remover el código de respaldo usado
        codigosRespaldo.splice(indice, 1)
        await db.usuario2FA.update({
          where: { id_usuario },
          data: {
            codigos_respaldo: JSON.stringify(codigosRespaldo),
          },
        })
      }
    }

    if (!verified) {
      return NextResponse.json({
        success: false,
        error: 'Código inválido',
      })
    }

    // Desactivar 2FA y limpiar secreto
    await db.usuario2FA.update({
      where: { id_usuario },
      data: {
        activado: false,
        secret_2fa: null,
        codigos_respaldo: null,
        fecha_activacion: null,
      },
    })

    // Registrar en auditoría
    await registrarAuditoria({
      id_usuario,
      accion: AccionAuditoria.UPDATE,
      modulo: ModuloAuditoria.USUARIOS,
      entidad_id: id_usuario,
      entidad_nombre: `${usuario.persona.nombre} ${usuario.persona.apellido}`,
      detalles: { accion: '2fa_desactivado' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al desactivar 2FA:', error)
    return NextResponse.json(
      { error: 'Error al desactivar 2FA' },
      { status: 500 }
    )
  }
}
