import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/logistica/mapa/proveedores - Proveedores con coordenadas para el mapa
export async function GET() {
  try {
    const proveedores = await db.persona.findMany({
      where: {
        tipo_persona: 'proveedor',
        direcciones: {
          some: {
            latitud: { not: null },
            longitud: { not: null },
          },
        },
      },
      include: {
        direcciones: {
          where: {
            latitud: { not: null },
            longitud: { not: null },
          },
          include: {
            tipo: {
              select: { nombre: true },
            },
          },
        },
        contactos: {
          include: {
            tipo: {
              select: { nombre: true },
            },
          },
        },
      },
    })

    // Formatear resultado para el mapa
    const results = proveedores.map((proveedor) => {
      // Tomar la primera dirección con coordenadas (preferir la principal)
      const direccionPrincipal = proveedor.direcciones.find((d) => d.es_principal)
        || proveedor.direcciones[0]

      // Filtrar teléfonos de los contactos
      const telefonos = proveedor.contactos
        .filter((c) =>
          c.tipo.nombre.toLowerCase().includes('teléfono')
          || c.tipo.nombre.toLowerCase().includes('telefono')
          || c.tipo.nombre.toLowerCase().includes('celular')
          || c.tipo.nombre.toLowerCase().includes('móvil')
          || c.tipo.nombre.toLowerCase().includes('movil')
        )
        .map((c) => c.valor)

      return {
        id: proveedor.id,
        nombre: proveedor.nombre,
        apellido: proveedor.apellido,
        razon_social: proveedor.razon_social,
        direccion: direccionPrincipal?.direccion || null,
        lat: direccionPrincipal?.latitud || null,
        lng: direccionPrincipal?.longitud || null,
        telefonos,
      }
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error al obtener proveedores para mapa:', error)
    return NextResponse.json({ error: 'Error al obtener proveedores para mapa' }, { status: 500 })
  }
}
