import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'

export interface EtiquetaData {
  nombre: string
  descripcion: string | null
  codigo_barras: string | null
  codigo: string | null
  precio_venta: number
  peso: string
  categoria: string | null
  fecha_elaboracion: string
  fecha_vencimiento: string
  lote: string
  info_extra: string[]
  incluir_logo: boolean
  barcodeDataUrl: string | null
  logoDataUrl: string | null
  qrCodeDataUrl: string | null
  vencimientoDia: number
  vencimientoMes: number
  fondoDataUrl: string | null
  watermarkDataUrl: string | null
}

interface EtiquetaProductoPDFProps {
  etiquetas: EtiquetaData[]
}

const ETIQUETAS_POR_HOJA = 24 // 3 columnas x 8 filas

// A4: 595.28 x 841.89 pt
// Márgenes: 0.5cm ≈ 14.17pt (redondeado a 14pt)
const PAGE_MARGIN = 14 // 0.5cm en puntos
const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2
const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_MARGIN * 2
const CELL_WIDTH = CONTENT_WIDTH / 3
const CELL_HEIGHT = CONTENT_HEIGHT / 8
const CELL_GAP = 3 // espacio entre etiquetas
const LABEL_PADDING = 2
const BORDER_RADIUS = 6 // ~8px redondeado

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const styles = StyleSheet.create({
  page: {
    padding: PAGE_MARGIN,
    fontFamily: 'Helvetica',
    position: 'relative',
  },
  // Marca de agua - cubre toda la hoja A4
  watermark: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    opacity: 0.1,
    zIndex: 0,
  },
  // Contenedor de la grilla
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    position: 'relative',
    zIndex: 1,
  },
  // Cada celda de la grilla
  cell: {
    width: CELL_WIDTH,
    height: CELL_HEIGHT,
    padding: CELL_GAP / 2,
  },
  // Etiqueta individual con bordes redondeados
  etiqueta: {
    flex: 1,
    borderRadius: BORDER_RADIUS,
    backgroundColor: '#FFF8E7', // crema suave
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    position: 'relative',
  },
  // Imagen de fondo - cubre toda la etiqueta
  fondo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS,
  },
  // Capa de datos variables superpuesta
  overlay: {
    position: 'relative',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: LABEL_PADDING + 1,
  },

  // ===== TOP: Marca + Info del producto =====
  topRow: {
    flexDirection: 'row',
  },
  brandCol: {
    width: '28%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 2,
  },
  infoCol: {
    width: '72%',
    justifyContent: 'center',
  },
  productName: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#333333',
  },
  artesanalText: {
    fontSize: 3.5,
    fontStyle: 'italic',
    color: '#C41E3A',
    marginTop: 0.5,
  },
  sloganText: {
    fontSize: 2.8,
    color: '#5C3A21',
    fontStyle: 'italic',
    marginTop: 0.3,
    textAlign: 'center',
  },
  whatsappRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1.5,
    marginTop: 1,
  },
  whatsappDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#25D366',
  },
  whatsappText: {
    fontSize: 4,
    fontWeight: 'bold',
    color: '#333333',
  },

  // ===== CALENDAR: Solo highlights del vencimiento =====
  calendarSection: {
    paddingVertical: 1,
  },
  calendarTitle: {
    fontSize: 2.5,
    color: '#5C3A21',
    fontWeight: 'bold',
    marginBottom: 0.5,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0.5,
  },
  dayCell: {
    width: 4.2,
    height: 4.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellActive: {
    width: 4.2,
    height: 4.2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5C3A21',
    borderRadius: 0.5,
  },
  dayNum: {
    fontSize: 2.3,
    color: '#666666',
  },
  dayNumActive: {
    fontSize: 2.3,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  monthsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthCell: {
    width: 10,
    height: 3.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCellActive: {
    width: 10,
    height: 3.8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C41E3A',
    borderRadius: 0.5,
  },
  monthName: {
    fontSize: 2.3,
    color: '#666666',
  },
  monthNameActive: {
    fontSize: 2.3,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // ===== BOTTOM: Código de barras + Precio + Detalles + QR =====
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  bottomLeft: {
    flexDirection: 'column',
  },
  barcodeImg: {
    width: 70,
    height: 12,
  },
  priceTag: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#C41E3A',
    marginTop: 1,
  },
  qrImg: {
    width: 9,
    height: 9,
    marginTop: 1,
  },
  bottomRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  detailLine: {
    fontSize: 2.5,
    color: '#444444',
    lineHeight: 1.4,
  },
  noBarcode: {
    fontSize: 2.5,
    color: '#CCCCCC',
  },
})

export function EtiquetaProductoPDF({ etiquetas }: EtiquetaProductoPDFProps) {
  const totalHojas = Math.ceil(etiquetas.length / ETIQUETAS_POR_HOJA)
  // Tomar el watermark del primer elemento (todos comparten el mismo)
  const watermarkDataUrl = etiquetas[0]?.watermarkDataUrl || null

  return (
    <Document>
      {Array.from({ length: totalHojas }).map((_, hojaIdx) => {
        const inicio = hojaIdx * ETIQUETAS_POR_HOJA
        const fin = inicio + ETIQUETAS_POR_HOJA
        const etiquetasHoja = etiquetas.slice(inicio, fin)

        return (
          <Page key={hojaIdx} size="A4" style={styles.page}>
            {/* ====== MARCA DE AGUA ====== */}
            {/* Imagen de fondo con opacidad 0.1 cubriendo toda la hoja */}
            {watermarkDataUrl && (
              <Image
                src={watermarkDataUrl}
                style={styles.watermark}
                alt=""
              />
            )}

            {/* ====== GRILLA DE ETIQUETAS 3×8 ====== */}
            <View style={styles.grid}>
              {Array.from({ length: ETIQUETAS_POR_HOJA }).map((_, cellIdx) => {
                const etiqueta = etiquetasHoja[cellIdx]
                if (!etiqueta) {
                  // Celda vacía para completar la grilla
                  return (
                    <View key={cellIdx} style={styles.cell}>
                      <View style={[styles.etiqueta, { borderStyle: 'dashed', borderColor: '#d1d5db' }]} />
                    </View>
                  )
                }

                const esArtesanal = etiqueta.info_extra.some(
                  (i) => i.toLowerCase().includes('artesanal')
                )
                const vencDia = etiqueta.vencimientoDia || 1
                const vencMes = etiqueta.vencimientoMes || 1

                return (
                  <View key={cellIdx} style={styles.cell}>
                    <View style={styles.etiqueta}>
                      {/* ====== IMAGEN DE FONDO DE LA ETIQUETA ====== */}
                      {etiqueta.fondoDataUrl && (
                        <Image src={etiqueta.fondoDataUrl} style={styles.fondo} alt="" />
                      )}

                      {/* ====== DATOS VARIABLES SUPERPUESTOS ====== */}
                      <View style={styles.overlay}>
                        {/* Top: Logo/Marca + Info del producto */}
                        <View style={styles.topRow}>
                          <View style={styles.brandCol}>
                            {etiqueta.incluir_logo && etiqueta.logoDataUrl ? (
                              <Image
                                src={etiqueta.logoDataUrl}
                                style={{ width: 14, height: 14, borderRadius: 7 }}
                                alt="Logo"
                              />
                            ) : (
                              <Text style={{ fontSize: 5, color: '#C41E3A', fontWeight: 'bold' }}>O</Text>
                            )}
                            <Text style={{ fontSize: 3, color: '#C41E3A', fontWeight: 'bold', marginTop: 0.5 }}>
                              Orlando
                            </Text>
                            <Text style={styles.sloganText}>
                              El amigo{'\n'}de las pastas
                            </Text>
                          </View>
                          <View style={styles.infoCol}>
                            <Text style={styles.productName}>{etiqueta.nombre}</Text>
                            {esArtesanal && (
                              <Text style={styles.artesanalText}>producto artesanal</Text>
                            )}
                            <View style={styles.whatsappRow}>
                              <View style={styles.whatsappDot} />
                              <Text style={styles.whatsappText}>3754-419324</Text>
                            </View>
                          </View>
                        </View>

                        {/* Calendar: Solo se dibujan los highlights del día/mes de vencimiento */}
                        <View style={styles.calendarSection}>
                          <Text style={styles.calendarTitle}>Vencimiento</Text>
                          <View style={styles.daysRow}>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => {
                              const isActive = dia === vencDia
                              return (
                                <View key={dia} style={isActive ? styles.dayCellActive : styles.dayCell}>
                                  <Text style={isActive ? styles.dayNumActive : styles.dayNum}>
                                    {dia}
                                  </Text>
                                </View>
                              )
                            })}
                          </View>
                          <View style={styles.monthsRow}>
                            {MESES.map((mes, idx) => {
                              const isActive = idx + 1 === vencMes
                              return (
                                <View key={mes} style={isActive ? styles.monthCellActive : styles.monthCell}>
                                  <Text style={isActive ? styles.monthNameActive : styles.monthName}>
                                    {mes}
                                  </Text>
                                </View>
                              )
                            })}
                          </View>
                        </View>

                        {/* Bottom: Código de barras + Precio + Detalles + QR */}
                        <View style={styles.bottomRow}>
                          <View style={styles.bottomLeft}>
                            {etiqueta.barcodeDataUrl ? (
                              <Image src={etiqueta.barcodeDataUrl} style={styles.barcodeImg} alt="Código de barras" />
                            ) : (
                              <Text style={styles.noBarcode}>Sin código</Text>
                            )}
                            <Text style={styles.priceTag}>
                              ${etiqueta.precio_venta.toLocaleString('es-AR')}
                            </Text>
                            {etiqueta.qrCodeDataUrl && (
                              <Image src={etiqueta.qrCodeDataUrl} style={styles.qrImg} alt="QR" />
                            )}
                          </View>
                          <View style={styles.bottomRight}>
                            <Text style={styles.detailLine}>Peso: {etiqueta.peso}</Text>
                            <Text style={styles.detailLine}>Elab: {etiqueta.fecha_elaboracion}</Text>
                            <Text style={styles.detailLine}>Lote: {etiqueta.lote}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                )
              })}
            </View>
          </Page>
        )
      })}
    </Document>
  )
}
