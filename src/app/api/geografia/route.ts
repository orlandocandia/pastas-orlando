import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/geografia - Obtener datos geográficos para selects anidados
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    const id = searchParams.get('id')

    switch (tipo) {
      case 'paises': {
        const paises = await db.pais.findMany({ orderBy: { nombre: 'asc' } })
        return NextResponse.json(paises)
      }
      case 'provincias': {
        const id_pais = id ? parseInt(id) : undefined
        const provincias = await db.provincia.findMany({
          where: id_pais ? { id_pais } : undefined,
          orderBy: { nombre: 'asc' },
        })
        return NextResponse.json(provincias)
      }
      case 'departamentos': {
        const id_provincia = id ? parseInt(id) : undefined
        const departamentos = await db.departamento.findMany({
          where: id_provincia ? { id_provincia } : undefined,
          orderBy: { nombre: 'asc' },
        })
        return NextResponse.json(departamentos)
      }
      case 'municipios': {
        const id_departamento = id ? parseInt(id) : undefined
        const municipios = await db.municipio.findMany({
          where: id_departamento ? { id_departamento } : undefined,
          orderBy: { nombre: 'asc' },
        })
        return NextResponse.json(municipios)
      }
      case 'tipos_persona': {
        const tipos = await db.tipoPersona.findMany({ orderBy: { nombre: 'asc' } })
        return NextResponse.json(tipos)
      }
      case 'tipos_contacto': {
        const tipos = await db.tipoContacto.findMany({ orderBy: { nombre: 'asc' } })
        return NextResponse.json(tipos)
      }
      case 'tipos_direccion': {
        const tipos = await db.tipoDireccion.findMany({ orderBy: { nombre: 'asc' } })
        return NextResponse.json(tipos)
      }
      case 'roles': {
        const roles = await db.rol.findMany({ orderBy: { nombre: 'asc' } })
        return NextResponse.json(roles)
      }
      default: {
        // Devolver todos los datos geográficos de una vez
        const [paises, provincias, departamentos, municipios] = await Promise.all([
          db.pais.findMany({ orderBy: { nombre: 'asc' } }),
          db.provincia.findMany({ orderBy: { nombre: 'asc' } }),
          db.departamento.findMany({ orderBy: { nombre: 'asc' } }),
          db.municipio.findMany({ orderBy: { nombre: 'asc' } }),
        ])
        return NextResponse.json({ paises, provincias, departamentos, municipios })
      }
    }
  } catch (error) {
    console.error('Error al obtener datos geográficos:', error)
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 })
  }
}
