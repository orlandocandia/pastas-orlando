import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { registrarAuditoria, ModuloAuditoria, AccionAuditoria } from '@/lib/auditoria-service'

// GET /api/seguridad/roles - Listar todos los roles con permisos y cantidad de usuarios
export async function GET() {
  try {
    const roles = await db.rol.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        permisos: {
          include: {
            permiso: {
              select: {
                id: true,
                nombre: true,
                descripcion: true,
                modulo: true,
              },
            },
          },
        },
        _count: {
          select: { usuarios: true },
        },
      },
    })

    const rolesFormateados = roles.map((rol) => ({
      id: rol.id,
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      es_default: rol.es_default,
      createdAt: rol.createdAt,
      updatedAt: rol.updatedAt,
      cantidadUsuarios: rol._count.usuarios,
      permisos: rol.permisos.map((rp) => ({
        id: rp.permiso.id,
        nombre: rp.permiso.nombre,
        descripcion: rp.permiso.descripcion,
        modulo: rp.permiso.modulo,
      })),
    }))

    return NextResponse.json({ data: rolesFormateados })
  } catch (error) {
    console.error('Error al obtener roles:', error)
    return NextResponse.json(
      { error: 'Error al obtener roles' },
      { status: 500 }
    )
  }
}

// POST /api/seguridad/roles - Crear un nuevo rol
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, descripcion, permisos, es_default } = body

    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre del rol es requerido' },
        { status: 400 }
      )
    }

    // Verificar que no exista un rol con el mismo nombre
    const rolExistente = await db.rol.findUnique({
      where: { nombre },
    })

    if (rolExistente) {
      return NextResponse.json(
        { error: 'Ya existe un rol con ese nombre' },
        { status: 400 }
      )
    }

    // Crear el rol con sus permisos
    const rol = await db.rol.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        es_default: es_default || false,
        permisos: permisos && permisos.length > 0
          ? {
              create: permisos.map((id_permiso: number) => ({ id_permiso })),
            }
          : undefined,
      },
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
    })

    // Registrar en auditoría
    await registrarAuditoria({
      accion: AccionAuditoria.CREATE,
      modulo: ModuloAuditoria.USUARIOS,
      entidad_id: rol.id,
      entidad_nombre: rol.nombre,
      detalles: {
        accion: 'rol_creado',
        nombre: rol.nombre,
        permisos: rol.permisos.map((rp) => rp.permiso.nombre),
      },
    })

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al crear rol:', error)
    return NextResponse.json(
      { error: 'Error al crear rol' },
      { status: 500 }
    )
  }
}

