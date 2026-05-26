import { NextResponse } from 'next/server'
import { uploadImage, deleteImage } from '@/lib/upload'

// Valid entity types for upload subdirectories
const VALID_ENTITIES = [
  'producto-terminado',
  'materia-prima',
  'insumo',
  'persona',
  'usuario',
  'producto',
]

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params
    const entity = slug[0]

    if (!entity || !VALID_ENTITIES.includes(entity)) {
      return NextResponse.json(
        { error: `Tipo de entidad no válido: ${entity}. Válidos: ${VALID_ENTITIES.join(', ')}` },
        { status: 400 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No se envió ningún archivo' },
        { status: 400 }
      )
    }

    const result = await uploadImage(file, entity)

    return NextResponse.json({ url: result.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al subir imagen'
    console.error('[Upload] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params
    const entity = slug[0]

    if (!entity || !VALID_ENTITIES.includes(entity)) {
      return NextResponse.json(
        { error: `Tipo de entidad no válido: ${entity}` },
        { status: 400 }
      )
    }

    const { imageUrl } = await req.json()
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No se proporcionó URL de imagen' },
        { status: 400 }
      )
    }

    await deleteImage(imageUrl)

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al eliminar imagen'
    console.error('[Upload] Delete error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
