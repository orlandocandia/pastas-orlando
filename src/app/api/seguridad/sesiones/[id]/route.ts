import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { registrarAuditoria, ModuloAuditoria, AccionAuditoria } from '@/lib/auditoria-service'

// DELETE /api/seguridad/sesiones/[id] - Cerrar/revocar una sesión
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar que la sesión existe
    const sesion = await db.sesionActiva.findUnique({
      where: { id_sesion: id },
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

    if (!sesion) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      )
    }

    // Revocar la sesión
    await db.sesionActiva.update({
      where: { id_sesion: id },
      data: {
        estado: 'revoked',
        fecha_fin: new Date(),
      },
    })

    // Registrar en auditoría
    await registrarAuditoria({
      id_usuario: sesion.id_usuario,
      accion: AccionAuditoria.UPDATE,
      modulo: ModuloAuditoria.USUARIOS,
      entidad_id: sesion.id_usuario,
      entidad_nombre: `${sesion.usuario.persona.nombre} ${sesion.usuario.persona.apellido}`,
      detalles: {
        accion: 'sesion_revocada',
        id_sesion: id,
        ip_sesion: sesion.ip,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al revocar sesión:', error)
    return NextResponse.json(
      { error: 'Error al revocar sesión' },
      { status: 500 }
    )
  }
}
