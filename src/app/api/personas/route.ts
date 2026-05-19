import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/personas - Listar personas con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    const buscar = searchParams.get('buscar')
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = parseInt(searchParams.get('limite') || '10')

    const where: Record<string, unknown> = {}
    if (tipo && tipo !== 'todos') where.tipo_persona = tipo
    if (buscar) {
      where.OR = [
        { nombre: { contains: buscar } },
        { apellido: { contains: buscar } },
        { numero_documento: { contains: buscar } },
      ]
    }

    const [personas, total] = await Promise.all([
      db.persona.findMany({
        where,
        include: {
          municipio: {
            include: {
              departamento: {
                include: { provincia: { include: { pais: true } } },
              },
            },
          },
          contactos: {
            include: { tipo: true },
            orderBy: { es_principal: 'desc' },
          },
          direcciones: {
            include: { tipo: true, municipio: true },
            orderBy: { es_principal: 'desc' },
          },
          usuario: {
            include: {
              roles: { include: { rol: true } },
            },
          },
        },
        orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      db.persona.count({ where }),
    ])

    return NextResponse.json({
      personas,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    })
  } catch (error) {
    console.error('Error al obtener personas:', error)
    return NextResponse.json({ error: 'Error al obtener personas' }, { status: 500 })
  }
}

// POST /api/personas - Crear persona
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      nombre,
      apellido,
      numero_documento,
      fecha_nacimiento,
      observaciones,
      tipo_persona,
      razon_social,
      cuit,
      condicion_iva,
      imagen,
      id_municipio,
      contactos,
      direcciones,
    } = body

    // Verificar documento único
    const existente = await db.persona.findUnique({
      where: { numero_documento },
    })
    if (existente) {
      return NextResponse.json(
        { error: 'Ya existe una persona con ese número de documento' },
        { status: 400 }
      )
    }

    const persona = await db.persona.create({
      data: {
        nombre,
        apellido,
        numero_documento,
        fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
        observaciones: observaciones || null,
        tipo_persona,
        razon_social: razon_social || null,
        cuit: cuit || null,
        condicion_iva: condicion_iva || null,
        imagen: imagen || null,
        id_municipio: id_municipio || null,
        contactos: contactos
          ? {
              create: contactos.map((c: { id_tipo_contacto: number; valor: string; es_principal?: boolean }) => ({
                id_tipo_contacto: c.id_tipo_contacto,
                valor: c.valor,
                es_principal: c.es_principal || false,
              })),
            }
          : undefined,
        direcciones: direcciones
          ? {
              create: direcciones.map((d: { id_tipo_direccion: number; id_municipio?: number; direccion: string; referencia?: string; es_principal?: boolean }) => ({
                id_tipo_direccion: d.id_tipo_direccion,
                id_municipio: d.id_municipio || null,
                direccion: d.direccion,
                referencia: d.referencia || null,
                es_principal: d.es_principal || false,
              })),
            }
          : undefined,
      },
      include: {
        municipio: true,
        contactos: { include: { tipo: true } },
        direcciones: { include: { tipo: true } },
      },
    })

    return NextResponse.json(persona, { status: 201 })
  } catch (error) {
    console.error('Error al crear persona:', error)
    return NextResponse.json({ error: 'Error al crear persona' }, { status: 500 })
  }
}
