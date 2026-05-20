import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/usuarios/permisos - Listar permisos agrupados por módulo con roles asignados
export async function GET() {
  try {
    const [permisos, roles] = await Promise.all([
      db.permiso.findMany({
        orderBy: [{ modulo: 'asc' }, { nombre: 'asc' }],
        include: {
          roles: {
            include: {
              rol: {
                select: {
                  id: true,
                  nombre: true,
                  descripcion: true,
                },
              },
            },
          },
        },
      }),
      db.rol.findMany({
        orderBy: { nombre: 'asc' },
        include: {
          permisos: {
            include: {
              permiso: {
                select: {
                  id: true,
                  nombre: true,
                  modulo: true,
                },
              },
            },
          },
          _count: {
            select: { usuarios: true },
          },
        },
      }),
    ])

    // Transformar permisos para incluir la lista de roles que lo tienen
    const permisosFormateados = permisos.map((permiso) => ({
      id: permiso.id,
      nombre: permiso.nombre,
      descripcion: permiso.descripcion,
      modulo: permiso.modulo,
      createdAt: permiso.createdAt,
      roles: permiso.roles.map((rp) => ({
        id: rp.rol.id,
        nombre: rp.rol.nombre,
        descripcion: rp.rol.descripcion,
      })),
    }))

    // Agrupar permisos por módulo
    const permisosPorModulo: Record<string, typeof permisosFormateados> = {}
    for (const permiso of permisosFormateados) {
      const mod = permiso.modulo || 'general'
      if (!permisosPorModulo[mod]) permisosPorModulo[mod] = []
      permisosPorModulo[mod].push(permiso)
    }

    return NextResponse.json({
      permisos: permisosFormateados,
      permisosPorModulo,
      roles: roles.map((rol) => ({
        id: rol.id,
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        es_default: rol.es_default,
        cantidadUsuarios: rol._count.usuarios,
        permisos: rol.permisos.map((rp) => ({
          id: rp.permiso.id,
          nombre: rp.permiso.nombre,
          modulo: rp.permiso.modulo,
        })),
      })),
    })
  } catch (error) {
    console.error('Error al obtener permisos:', error)
    return NextResponse.json(
      { error: 'Error al obtener permisos' },
      { status: 500 }
    )
  }
}
