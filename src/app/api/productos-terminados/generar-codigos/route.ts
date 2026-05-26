import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force dynamic rendering for Vercel serverless
export const dynamic = 'force-dynamic'

/**
 * POST /api/productos-terminados/generar-codigos
 * Generates EAN-13 barcodes for all products that don't have one.
 * Called once to seed existing products.
 */
export async function POST() {
  try {
    // Use findMany without where filter to avoid libSQL null comparison issues
    // Then filter in JS
    const allProductos = await db.productoTerminado.findMany({
      select: { id: true, nombre: true, codigo_barras: true },
      orderBy: { id: 'asc' },
    })

    const productosSinCodigo = allProductos.filter(
      (p) => p.codigo_barras === null || p.codigo_barras === '' || p.codigo_barras === undefined
    )

    if (productosSinCodigo.length === 0) {
      return NextResponse.json({
        message: 'Todos los productos ya tienen código de barras',
        actualizados: 0,
      })
    }

    let actualizados = 0
    const resultados: { id: number; nombre: string; codigo_barras: string }[] = []

    for (const producto of productosSinCodigo) {
      const barcode = generateEAN13(producto.id)

      try {
        await db.productoTerminado.update({
          where: { id: producto.id },
          data: { codigo_barras: barcode },
        })

        resultados.push({ id: producto.id, nombre: producto.nombre, codigo_barras: barcode })
        actualizados++
      } catch (updateErr) {
        console.error(`Error updating product ${producto.id}:`, updateErr)
        // Continue with next product instead of failing entirely
      }
    }

    return NextResponse.json({
      message: `Se generaron ${actualizados} códigos de barras`,
      actualizados,
      resultados,
    })
  } catch (error) {
    console.error('Error generando códigos de barras:', error)
    return NextResponse.json(
      {
        error: 'Error al generar códigos de barras',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * Generate a valid EAN-13 barcode.
 * Format: 779 (Argentina) + 0000 + productId(4 digits) + 0 + checksum
 * Total: 13 digits with valid checksum.
 */
function generateEAN13(productId: number): string {
  const prefix = '779' // Argentina country code
  const twelveDigits = `${prefix}0000${productId.toString().padStart(4, '0')}0`

  // Calculate EAN-13 checksum
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(twelveDigits[i]) * (i % 2 === 0 ? 1 : 3)
  }
  const checksum = (10 - (sum % 10)) % 10

  return twelveDigits + checksum.toString()
}
