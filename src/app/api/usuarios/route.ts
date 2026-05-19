import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET /api/usuarios - Listar usuarios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const buscar = searchParams.get('buscar')
    const rol = searchParams.get('rol')

    const where: Record<string, unknown> = {}
    if (buscar) {
      where.OR = [
        { email: { contains: buscar } },
        { persona: { nombre: { contains: buscar } } },
        { persona: { apellido: { contains: buscar } } },
      ]
    }
    if (rol) {
      where.roles = { some: { rol: { nombre: rol } } }
    }

    const usuarios = await db.usuario.findMany({
      where,
      include: {
        persona: {
          include: {
            contactos: { where: { es_principal: true }, include: { tipo: true }, take: 1 },
          },
        },
        roles: { include: { rol: true } },
      },
      orderBy: { fecha_registro: 'desc' },
    })

    return NextResponse.json(usuarios)
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}

// POST /api/usuarios - Crear usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id_persona, email, password, roles, imagen, estado } = body

    if (!id_persona || !email || !password) {
      return NextResponse.json({ error: 'Persona, email y contraseña son requeridos' }, { status: 400 })
    }

    // Verificar email único
    const existente = await db.usuario.findUnique({ where: { email } })
    if (existente) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 400 })
    }

    // Verificar que la persona no tenga ya un usuario
    const personaConUsuario = await db.usuario.findUnique({ where: { id_persona } })
    if (personaConUsuario) {
      return NextResponse.json({ error: 'Esta persona ya tiene un usuario asociado' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const usuario = await db.usuario.create({
      data: {
        id_persona,
        email,
        password: hashedPassword,
        imagen: imagen || null,
        estado: estado !== false,
        roles: roles
          ? {
              create: roles.map((id_rol: number) => ({ id_rol })),
            }
          : undefined,
      },
      include: {
        persona: true,
        roles: { include: { rol: true } },
      },
    })

    return NextResponse.json(usuario, { status: 201 })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
  }
}
