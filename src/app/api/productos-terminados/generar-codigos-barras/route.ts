import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Calcula el dígito verificador de un código EAN-13
 */
function calcularCheckDigitEAN13(digits12: string): string {
  const digits = digits12.split('').map(Number)
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3)
  }
  return String((10 - (sum % 10)) % 10)
}

/**
 * Genera un código EAN-13 secuencial a partir de un contador
 * Formato: 779 + 9 dígitos + 1 check digit = 13 dígitos
 */
function generarCodigoEAN13(contador: number): string {
  const prefijo = '779'
  const numero = contador.toString().padStart(9, '0')
  const base = prefijo + numero
  const checkDigit = calcularCheckDigitEAN13(base)
  return base + checkDigit
}

/**
 * GET /api/productos-terminados/generar-codigos-barras
 * Devuelve el próximo código EAN-13 que se generaría (para previsualización en formularios)
 */
export async function GET() {
  try {
    const ultimo = await db.productoTerminado.findFirst({
      where: {
        codigo_barras: { not: null, startsWith: '779' },
      },
      orderBy: { codigo_barras: 'desc' },
      select: { codigo_barras: true },
    })

    let contador = 1
    if (ultimo?.codigo_barras) {
      const numeroStr = ultimo.codigo_barras.substring(3, 12)
      contador = parseInt(numeroStr, 10) + 1
    }

    const proximoCodigo = generarCodigoEAN13(contador)
    return NextResponse.json({ proximo_codigo: proximoCodigo, contador })
  } catch (error) {
    console.error('Error al obtener próximo código:', error)
    return NextResponse.json({ error: 'Error al obtener próximo código' }, { status: 500 })
  }
}

/**
 * POST /api/productos-terminados/generar-codigos-barras
 * Genera códigos de barras EAN-13 para todos los productos que no tienen uno.
 * Requiere secret de autorización.
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    // Verificar autorización
    if (secret !== 'pastas-orlando-seed-2026') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Buscar todos los productos sin código de barras
    const sinCodigo = await db.productoTerminado.findMany({
      where: { codigo_barras: null },
      orderBy: { id: 'asc' },
      select: { id: true, nombre: true },
    })

    if (sinCodigo.length === 0) {
      return NextResponse.json({
        message: 'Todos los productos ya tienen código de barras',
        actualizados: 0,
      })
    }

    // Buscar el último código de barras secuencial existente (que empiece con 779)
    const conCodigo = await db.productoTerminado.findMany({
      where: {
        codigo_barras: { not: null, startsWith: '779' },
      },
      orderBy: { codigo_barras: 'desc' },
      select: { codigo_barras: true },
      take: 1,
    })

    let siguienteContador = 1
    if (conCodigo.length > 0 && conCodigo[0].codigo_barras) {
      // Extraer los 9 dígitos después de "779" (posiciones 3-11)
      const ultimoCodigo = conCodigo[0].codigo_barras
      const numeroStr = ultimoCodigo.substring(3, 12)
      siguienteContador = parseInt(numeroStr, 10) + 1
    }

    // Generar y asignar códigos
    const resultados: { id: number; nombre: string; codigo_barras: string }[] = []
    let contador = siguienteContador

    for (const producto of sinCodigo) {
      let ean13 = generarCodigoEAN13(contador)

      // Verificar que no exista (por seguridad)
      let existe = await db.productoTerminado.findUnique({ where: { codigo_barras: ean13 } })
      while (existe) {
        contador++
        ean13 = generarCodigoEAN13(contador)
        existe = await db.productoTerminado.findUnique({ where: { codigo_barras: ean13 } })
      }

      await db.productoTerminado.update({
        where: { id: producto.id },
        data: { codigo_barras: ean13 },
      })

      resultados.push({ id: producto.id, nombre: producto.nombre, codigo_barras: ean13 })
      contador++
    }

    return NextResponse.json({
      message: `Se generaron ${resultados.length} códigos de barras`,
      actualizados: resultados.length,
      contador_siguiente: contador,
      codigos: resultados,
    })
  } catch (error) {
    console.error('Error al generar códigos de barras:', error)
    return NextResponse.json({ error: 'Error al generar códigos de barras' }, { status: 500 })
  }
}
