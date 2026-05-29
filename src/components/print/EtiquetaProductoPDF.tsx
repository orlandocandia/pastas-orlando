import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'

export interface EtiquetaData {
  nombre: string
  codigo_barras: string | null
  precio_venta: number
  peso: string
  fecha_elaboracion: string
  fecha_vencimiento: string
  incluir_logo: boolean
  barcodeDataUrl: string | null
  logoDataUrl: string | null
  qrCodeDataUrl: string | null
  whatsappIconDataUrl: string | null
  vencimientoDia: number
  vencimientoMes: number
  info_extra: string[]
}

interface EtiquetaProductoPDFProps {
  etiquetas: EtiquetaData[]
}

const ETIQUETAS_POR_HOJA = 24 // 3 columnas x 8 filas

// A4: 595.28 x 841.89 pt
// Márgenes: 0.5cm ≈ 14pt
const PAGE_MARGIN = 14
const PAGE_WIDTH = 595.28
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2
const CELL_WIDTH = CONTENT_WIDTH / 3
const CELL_HEIGHT = (841.89 - PAGE_MARGIN * 2) / 8
const CELL_GAP = 2
const BORDER_RADIUS = 6

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const styles = StyleSheet.create({
  page: {
    padding: PAGE_MARGIN,
    fontFamily: 'Helvetica',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: CELL_WIDTH,
    height: CELL_HEIGHT,
    padding: CELL_GAP / 2,
  },
  etiqueta: {
    flex: 1,
    borderRadius: BORDER_RADIUS,
    backgroundColor: '#FFFFFF',
    border: '1px solid #d1d5db',
    padding: 5,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  // ===== TOP: LOGO IZQUIERDA + NOMBRE/PRECIO DERECHA =====
  topRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  logoCol: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingRight: 3,
  },
  logoImg: {
    width: 24,
    height: 24,
  },
  infoCol: {
    width: '70%',
    justifyContent: 'flex-start',
  },
  productName: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 1,
  },
  priceWeightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  pesoText: {
    fontSize: 5,
    color: '#6b7280',
  },
  priceText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#C41E3A',
  },

  // ===== CALENDARIO DE VENCIMIENTO (grid 31 columnas) =====
  calendarSection: {
    marginVertical: 2,
    borderWidth: 0.5,
    borderColor: '#4a6fa5',
    borderRadius: 1,
    overflow: 'hidden',
  },
  calendarRow: {
    flexDirection: 'row',
  },
  // Cada celda de día: 100%/31 ≈ 3.226%
  dayCell: {
    width: '3.226%',
    height: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 0.3,
    borderBottomWidth: 0.3,
    borderColor: '#8fa8cc',
  },
  dayCellActive: {
    width: '3.226%',
    height: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b5998',
    borderRightWidth: 0.3,
    borderBottomWidth: 0.3,
    borderColor: '#8fa8cc',
  },
  dayNum: {
    fontSize: 2.8,
    color: '#4b5563',
  },
  dayNumActive: {
    fontSize: 2.8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Cada celda de mes: 100%/12 ≈ 8.333%
  monthCell: {
    width: '8.333%',
    height: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 0.3,
    borderColor: '#8fa8cc',
  },
  monthCellActive: {
    width: '8.333%',
    height: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C41E3A',
    borderRightWidth: 0.3,
    borderColor: '#8fa8cc',
  },
  monthName: {
    fontSize: 2.8,
    color: '#4b5563',
  },
  monthNameActive: {
    fontSize: 2.8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // ===== INFO EXTRA (badges) =====
  infoExtraRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
    marginVertical: 1,
  },
  infoBadge: {
    fontSize: 2.8,
    color: '#4a5eb0',
    borderWidth: 0.5,
    borderColor: '#8fa8cc',
    borderRadius: 1,
    paddingHorizontal: 2,
    paddingVertical: 0.5,
  },

  // ===== BOTTOM: Código de barras + QR + WhatsApp =====
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barcodeCol: {
    flexDirection: 'column',
    flex: 1,
    marginRight: 2,
  },
  barcodeImg: {
    width: 70,
    height: 16,
  },
  barcodeNumber: {
    fontSize: 3.5,
    color: '#4b5563',
    fontFamily: 'Helvetica',
    marginTop: 0.5,
  },
  noBarcode: {
    fontSize: 4,
    color: '#d1d5db',
  },
  qrCol: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  qrImg: {
    width: 22,
    height: 22,
  },
  whatsappRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  whatsappIcon: {
    width: 5,
    height: 5,
    marginRight: 1,
  },
  whatsappText: {
    fontSize: 3.5,
    color: '#25D366',
    fontWeight: 'bold',
  },

  // ===== FECHA DE ELABORACIÓN =====
  elabRow: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  elabText: {
    fontSize: 4,
    color: '#6b7280',
  },
})

