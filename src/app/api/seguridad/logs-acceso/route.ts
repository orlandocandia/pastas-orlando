import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/seguridad/logs-acceso - Listar logs de acceso con filtros y resumen de actividad sospechosa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const resultado = searchParams.get('resultado')
    const fecha_desde = searchParams.get('fecha_desde')
    const fecha_hasta = searchParams.get('fecha_hasta')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}

    if (email) {
      where.email_intento = { contains: email }
    }

    if (resultado) {
      where.resultado = resultado
    }

    if (fecha_desde || fecha_hasta) {
      where.fecha = {}
      if (fecha_desde) {
        (where.fecha as Record<string, unknown>).gte = new Date(fecha_desde)
      }
      if (fecha_hasta) {
        (where.fecha as Record<string, unknown>).lte = new Date(fecha_hasta)
      }
    }

    const [data, total] = await Promise.all([
      db.logAcceso.findMany({
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.logAcceso.count({ where }),
    ])

    // Resumen de actividad sospechosa: IPs con múltiples intentos fallidos en las últimas 24 horas
    const hace24Horas = new Date()
    hace24Horas.setHours(hace24Horas.getHours() - 24)

    const logsFallidos = await db.logAcceso.findMany({
      where: {
        resultado: { in: ['FAIL', '2FA_FAIL', 'BLOCKED'] },
        fecha: { gte: hace24Horas },
      },
      select: {
        ip: true,
        resultado: true,
        email_intento: true,
      },
    })

    // Agrupar por IP para detectar actividad sospechosa
    const actividadPorIP: Record<string, { intentos: number; emails: string[] }> = {}
    for (const log of logsFallidos) {
      const ip = log.ip || 'desconocida'
      if (!actividadPorIP[ip]) {
        actividadPorIP[ip] = { intentos: 0, emails: [] }
      }
      actividadPorIP[ip].intentos++
      if (log.email_intento && !actividadPorIP[ip].emails.includes(log.email_intento)) {
        actividadPorIP[ip].emails.push(log.email_intento)
      }
    }

    // Filtrar solo IPs con 3 o más intentos fallidos
    const actividadSospechosa = Object.entries(actividadPorIP)
      .filter(([, data]) => data.intentos >= 3)
      .map(([ip, data]) => ({
        ip,
        intentos_fallidos: data.intentos,
        emails_intento: data.emails,
      }))
      .sort((a, b) => b.intentos_fallidos - a.intentos_fallidos)

    return NextResponse.json({
      data,
      total,
      page,
      totalPaginas: Math.ceil(total / limit),
      actividad_sospechosa: actividadSospechosa,
    })
  } catch (error) {
    console.error('Error al obtener logs de acceso:', error)
    return NextResponse.json(
      { error: 'Error al obtener logs de acceso' },
      { status: 500 }
    )
  }
}
