import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'

export type TamanoEtiqueta = 'grande' | 'pequena'

export interface EtiquetaData {
  nombre: string
  codigo_barras: string | null
  precio_venta: number
  peso: string
  fecha_elaboracion: string
  fecha_vencimiento: string
  incluir_logo: boolean
  incluir_vencimiento: boolean
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
  tamano?: TamanoEtiqueta
}

// A4: 595.28 x 841.89 pt
const PAGE_MARGIN = 14
const PAGE_WIDTH = 595.28
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2
const CONTENT_HEIGHT = 841.89 - PAGE_MARGIN * 2

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// ===== LAYOUT CONFIG BY SIZE =====
function getLayout(tamano: TamanoEtiqueta) {
  const columnas = tamano === 'pequena' ? 5 : 3
  const filas = 8
  const s = tamano === 'pequena' ? 0.65 : 1.0

  return {
    etiquetasPorHoja: columnas * filas,
    columnas,
    filas,
    cellWidth: CONTENT_WIDTH / columnas,
    cellHeight: CONTENT_HEIGHT / filas,
    cellGap: 2 * s,
    s,
  }
}

function createStyles(s: number, cellGap: number) {
  return StyleSheet.create({
    page: {
      padding: PAGE_MARGIN,
      fontFamily: 'Helvetica',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    cell: {
      width: CONTENT_WIDTH / (s < 1 ? 5 : 3),
      height: CONTENT_HEIGHT / 8,
      padding: cellGap / 2,
    },
    etiqueta: {
      flex: 1,
      borderRadius: 6 * s,
      backgroundColor: '#FFFFFF',
      border: '1px solid #d1d5db',
      padding: 4 * s,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      position: 'relative',
    },

    // ===== FILA 1: LOGO + NOMBRE =====
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 1 * s,
    },
    logoCol: {
      width: '30%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoImg: {
      width: 42 * s,
      height: 42 * s,
    },
    nameCol: {
      width: '70%',
      justifyContent: 'center',
      paddingLeft: 3 * s,
    },
    productName: {
      fontSize: 7 * s,
      fontWeight: 'bold',
      color: '#1f2937',
    },

    // ===== FILA 2: INFO EXTRA + PRECIO/PESO =====
    infoPriceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: 1 * s,
    },
    infoExtraLeft: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      flex: 1,
    },
    infoText: {
      fontSize: 3.5 * s,
      color: '#374151',
      marginRight: 2 * s,
    },
    priceWeightCol: {
      flexDirection: 'column',
      alignItems: 'flex-end',
    },
    priceText: {
      fontSize: 7 * s,
      fontWeight: 'bold',
      color: '#000000',
    },
    pesoText: {
      fontSize: 4.5 * s,
      color: '#374151',
    },

    // ===== VENCIMIENTO LABEL =====
    vencimientoLabel: {
      fontSize: 3.5 * s,
      color: '#374151',
      marginBottom: 0.5 * s,
    },

    // ===== CALENDARIO =====
    calendarSection: {
      borderTopWidth: 0.3 * s,
      borderLeftWidth: 0.3 * s,
      borderRightWidth: 0.3 * s,
      borderBottomWidth: 0.3 * s,
      borderColor: '#000000',
      marginBottom: 2 * s,
    },
    calendarRow: {
      flexDirection: 'row',
    },
    dayCell: {
      width: '3.226%',
      height: 5 * s,
      alignItems: 'center',
      justifyContent: 'center',
      borderRightWidth: 0.2 * s,
      borderBottomWidth: 0.2 * s,
      borderColor: '#000000',
    },
    dayNum: {
      fontSize: 2.5 * s,
      color: '#4b5563',
    },
    dayNumHighlight: {
      fontSize: 2.5 * s,
      color: '#C41E3A',
      fontWeight: 'bold',
    },
    monthCell: {
      width: '8.333%',
      height: 5 * s,
      alignItems: 'center',
      justifyContent: 'center',
      borderRightWidth: 0.2 * s,
      borderBottomWidth: 0,
      borderColor: '#000000',
    },
    monthName: {
      fontSize: 2.5 * s,
      color: '#4b5563',
    },
    monthNameHighlight: {
      fontSize: 2.5 * s,
      color: '#C41E3A',
      fontWeight: 'bold',
    },

    // ===== FILA INFERIOR =====
    bottomSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    leftBottomCol: {
      flexDirection: 'column',
      flex: 1,
      marginRight: 2 * s,
    },
    barcodeImg: {
      width: 65 * s,
      height: 18 * s,
    },
    noBarcode: {
      fontSize: 4 * s,
      color: '#d1d5db',
    },
    elabText: {
      fontSize: 3.5 * s,
      color: '#6b7280',
      marginTop: 1 * s,
    },
    rightBottomCol: {
      flexDirection: 'column',
      alignItems: 'flex-end',
      width: 28 * s,
    },
    qrImg: {
      width: 20 * s,
      height: 20 * s,
    },
    waInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 1 * s,
      alignSelf: 'stretch',
      justifyContent: 'flex-end',
    },
    whatsappIconImg: {
      width: 4 * s,
      height: 4 * s,
      marginRight: 0.5 * s,
    },
    whatsappText: {
      fontSize: 2.8 * s,
      color: '#25D366',
      fontWeight: 'bold',
    },
  })
}

