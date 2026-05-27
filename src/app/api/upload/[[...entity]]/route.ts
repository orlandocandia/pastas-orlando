import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/upload'

const ALLOWED_ENTITIES = [
  'producto-terminado',
  'materia-prima',
  'insumo',
  'persona',
  'usuario',
  'producto',
  'compra',
  'comprobante',
]

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entity?: string[] }> }
) {
  try {
    const { entity } = await params
    const entitySlug = entity?.[0] || ''

    if (entitySlug && !ALLOWED_ENTITIES.includes(entitySlug)) {
      return NextResponse.json(
        { error: `Entidad no permitida: ${entitySlug}` },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No se envió ningún archivo' },
        { status: 400 }
      )
    }

    const result = await uploadImage(file, entitySlug || undefined)

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
