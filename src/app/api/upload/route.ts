import { NextResponse } from 'next/server'
import { uploadImage } from '@/lib/upload'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No se envió ningún archivo' },
        { status: 400 }
      )
    }

    const result = await uploadImage(file, 'general')

    return NextResponse.json({ url: result.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al subir imagen'
    console.error('[Upload] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