export function EtiquetaProductoPDF({ etiquetas }: EtiquetaProductoPDFProps) {
  const totalHojas = Math.ceil(etiquetas.length / ETIQUETAS_POR_HOJA)

  return (
    <Document>
      {Array.from({ length: totalHojas }).map((_, hojaIdx) => {
        const inicio = hojaIdx * ETIQUETAS_POR_HOJA
        const fin = inicio + ETIQUETAS_POR_HOJA
        const etiquetasHoja = etiquetas.slice(inicio, fin)

        return (
          <Page key={hojaIdx} size="A4" style={styles.page}>
            <View style={styles.grid}>
              {Array.from({ length: ETIQUETAS_POR_HOJA }).map((_, cellIdx) => {
                const etiqueta = etiquetasHoja[cellIdx]
                if (!etiqueta) {
                  return (
                    <View key={cellIdx} style={styles.cell}>
                      <View style={[styles.etiqueta, { borderStyle: 'dashed', borderColor: '#d1d5db' }]} />
                    </View>
                  )
                }

                const vencDia = etiqueta.vencimientoDia || 1
                const vencMes = etiqueta.vencimientoMes || 1

                return (
                  <View key={cellIdx} style={styles.cell}>
                    <View style={styles.etiqueta}>
                      {/* ====== TOP: LOGO IZQUIERDA + NOMBRE/PRECIO DERECHA ====== */}
                      <View style={styles.topRow}>
                        <View style={styles.logoCol}>
                          {etiqueta.incluir_logo && etiqueta.logoDataUrl ? (
                            <Image src={etiqueta.logoDataUrl} style={styles.logoImg} alt="Logo" />
                          ) : null}
                        </View>
                        <View style={styles.infoCol}>
                          <Text style={styles.productName}>{etiqueta.nombre}</Text>
                          <View style={styles.priceWeightRow}>
                            <Text style={styles.pesoText}>{etiqueta.peso}</Text>
                            <Text style={styles.priceText}>
                              ${etiqueta.precio_venta.toLocaleString('es-AR')}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* ====== CALENDARIO DE VENCIMIENTO (31 cols = 3.226% cada una) ====== */}
                      <View style={styles.calendarSection}>
                        {/* Fila de días: 1-31 */}
                        <View style={styles.calendarRow}>
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
                        {/* Fila de meses: ene-dic (12 cols = 8.333% cada una) */}
                        <View style={styles.calendarRow}>
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

                      {/* ====== INFO EXTRA (badges opcionales) ====== */}
                      {etiqueta.info_extra.length > 0 && (
                        <View style={styles.infoExtraRow}>
                          {etiqueta.info_extra.map((info) => (
                            <Text key={info} style={styles.infoBadge}>{info}</Text>
                          ))}
                        </View>
                      )}

                      {/* ====== CÓDIGO DE BARRAS + QR + WHATSAPP ====== */}
                      <View style={styles.bottomRow}>
                        <View style={styles.barcodeCol}>
                          {etiqueta.barcodeDataUrl ? (
                            <>
                              <Image src={etiqueta.barcodeDataUrl} style={styles.barcodeImg} alt="Código de barras" />
                              {etiqueta.codigo_barras && (
                                <Text style={styles.barcodeNumber}>{etiqueta.codigo_barras}</Text>
                              )}
                            </>
                          ) : (
                            <Text style={styles.noBarcode}>Sin código de barras</Text>
                          )}
                        </View>
                        <View style={styles.qrCol}>
                          {etiqueta.qrCodeDataUrl && (
                            <Image src={etiqueta.qrCodeDataUrl} style={styles.qrImg} alt="QR" />
                          )}
                          <View style={styles.whatsappRow}>
                            {etiqueta.whatsappIconDataUrl && (
                              <Image src={etiqueta.whatsappIconDataUrl} style={styles.whatsappIcon} alt="WhatsApp" />
                            )}
                            <Text style={styles.whatsappText}>3754-419324</Text>
                          </View>
                        </View>
                      </View>

                      {/* ====== FECHA DE ELABORACIÓN ====== */}
                      <View style={styles.elabRow}>
                        <Text style={styles.elabText}>Elab: {etiqueta.fecha_elaboracion}</Text>
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
