import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/upload'

const ENTIDADES_PERMITIDAS = [
  'producto-terminado',
  'materia-prima',
  'insumo',
  'persona',
  'usuario',
  'producto',
  'compra',
  'comprobante',
]

// POST /api/upload — upload image (optional entity slug: /api/upload/persona, /api/upload/producto-terminado, etc.)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 })
    }

    // Extract entity from URL path: /api/upload/persona → "persona"
    const url = new URL(request.url)
    const pathSegments = url.pathname.replace('/api/upload/', '').split('/')
    const entity = pathSegments[0] || undefined

    // Validate entity if provided
    if (entity && !ENTIDADES_PERMITIDAS.includes(entity)) {
      return NextResponse.json(
        { error: `Entidad no permitida: ${entity}. Permitidas: ${ENTIDADES_PERMITIDAS.join(', ')}` },
        { status: 400 }
      )
    }

    const result = await uploadImage(file, entity)

    return NextResponse.json({
      url: result.url,
      size: result.size,
    })
  } catch (error: any) {
    console.error('[Upload Error]', error)
    return NextResponse.json(
      { error: error.message || 'Error al subir archivo' },
      { status: 500 }
    )
  }
}

// DELETE /api/upload — delete an uploaded image by URL
export async function DELETE(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'No se proporcionó URL de imagen' }, { status: 400 })
    }

    // Only allow deleting local uploads (not Vercel Blob URLs)
    if (!imageUrl.startsWith('/images/uploads/')) {
      return NextResponse.json({ error: 'Solo se pueden eliminar imágenes locales' }, { status: 400 })
    }

    const { deleteImage } = await import('@/lib/upload')
    await deleteImage(imageUrl)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Delete Upload Error]', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar archivo' },
      { status: 500 }
    )
  }
}
