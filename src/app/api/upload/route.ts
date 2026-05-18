import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

// POST /api/upload - Subir imagen
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se encontró archivo' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generar nombre único
    const ext = file.name.split('.').pop()
    const nombreUnico = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
    const ruta = path.join(process.cwd(), 'public', 'images', 'productos', nombreUnico)

    await writeFile(ruta, buffer)

    return NextResponse.json({
      url: `/images/productos/${nombreUnico}`,
      nombre: nombreUnico,
    })
  } catch (error) {
    console.error('Error al subir imagen:', error)
    return NextResponse.json({ error: 'Error al subir imagen' }, { status: 500 })
  }
}
