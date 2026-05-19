import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET /api/usuarios/[id] - Obtener usuario por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const usuario = await db.usuario.findUnique({
      where: { id: parseInt(id) },
      include: {
        persona: {
          include: {
            municipio: true,
            contactos: { include: { tipo: true } },
            direcciones: { include: { tipo: true, municipio: true } },
          },
        },
        roles: { include: { rol: true } },
      },
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json(usuario)
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    return NextResponse.json({ error: 'Error al obtener usuario' }, { status: 500 })
  }
}

// PUT /api/usuarios/[id] - Editar usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { email, password, roles, imagen, estado } = body

    // Verificar email único (excluyendo el usuario actual)
    if (email) {
      const existente = await db.usuario.findFirst({
        where: { email, id: { not: parseInt(id) } },
      })
      if (existente) {
        return NextResponse.json({ error: 'Ya existe otro usuario con ese email' }, { status: 400 })
      }
    }

    const updateData: Record<string, unknown> = {
      email,
      imagen: imagen || undefined,
      estado: estado !== undefined ? estado : undefined,
      fecha_actualizacion: new Date(),
    }

    // Si se proporciona nueva contraseña, hashearla
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Actualizar roles si se proporcionan
    if (roles) {
      // Eliminar roles existentes y recrear
      await db.usuarioRol.deleteMany({ where: { id_usuario: parseInt(id) } })
      await db.usuarioRol.createMany({
        data: roles.map((id_rol: number) => ({
          id_usuario: parseInt(id),
          id_rol,
        })),
      })
    }

    const usuario = await db.usuario.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        persona: true,
        roles: { include: { rol: true } },
      },
    })

    return NextResponse.json(usuario)
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 })
  }
}

// DELETE /api/usuarios/[id] - Eliminar usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Eliminar roles y sesiones primero
    await db.usuarioRol.deleteMany({ where: { id_usuario: parseInt(id) } })
    await db.sesion.deleteMany({ where: { id_usuario: parseInt(id) } })
    await db.usuario.delete({ where: { id: parseInt(id) } })

    return NextResponse.json({ message: 'Usuario eliminado' })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 })
  }
}
