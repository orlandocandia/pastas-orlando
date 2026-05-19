import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/auditoria - Listar eventos de auditoría con filtros y paginación
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const buscar = searchParams.get('buscar')
    const modulo = searchParams.get('modulo')
    const accion = searchParams.get('accion')
    const id_usuario = searchParams.get('id_usuario')
    const fecha_desde = searchParams.get('fecha_desde')
    const fecha_hasta = searchParams.get('fecha_hasta')
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = parseInt(searchParams.get('limite') || '20')

    const where: Record<string, unknown> = {}

    if (modulo) where.modulo = modulo
    if (accion) where.accion = accion
    if (id_usuario) where.id_usuario = parseInt(id_usuario)

    if (fecha_desde || fecha_hasta) {
      where.fecha = {}
      if (fecha_desde) (where.fecha as Record<string, unknown>).gte = new Date(fecha_desde)
      if (fecha_hasta) (where.fecha as Record<string, unknown>).lte = new Date(fecha_hasta)
    }

    if (buscar) {
      where.OR = [
        { entidad_nombre: { contains: buscar } },
        { modulo: { contains: buscar } },
        { accion: { contains: buscar } },
        { usuario: { email: { contains: buscar } } },
        { usuario: { persona: { nombre: { contains: buscar } } } },
        { usuario: { persona: { apellido: { contains: buscar } } } },
      ]
    }

    const [data, total] = await Promise.all([
      db.auditoria.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              email: true,
              persona: {
                select: {
                  nombre: true,
                  apellido: true,
                },
              },
            },
          },
        },
        orderBy: { fecha: 'desc' },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      db.auditoria.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    })
  } catch (error) {
    console.error('Error al obtener auditoría:', error)
    return NextResponse.json({ error: 'Error al obtener auditoría' }, { status: 500 })
  }
}
