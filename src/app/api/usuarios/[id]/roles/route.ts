import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { registrarAuditoria, ModuloAuditoria, AccionAuditoria } from '@/lib/auditoria-service'

// PUT /api/usuarios/[id]/roles - Asignar roles a un usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idUsuario = parseInt(id)
    const body = await request.json()
    const { id_roles } = body

    if (!Array.isArray(id_roles)) {
      return NextResponse.json(
        { error: 'id_roles debe ser un array de números' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const usuario = await db.usuario.findUnique({
      where: { id: idUsuario },
      include: {
        roles: { include: { rol: true } },
        persona: { select: { nombre: true, apellido: true } },
      },
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que todos los roles existen
    if (id_roles.length > 0) {
      const rolesExistentes = await db.rol.findMany({
        where: { id: { in: id_roles } },
      })
      if (rolesExistentes.length !== id_roles.length) {
        return NextResponse.json(
          { error: 'Uno o más roles no existen' },
          { status: 400 }
        )
      }
    }

    // Guardar roles anteriores para auditoría
    const rolesAnteriores = usuario.roles.map((ur) => ur.rol.nombre)

    // Eliminar roles existentes
    await db.usuarioRol.deleteMany({
      where: { id_usuario: idUsuario },
    })

    // Crear nuevos roles
    if (id_roles.length > 0) {
      await db.usuarioRol.createMany({
        data: id_roles.map((id_rol: number) => ({
          id_usuario: idUsuario,
          id_rol,
        })),
      })
    }

    // Obtener el usuario actualizado
    const usuarioActualizado = await db.usuario.findUnique({
      where: { id: idUsuario },
      include: {
        roles: { include: { rol: true } },
      },
    })

    const rolesNuevos = usuarioActualizado?.roles.map((ur) => ur.rol.nombre) || []

    // Registrar en auditoría
    await registrarAuditoria({
      id_usuario: idUsuario,
      accion: AccionAuditoria.UPDATE,
      modulo: ModuloAuditoria.USUARIOS,
      entidad_id: idUsuario,
      entidad_nombre: `${usuario.persona.nombre} ${usuario.persona.apellido}`,
      detalles: {
        accion: 'cambio_roles',
        roles_anteriores: rolesAnteriores,
        roles_nuevos: rolesNuevos,
      },
    })

    return NextResponse.json({
      message: 'Roles actualizados correctamente',
      roles: usuarioActualizado?.roles.map((ur) => ({
        id: ur.rol.id,
        nombre: ur.rol.nombre,
        descripcion: ur.rol.descripcion,
      })),
    })
  } catch (error) {
    console.error('Error al asignar roles:', error)
    return NextResponse.json(
      { error: 'Error al asignar roles' },
      { status: 500 }
    )
  }
}
