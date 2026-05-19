import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import speakeasy from 'speakeasy'
import { registrarAuditoria, ModuloAuditoria, AccionAuditoria } from '@/lib/auditoria-service'

// POST /api/2fa/verify - Verificar código TOTP y activar 2FA
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

    if (!twoFA || !twoFA.secret_2fa) {
      return NextResponse.json(
        { error: 'No se ha generado un secreto 2FA para este usuario. Active 2FA primero.' },
        { status: 400 }
      )
    }

    if (twoFA.activado) {
      return NextResponse.json(
        { error: '2FA ya está activado para este usuario' },
        { status: 400 }
      )
    }

    // Verificar el código TOTP
    const verified = speakeasy.totp.verify({
      secret: twoFA.secret_2fa,
      encoding: 'base32',
      token: codigo,
    })

    if (!verified) {
      // Registrar intento fallido en auditoría
      await registrarAuditoria({
        id_usuario,
        accion: AccionAuditoria.UPDATE,
        modulo: ModuloAuditoria.USUARIOS,
        entidad_id: id_usuario,
        entidad_nombre: `${usuario.persona.nombre} ${usuario.persona.apellido}`,
        detalles: { accion: '2fa_verificacion_fallida' },
      })

      return NextResponse.json({ success: false, error: 'Código inválido' })
    }

    // Generar códigos de respaldo (10 códigos alfanuméricos de 8 caracteres)
    const codigosRespaldo: string[] = []
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    for (let i = 0; i < 10; i++) {
      let codigoRespaldo = ''
      for (let j = 0; j < 8; j++) {
        codigoRespaldo += caracteres.charAt(
          Math.floor(Math.random() * caracteres.length)
        )
      }
      codigosRespaldo.push(codigoRespaldo)
    }

    // Activar 2FA y guardar códigos de respaldo
    await db.usuario2FA.update({
      where: { id_usuario },
      data: {
        activado: true,
        codigos_respaldo: JSON.stringify(codigosRespaldo),
        fecha_activacion: new Date(),
      },
    })

    // Registrar en auditoría
    await registrarAuditoria({
      id_usuario,
      accion: AccionAuditoria.UPDATE,
      modulo: ModuloAuditoria.USUARIOS,
      entidad_id: id_usuario,
      entidad_nombre: `${usuario.persona.nombre} ${usuario.persona.apellido}`,
      detalles: { accion: '2fa_activado' },
    })

    return NextResponse.json({
      success: true,
      codigos_respaldo: codigosRespaldo,
    })
  } catch (error) {
    console.error('Error al verificar 2FA:', error)
    return NextResponse.json(
      { error: 'Error al verificar código 2FA' },
      { status: 500 }
    )
  }
}
