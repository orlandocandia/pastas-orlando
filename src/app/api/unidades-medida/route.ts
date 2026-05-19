import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/unidades-medida - Listar todas las unidades de medida
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo_medida = searchParams.get('tipo_medida')

    const where: Record<string, unknown> = {}
    if (tipo_medida) where.tipo_medida = tipo_medida

    const unidades = await db.unidadMedida.findMany({
      where,
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json(unidades)
  } catch (error) {
    console.error('Error al obtener unidades de medida:', error)
    return NextResponse.json({ error: 'Error al obtener unidades de medida' }, { status: 500 })
  }
}

// POST /api/unidades-medida - Crear unidad de medida
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { codigo, nombre, conversion_a_base, tipo_medida } = body

    if (!codigo || !nombre || !tipo_medida) {
      return NextResponse.json(
        { error: 'Los campos codigo, nombre y tipo_medida son requeridos' },
        { status: 400 }
      )
    }

    // Verificar código único
    const existente = await db.unidadMedida.findUnique({ where: { codigo } })
    if (existente) {
      return NextResponse.json(
        { error: 'Ya existe una unidad de medida con ese código' },
        { status: 400 }
      )
    }

    const unidad = await db.unidadMedida.create({
      data: {
        codigo,
        nombre,
        conversion_a_base: parseFloat(conversion_a_base) || 1.0,
        tipo_medida,
      },
    })

    return NextResponse.json(unidad, { status: 201 })
  } catch (error) {
    console.error('Error al crear unidad de medida:', error)
    return NextResponse.json({ error: 'Error al crear unidad de medida' }, { status: 500 })
  }
}

// PUT /api/unidades-medida - Actualizar unidad de medida
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, codigo, nombre, conversion_a_base, tipo_medida } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    // Verificar código único (excluyendo la unidad actual)
    if (codigo) {
      const existente = await db.unidadMedida.findFirst({
        where: {
          codigo,
          id: { not: parseInt(id) },
        },
      })
      if (existente) {
        return NextResponse.json(
          { error: 'Ya existe otra unidad de medida con ese código' },
          { status: 400 }
        )
      }
    }

    const unidad = await db.unidadMedida.update({
      where: { id: parseInt(id) },
      data: {
        codigo: codigo || undefined,
        nombre: nombre || undefined,
        conversion_a_base: conversion_a_base !== undefined ? parseFloat(conversion_a_base) : undefined,
        tipo_medida: tipo_medida || undefined,
      },
    })

    return NextResponse.json(unidad)
  } catch (error) {
    console.error('Error al actualizar unidad de medida:', error)
    return NextResponse.json({ error: 'Error al actualizar unidad de medida' }, { status: 500 })
  }
}

// DELETE /api/unidades-medida - Eliminar unidad de medida
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    await db.unidadMedida.delete({ where: { id: parseInt(id) } })

    return NextResponse.json({ message: 'Unidad de medida eliminada' })
  } catch (error) {
    console.error('Error al eliminar unidad de medida:', error)
    return NextResponse.json({ error: 'Error al eliminar unidad de medida' }, { status: 500 })
  }
}
