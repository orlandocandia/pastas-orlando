import { db } from '@/lib/db'

/**
 * Verifica si un usuario tiene un permiso específico
 */
export async function usuarioTienePermiso(
  usuarioId: number,
  permisoRequerido: string
): Promise<boolean> {
  const usuario = await db.usuario.findUnique({
    where: { id: usuarioId },
    include: {
      roles: {
        include: {
          rol: {
            include: {
              permisos: {
                include: { permiso: true },
              },
            },
          },
        },
      },
    },
  })

  if (!usuario) return false

  const permisosUsuario = usuario.roles.flatMap((ur) =>
    ur.rol.permisos.map((rp) => rp.permiso.nombre)
  )

  return permisosUsuario.includes(permisoRequerido)
}

/**
 * Obtiene todos los permisos de un usuario
 */
export async function obtenerPermisosUsuario(
  usuarioId: number
): Promise<string[]> {
  const usuario = await db.usuario.findUnique({
    where: { id: usuarioId },
    include: {
      roles: {
        include: {
          rol: {
            include: {
              permisos: {
                include: { permiso: true },
              },
            },
          },
        },
      },
    },
  })

  if (!usuario) return []

  return usuario.roles.flatMap((ur) =>
    ur.rol.permisos.map((rp) => rp.permiso.nombre)
  )
}

/**
 * Obtiene los roles de un usuario
 */
export async function obtenerRolesUsuario(
  usuarioId: number
): Promise<string[]> {
  const usuario = await db.usuario.findUnique({
    where: { id: usuarioId },
    include: {
      roles: {
        include: { rol: true },
      },
    },
  })

  if (!usuario) return []

  return usuario.roles.map((ur) => ur.rol.nombre)
}

/**
 * Verifica si un usuario tiene al menos uno de los permisos requeridos
 */
export async function usuarioTieneAlgunPermiso(
  usuarioId: number,
  permisosRequeridos: string[]
): Promise<boolean> {
  const permisos = await obtenerPermisosUsuario(usuarioId)
  return permisosRequeridos.some((p) => permisos.includes(p))
}

/**
 * Obtiene todos los permisos agrupados por módulo
 */
export async function obtenerPermisosPorModulo() {
  const permisos = await db.permiso.findMany({
    orderBy: [{ modulo: 'asc' }, { nombre: 'asc' }],
    include: {
      roles: {
        include: { rol: true },
      },
    },
  })

  const agrupados: Record<string, typeof permisos> = {}
  for (const permiso of permisos) {
    const mod = permiso.modulo || 'general'
    if (!agrupados[mod]) agrupados[mod] = []
    agrupados[mod].push(permiso)
  }

  return agrupados
}