/** Ícono de WhatsApp nativo (funciona en @react-pdf/renderer) */
function WhatsAppIcon({ scale: s }: { scale: number }) {
  return (
    <View style={{ width: 4 * s, height: 4 * s, marginRight: 0.5 * s }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 4 * s,
          height: 4 * s,
          borderRadius: 2 * s,
          backgroundColor: '#25D366',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 1 * s,
          left: 1.2 * s,
          width: 1.6 * s,
          height: 1.6 * s,
          backgroundColor: '#FFFFFF',
          borderRadius: 0.3 * s,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 0.6 * s,
          left: 1.3 * s,
          width: 1.4 * s,
          height: 0.7 * s,
          backgroundColor: '#FFFFFF',
          borderRadius: 0.4 * s,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 2 * s,
          left: 1.3 * s,
          width: 1.4 * s,
          height: 0.7 * s,
          backgroundColor: '#FFFFFF',
          borderRadius: 0.4 * s,
        }}
      />
    </View>
  )
}

export function EtiquetaProductoPDF({ etiquetas, tamano = 'grande' }: EtiquetaProductoPDFProps) {
  const layout = getLayout(tamano)
  const styles = createStyles(layout.s, layout.cellGap)
  const s = layout.s
  const totalHojas = Math.ceil(etiquetas.length / layout.etiquetasPorHoja)

  return (
    <Document>
      {Array.from({ length: totalHojas }).map((_, hojaIdx) => {
        const inicio = hojaIdx * layout.etiquetasPorHoja
        const fin = inicio + layout.etiquetasPorHoja
        const etiquetasHoja = etiquetas.slice(inicio, fin)

        return (
          <Page key={hojaIdx} size="A4" style={styles.page}>
            <View style={styles.grid}>
              {Array.from({ length: layout.etiquetasPorHoja }).map((_, cellIdx) => {
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

                      {/* ====== FILA 1: LOGO (izq) + NOMBRE (der del logo) ====== */}
                      <View style={styles.topRow}>
                        <View style={styles.logoCol}>
                          {etiqueta.incluir_logo && etiqueta.logoDataUrl ? (
                            <Image src={etiqueta.logoDataUrl} style={styles.logoImg} alt="Logo" />
                          ) : null}
                        </View>
                        <View style={styles.nameCol}>
                          <Text style={styles.productName}>{etiqueta.nombre}</Text>
                        </View>
                      </View>

                      {/* ====== FILA 2: INFO EXTRA (izq) + PRECIO/PESO (der) ====== */}
                      <View style={styles.infoPriceRow}>
                        <View style={styles.infoExtraLeft}>
                          {etiqueta.info_extra.map((info, idx) => (
                            <Text key={idx} style={styles.infoText}>{info}</Text>
                          ))}
                        </View>
                        <View style={styles.priceWeightCol}>
                          <Text style={styles.priceText}>${etiqueta.precio_venta.toLocaleString('es-AR')}</Text>
                          <Text style={styles.pesoText}>Peso: {etiqueta.peso}</Text>
                        </View>
                      </View>

                      {/* ====== TEXTO "VENCIMIENTO" SOBRE EL CALENDARIO ====== */}
                      <Text style={styles.vencimientoLabel}>Vencimiento</Text>

                      {/* ====== CALENDARIO (con resaltado si incluir_vencimiento) ====== */}
                      <View style={styles.calendarSection}>
                        {/* Días 1-31 */}
                        <View style={styles.calendarRow}>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
                            <View key={dia} style={styles.dayCell}>
                              <Text style={etiqueta.incluir_vencimiento && dia === etiqueta.vencimientoDia ? styles.dayNumHighlight : styles.dayNum}>{dia}</Text>
                            </View>
                          ))}
                        </View>
                        {/* Meses ene-dic */}
                        <View style={styles.calendarRow}>
                          {MESES.map((mes, idx) => (
                            <View key={mes} style={styles.monthCell}>
                              <Text style={etiqueta.incluir_vencimiento && (idx + 1) === etiqueta.vencimientoMes ? styles.monthNameHighlight : styles.monthName}>{mes}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* ====== FILA INFERIOR: BARRAS+ELAB (izq) | QR+WHATSAPP (der) ====== */}
                      <View style={styles.bottomSection}>
                        <View style={styles.leftBottomCol}>
                          {etiqueta.barcodeDataUrl ? (
                            <Image src={etiqueta.barcodeDataUrl} style={styles.barcodeImg} alt="Código de barras" />
                          ) : (
                            <Text style={styles.noBarcode}>Sin código de barras</Text>
                          )}
                          <Text style={styles.elabText}>Elab: {etiqueta.fecha_elaboracion}</Text>
                        </View>
                        <View style={styles.rightBottomCol}>
                          {etiqueta.qrCodeDataUrl && (
                            <Image src={etiqueta.qrCodeDataUrl} style={styles.qrImg} alt="QR" />
                          )}
                          <View style={styles.waInfo}>
                            {etiqueta.whatsappIconDataUrl ? (
                              <Image src={etiqueta.whatsappIconDataUrl} style={styles.whatsappIconImg} alt="WhatsApp" />
                            ) : (
                              <WhatsAppIcon scale={s} />
                            )}
                            <Text style={styles.whatsappText}>3754-419324</Text>
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
