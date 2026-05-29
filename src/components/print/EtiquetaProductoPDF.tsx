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
    justifyContent: 'flex-start',
  },

  // ===== 1. LOGO CENTRADO (MÁS GRANDE) =====
  logoCenter: {
    alignItems: 'center',
    marginBottom: 2,
  },
  logoImg: {
    width: 36,
    height: 36,
  },

  // ===== 2. TÍTULO CENTRADO =====
  productName: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 2,
  },

  // ===== 3. PESO CENTRADO =====
  pesoText: {
    fontSize: 5.5,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 1,
  },

  // ===== 4. PRECIO CENTRADO =====
  priceText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#C41E3A',
    textAlign: 'center',
    marginBottom: 2,
  },

  // ===== 5. INFO EXTRA (badges) =====
  infoExtraRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 1,
    marginBottom: 2,
  },
  infoBadge: {
    fontSize: 3,
    color: '#4a5eb0',
    borderWidth: 0.5,
    borderColor: '#8fa8cc',
    borderRadius: 1,
    paddingHorizontal: 2,
    paddingVertical: 0.5,
  },

  // ===== 6. CÓDIGO DE BARRAS + QR (fila) =====
  barcodeQrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 1,
  },
  barcodeCol: {
    flexDirection: 'column',
    flex: 1,
    marginRight: 2,
  },
  barcodeImg: {
    width: 68,
    height: 16,
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

  // ===== 7. WA + ELAB (fila) =====
  waElabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  waInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  elabText: {
    fontSize: 4,
    color: '#6b7280',
  },

  // ===== 8. CALENDARIO NEUTRO (sin selección) =====
  calendarSection: {
    borderWidth: 0.5,
    borderColor: '#4a6fa5',
    borderRadius: 1,
    overflow: 'hidden',
  },
  calendarRow: {
    flexDirection: 'row',
  },
  // Celdas de día (neutras, sin highlight)
  dayCell: {
    width: '3.226%',
    height: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 0.3,
    borderBottomWidth: 0.3,
    borderColor: '#8fa8cc',
  },
  dayNum: {
    fontSize: 2.8,
    color: '#4b5563',
  },
  // Celdas de mes (neutras, sin highlight)
  monthCell: {
    width: '8.333%',
    height: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 0.3,
    borderColor: '#8fa8cc',
  },
  monthName: {
    fontSize: 2.8,
    color: '#4b5563',
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

                return (
                  <View key={cellIdx} style={styles.cell}>
                    <View style={styles.etiqueta}>
                      {/* ====== 1. LOGO CENTRADO (MÁS GRANDE) ====== */}
                      {etiqueta.incluir_logo && etiqueta.logoDataUrl ? (
                        <View style={styles.logoCenter}>
                          <Image src={etiqueta.logoDataUrl} style={styles.logoImg} alt="Logo" />
                        </View>
                      ) : null}

                      {/* ====== 2. TÍTULO DEL PRODUCTO CENTRADO ====== */}
                      <Text style={styles.productName}>{etiqueta.nombre}</Text>

                      {/* ====== 3. PESO CENTRADO ====== */}
                      <Text style={styles.pesoText}>Peso: {etiqueta.peso}</Text>

                      {/* ====== 4. PRECIO CENTRADO ====== */}
                      <Text style={styles.priceText}>
                        ${etiqueta.precio_venta.toLocaleString('es-AR')}
                      </Text>

                      {/* ====== 5. INFO EXTRA (badges opcionales) ====== */}
                      {etiqueta.info_extra.length > 0 && (
                        <View style={styles.infoExtraRow}>
                          {etiqueta.info_extra.map((info) => (
                            <Text key={info} style={styles.infoBadge}>{info}</Text>
                          ))}
                        </View>
                      )}

                      {/* ====== 6. CÓDIGO DE BARRAS + QR (fila) ====== */}
                      <View style={styles.barcodeQrRow}>
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
                        </View>
                      </View>

                      {/* ====== 7. WHATSAPP + FECHA ELABORACIÓN (fila alineada) ====== */}
                      <View style={styles.waElabRow}>
                        <View style={styles.waInfo}>
                          {etiqueta.whatsappIconDataUrl && (
                            <Image src={etiqueta.whatsappIconDataUrl} style={styles.whatsappIcon} alt="WhatsApp" />
                          )}
                          <Text style={styles.whatsappText}>3754-419324</Text>
                        </View>
                        <Text style={styles.elabText}>Elab: {etiqueta.fecha_elaboracion}</Text>
                      </View>

                      {/* ====== 8. CALENDARIO NEUTRO (sin día/mes seleccionado) ====== */}
                      <View style={styles.calendarSection}>
                        {/* Fila de días: 1-31 (todos neutros) */}
                        <View style={styles.calendarRow}>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
                            <View key={dia} style={styles.dayCell}>
                              <Text style={styles.dayNum}>{dia}</Text>
                            </View>
                          ))}
                        </View>
                        {/* Fila de meses: ene-dic (todos neutros) */}
                        <View style={styles.calendarRow}>
                          {MESES.map((mes) => (
                            <View key={mes} style={styles.monthCell}>
                              <Text style={styles.monthName}>{mes}</Text>
                            </View>
                          ))}
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
