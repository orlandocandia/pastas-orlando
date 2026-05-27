import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/upload'

// Allowed entity types for upload
const ALLOWED_ENTITIES = [
  'producto-terminado',
  'materia-prima',
  'insumo',
  'persona',
  'usuario',
  'producto',
]

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string[] }> }
) {
  try {
    const { entity: entityParts } = await params
    const entity = entityParts?.join('/') || ''

    // Validate entity type
    if (!entity || !ALLOWED_ENTITIES.includes(entity)) {
      return NextResponse.json(
        { error: `Tipo de entidad no válido: ${entity}. Permitidos: ${ALLOWED_ENTITIES.join(', ')}` },
        { status: 400 }
      )
    }

    // Get the file from the form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No se encontró el archivo. Usá el campo "file" en el FormData.' },
        { status: 400 }
      )
    }

    // Upload the file using our upload utility
    const result = await uploadImage(file, entity)

    return NextResponse.json({ url: result.url, size: result.size })
  } catch (error: any) {
    console.error('[Upload Error]', error)
    return NextResponse.json(
      { error: error.message || 'Error al subir la imagen' },
      { status: 500 }
    )
  }
}
