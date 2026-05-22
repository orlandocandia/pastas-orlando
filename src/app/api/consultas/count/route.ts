import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/consultas/count - Get unread consultas count for sidebar badge
export async function GET() {
  try {
    const noLeidos = await db.consulta.count({
      where: { leido: false, respondido: false },
    })

    return NextResponse.json({ noLeidos })
  } catch (error) {
    console.error('Error al contar consultas no leídas:', error)
    return NextResponse.json({ noLeidos: 0 })
  }
}
