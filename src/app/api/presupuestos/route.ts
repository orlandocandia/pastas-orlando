import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/presupuestos - Listar presupuestos con paginación y filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const buscar = searchParams.get('buscar')
    const estado = searchParams.get('estado')
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = parseInt(searchParams.get('limite') || '20')

    const where: Record<string, unknown> = {}

    if (estado) where.estado = estado

    if (buscar) {
      where.OR = [
        { numero: { contains: buscar } },
        { cliente: { nombre: { contains: buscar } } },
        { cliente: { apellido: { contains: buscar } } },
        { cliente: { razon_social: { contains: buscar } } },
      ]
    }

    const [data, total] = await Promise.all([
      db.presupuesto.findMany({
        where,
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              razon_social: true,
              cuit: true,
              condicion_iva: true,
            },
          },
          detalle: {
            include: {
              productoTerminado: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true,
                  precio_venta: true,
                },
              },
            },
          },
          pedido: {
            select: { id: true },
          },
        },
        orderBy: { fecha_creacion: 'desc' },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      db.presupuesto.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    })
  } catch (error) {
    console.error('Error al obtener presupuestos:', error)
    return NextResponse.json({ error: 'Error al obtener presupuestos' }, { status: 500 })
  }
}

// POST /api/presupuestos - Crear presupuesto con detalles
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id_cliente,
      fecha_validez,
      observaciones,
      iva,
      detalles,
    } = body

    if (!id_cliente || !fecha_validez || !detalles || detalles.length === 0) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: id_cliente, fecha_validez, detalles' },
        { status: 400 }
      )
    }

    // Generar número de presupuesto
    const ultimoPresupuesto = await db.presupuesto.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
    })
    const numero = `PRES-${(ultimoPresupuesto ? ultimoPresupuesto.id + 1 : 1).toString().padStart(6, '0')}`

    // Calcular subtotales
    let subtotal = 0
    const detallesData = []

    for (const detalle of detalles) {
      const { id_producto_terminado, cantidad, precio_unitario } = detalle

      if (!id_producto_terminado || !cantidad || precio_unitario === undefined) {
        return NextResponse.json(
          { error: 'Cada detalle debe tener id_producto_terminado, cantidad y precio_unitario' },
          { status: 400 }
        )
      }

      const cantidadNum = parseFloat(cantidad)
      const precioNum = parseFloat(precio_unitario)
      const subtotalLinea = cantidadNum * precioNum
      subtotal += subtotalLinea

      detallesData.push({
        id_producto_terminado: parseInt(id_producto_terminado),
        cantidad: cantidadNum,
        precio_unitario: precioNum,
        subtotal: subtotalLinea,
      })
    }

    const ivaAmount = iva ? parseFloat(iva) : 0
    const total = subtotal + ivaAmount

    // Crear presupuesto con detalles
    const presupuesto = await db.presupuesto.create({
      data: {
        id_cliente: parseInt(id_cliente),
        numero,
        fecha_validez: new Date(fecha_validez),
        subtotal,
        iva: ivaAmount,
        total,
        observaciones: observaciones || null,
        estado: 'pendiente',
        detalle: {
          create: detallesData,
        },
      },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            razon_social: true,
            cuit: true,
            condicion_iva: true,
          },
        },
        detalle: {
          include: {
            productoTerminado: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
                precio_venta: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(presupuesto, { status: 201 })
  } catch (error) {
    console.error('Error al crear presupuesto:', error)
    return NextResponse.json({ error: 'Error al crear presupuesto' }, { status: 500 })
  }
}
