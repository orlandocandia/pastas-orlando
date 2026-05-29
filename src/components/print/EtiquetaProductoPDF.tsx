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
}

interface EtiquetaProductoPDFProps {
  etiquetas: EtiquetaData[]
}

const ETIQUETAS_POR_HOJA = 24 // 3 columnas x 8 filas

// A4: 595.28 x 841.89 pt
// Márgenes: 0.5cm ≈ 14pt
const PAGE_MARGIN = 14
const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2
const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_MARGIN * 2
const CELL_WIDTH = CONTENT_WIDTH / 3
const CELL_HEIGHT = CONTENT_HEIGHT / 8
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
    padding: 4,
    flexDirection: 'column',
  },

  // ===== LOGO CENTRADO =====
  logoContainer: {
    alignItems: 'center',
    marginBottom: 2,
  },
  logoImg: {
    width: 28,
    height: 28,
  },

  // ===== NOMBRE DEL PRODUCTO =====
  productName: {
    fontSize: 6.5,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 1,
  },

  // ===== PRECIO Y PESO =====
  priceWeightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  pesoText: {
    fontSize: 4.5,
    color: '#6b7280',
  },
  priceText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#C41E3A',
  },

  // ===== CALENDARIO DE VENCIMIENTO =====
  calendarSection: {
    marginBottom: 2,
    borderWidth: 0.5,
    borderColor: '#93a5cf',
    borderRadius: 1,
    overflow: 'hidden',
  },
  calendarRow: {
    flexDirection: 'row',
  },
  calendarLabel: {
    fontSize: 3.5,
    color: '#4a5eb0',
    fontWeight: 'bold',
    paddingVertical: 0.5,
    paddingHorizontal: 1,
    textAlign: 'center',
  },
  // Día normal
  dayCell: {
    width: 5.3,
    height: 4.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 0.3,
    borderBottomWidth: 0.3,
    borderColor: '#b0bdd4',
  },
  // Día resaltado (vencimiento)
  dayCellActive: {
    width: 5.3,
    height: 4.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b5998',
    borderRightWidth: 0.3,
    borderBottomWidth: 0.3,
    borderColor: '#b0bdd4',
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
  // Mes normal
  monthCell: {
    width: 13.5,
    height: 4.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 0.3,
    borderColor: '#b0bdd4',
  },
  // Mes resaltado (vencimiento)
  monthCellActive: {
    width: 13.5,
    height: 4.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C41E3A',
    borderRightWidth: 0.3,
    borderColor: '#b0bdd4',
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

  // ===== BARRA INFERIOR: Código barras + QR + WhatsApp =====
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barcodeCol: {
    flexDirection: 'column',
    flex: 1,
  },
  barcodeImg: {
    width: 75,
    height: 14,
  },
  noBarcode: {
    fontSize: 3.5,
    color: '#d1d5db',
  },
  qrCol: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 2,
  },
  qrImg: {
    width: 16,
    height: 16,
  },
  whatsappRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0.5,
  },
  whatsappIcon: {
    width: 4,
    height: 4,
    marginRight: 0.5,
  },
  whatsappText: {
    fontSize: 3,
    color: '#25D366',
    fontWeight: 'bold',
  },

  // ===== FECHA DE ELABORACIÓN =====
 elabRow: {
    marginTop: 1.5,
  },
  elabText: {
    fontSize: 3.5,
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
                      {/* ====== LOGO CENTRADO ====== */}
                      {etiqueta.incluir_logo && etiqueta.logoDataUrl ? (
                        <View style={styles.logoContainer}>
                          <Image src={etiqueta.logoDataUrl} style={styles.logoImg} alt="Logo" />
                        </View>
                      ) : null}

                      {/* ====== NOMBRE DEL PRODUCTO ====== */}
                      <Text style={styles.productName}>{etiqueta.nombre}</Text>

                      {/* ====== PESO Y PRECIO ====== */}
                      <View style={styles.priceWeightRow}>
                        <Text style={styles.pesoText}>{etiqueta.peso}</Text>
                        <Text style={styles.priceText}>
                          ${etiqueta.precio_venta.toLocaleString('es-AR')}
                        </Text>
                      </View>

                      {/* ====== CALENDARIO DE VENCIMIENTO ====== */}
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
                        {/* Fila de meses: ene-dic */}
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

                      {/* ====== CÓDIGO DE BARRAS + QR + WHATSAPP ====== */}
                      <View style={styles.bottomRow}>
                        <View style={styles.barcodeCol}>
                          {etiqueta.barcodeDataUrl ? (
                            <Image src={etiqueta.barcodeDataUrl} style={styles.barcodeImg} alt="Código de barras" />
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
