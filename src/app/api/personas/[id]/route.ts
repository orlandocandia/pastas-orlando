import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/personas/[id] - Obtener persona por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const persona = await db.persona.findUnique({
      where: { id: parseInt(id) },
      include: {
        municipio: {
          include: {
            departamento: {
              include: { provincia: { include: { pais: true } } },
            },
          },
        },
        contactos: { include: { tipo: true }, orderBy: { es_principal: 'desc' } },
        direcciones: {
          include: { tipo: true, municipio: { include: { departamento: { include: { provincia: true } } } } },
          orderBy: { es_principal: 'desc' },
        },
        usuario: {
          include: { roles: { include: { rol: true } } },
        },
      },
    })

    if (!persona) {
      return NextResponse.json({ error: 'Persona no encontrada' }, { status: 404 })
    }

    return NextResponse.json(persona)
  } catch (error) {
    console.error('Error al obtener persona:', error)
    return NextResponse.json({ error: 'Error al obtener persona' }, { status: 500 })
  }
}

// PUT /api/personas/[id] - Editar persona
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      latitud,
      longitud,
      direccion_mapa,
      ubicacion_valida,
    } = body

    // Verificar documento único (excluyendo la persona actual)
    if (numero_documento) {
      const existente = await db.persona.findFirst({
        where: {
          numero_documento,
          id: { not: parseInt(id) },
        },
      })
      if (existente) {
        return NextResponse.json(
          { error: 'Ya existe otra persona con ese número de documento' },
          { status: 400 }
        )
      }
    }

    // Actualizar contactos si se proporcionan
    if (contactos) {
      // Eliminar contactos existentes y recrear
      await db.contacto.deleteMany({ where: { id_persona: parseInt(id) } })
      await db.contacto.createMany({
        data: contactos.map((c: { id_tipo_contacto: number; valor: string; es_principal?: boolean }) => ({
          id_persona: parseInt(id),
          id_tipo_contacto: c.id_tipo_contacto,
          valor: c.valor,
          es_principal: c.es_principal || false,
        })),
      })
    }

    // Actualizar direcciones si se proporcionan
    if (direcciones) {
      await db.direccion.deleteMany({ where: { id_persona: parseInt(id) } })
      await db.direccion.createMany({
        data: direcciones.map((d: { id_tipo_direccion: number; id_municipio?: number; direccion: string; referencia?: string; es_principal?: boolean }) => ({
          id_persona: parseInt(id),
          id_tipo_direccion: d.id_tipo_direccion,
          id_municipio: d.id_municipio || null,
          direccion: d.direccion,
          referencia: d.referencia || null,
          es_principal: d.es_principal || false,
        })),
      })
    }

    const persona = await db.persona.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        apellido,
        numero_documento,
        fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : undefined,
        observaciones: observaciones || undefined,
        tipo_persona,
        razon_social: razon_social || undefined,
        cuit: cuit || undefined,
        condicion_iva: condicion_iva || undefined,
        imagen: imagen || undefined,
        id_municipio: id_municipio || undefined,
        latitud: latitud !== undefined ? latitud : undefined,
        longitud: longitud !== undefined ? longitud : undefined,
        direccion_mapa: direccion_mapa !== undefined ? direccion_mapa : undefined,
        ubicacion_valida: ubicacion_valida !== undefined ? ubicacion_valida : undefined,
        fecha_actualizacion: new Date(),
      },
      include: {
        municipio: true,
        contactos: { include: { tipo: true } },
        direcciones: { include: { tipo: true } },
        usuario: { include: { roles: { include: { rol: true } } } },
      },
    })

    return NextResponse.json(persona)
  } catch (error) {
    console.error('Error al actualizar persona:', error)
    return NextResponse.json({ error: 'Error al actualizar persona' }, { status: 500 })
  }
}

// DELETE /api/personas/[id] - Eliminar persona
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar si tiene usuario asociado
    const persona = await db.persona.findUnique({
      where: { id: parseInt(id) },
      include: { usuario: true },
    })

    if (!persona) {
      return NextResponse.json({ error: 'Persona no encontrada' }, { status: 404 })
    }

    if (persona.usuario) {
      return NextResponse.json(
        { error: 'No se puede eliminar una persona que tiene usuario asociado. Elimine el usuario primero.' },
        { status: 400 }
      )
    }

    // Eliminar contactos y direcciones primero
    await db.contacto.deleteMany({ where: { id_persona: parseInt(id) } })
    await db.direccion.deleteMany({ where: { id_persona: parseInt(id) } })
    await db.persona.delete({ where: { id: parseInt(id) } })

    return NextResponse.json({ message: 'Persona eliminada' })
  } catch (error) {
    console.error('Error al eliminar persona:', error)
    return NextResponse.json({ error: 'Error al eliminar persona' }, { status: 500 })
  }
}