// PUT /api/seguridad/roles - Actualizar un rol (nombre, descripción, permisos)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, nombre, descripcion, permisos, es_default } = body

    if (!id) {
      return NextResponse.json(
        { error: 'El id del rol es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el rol existe
    const rolExistente = await db.rol.findUnique({
      where: { id },
      include: {
        permisos: {
          include: {
            permiso: {
              select: { nombre: true },
            },
          },
        },
      },
    })

    if (!rolExistente) {
      return NextResponse.json(
        { error: 'Rol no encontrado' },
        { status: 404 }
      )
    }

    // Verificar nombre único (si se está cambiando)
    if (nombre && nombre !== rolExistente.nombre) {
      const nombreEnUso = await db.rol.findUnique({
        where: { nombre },
      })
      if (nombreEnUso) {
        return NextResponse.json(
          { error: 'Ya existe un rol con ese nombre' },
          { status: 400 }
        )
      }
    }

    // Guardar datos anteriores para auditoría
    const permisosAnteriores = rolExistente.permisos.map((rp) => rp.permiso.nombre)

    // Actualizar datos básicos del rol
    const updateData: Record<string, unknown> = {}
    if (nombre !== undefined) updateData.nombre = nombre
    if (descripcion !== undefined) updateData.descripcion = descripcion
    if (es_default !== undefined) updateData.es_default = es_default
    updateData.updatedAt = new Date()

    await db.rol.update({
      where: { id },
      data: updateData,
    })

    // Actualizar permisos si se proporcionan
    if (permisos !== undefined) {
      // Eliminar permisos existentes
      await db.rolPermiso.deleteMany({
        where: { id_rol: id },
      })

      // Crear nuevos permisos
      if (permisos.length > 0) {
        await db.rolPermiso.createMany({
          data: permisos.map((id_permiso: number) => ({
            id_rol: id,
            id_permiso,
          })),
        })
      }
    }

    // Obtener el rol actualizado
    const rolActualizado = await db.rol.findUnique({
      where: { id },
      include: {
        permisos: {
          include: {
            permiso: {
              select: {
                id: true,
                nombre: true,
                descripcion: true,
                modulo: true,
              },
            },
          },
        },
        _count: {
          select: { usuarios: true },
        },
      },
    })

    // Registrar en auditoría
    await registrarAuditoria({
      accion: AccionAuditoria.UPDATE,
      modulo: ModuloAuditoria.USUARIOS,
      entidad_id: id,
      entidad_nombre: rolActualizado?.nombre || rolExistente.nombre,
      detalles: {
        accion: 'rol_actualizado',
        nombre_anterior: rolExistente.nombre,
        nombre_nuevo: nombre || rolExistente.nombre,
        permisos_anteriores: permisosAnteriores,
        permisos_nuevos: rolActualizado?.permisos.map((rp) => rp.permiso.nombre) || [],
      },
    })

    return NextResponse.json({
      id: rolActualizado?.id,
      nombre: rolActualizado?.nombre,
      descripcion: rolActualizado?.descripcion,
      es_default: rolActualizado?.es_default,
      cantidadUsuarios: rolActualizado?._count.usuarios,
      permisos: rolActualizado?.permisos.map((rp) => ({
        id: rp.permiso.id,
        nombre: rp.permiso.nombre,
        descripcion: rp.permiso.descripcion,
        modulo: rp.permiso.modulo,
      })),
    })
  } catch (error) {
    console.error('Error al actualizar rol:', error)
    return NextResponse.json(
      { error: 'Error al actualizar rol' },
      { status: 500 }
    )
  }
}

// DELETE /api/seguridad/roles - Eliminar un rol (solo si no tiene usuarios asignados)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'El id del rol es requerido' },
        { status: 400 }
      )
    }

    const idRol = parseInt(id)

    // Verificar que el rol existe
    const rol = await db.rol.findUnique({
      where: { id: idRol },
      include: {
        _count: {
          select: { usuarios: true },
        },
      },
    })

    if (!rol) {
      return NextResponse.json(
        { error: 'Rol no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que no tiene usuarios asignados
    if (rol._count.usuarios > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar el rol "${rol.nombre}" porque tiene ${rol._count.usuarios} usuario(s) asignado(s). Reasigne los usuarios primero.`,
        },
        { status: 400 }
      )
    }

    // Eliminar permisos del rol primero
    await db.rolPermiso.deleteMany({
      where: { id_rol: idRol },
    })

    // Eliminar el rol
    await db.rol.delete({
      where: { id: idRol },
    })

    // Registrar en auditoría
    await registrarAuditoria({
      accion: AccionAuditoria.DELETE,
      modulo: ModuloAuditoria.USUARIOS,
      entidad_id: idRol,
      entidad_nombre: rol.nombre,
      detalles: {
        accion: 'rol_eliminado',
        nombre: rol.nombre,
      },
    })

    return NextResponse.json({ success: true, message: `Rol "${rol.nombre}" eliminado correctamente` })
  } catch (error) {
    console.error('Error al eliminar rol:', error)
    return NextResponse.json(
      { error: 'Error al eliminar rol' },
      { status: 500 }
    )
  }
}
