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
    padding: 4,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },

  // ===== FILA 1: LOGO (izquierda) + NOMBRE (derecha del logo) =====
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  logoCol: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImg: {
    width: 42,
    height: 42,
  },
  nameCol: {
    width: '70%',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  productName: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#1f2937',
  },

  // ===== FILA 2: INFO EXTRA (izq) + PRECIO/PESO (der) =====
  infoPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 1,
  },
  infoExtraLeft: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  infoText: {
    fontSize: 3.5,
    color: '#374151',
    marginRight: 2,
  },
  priceWeightCol: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#000000',
  },
  pesoText: {
    fontSize: 4.5,
    color: '#374151',
  },

  // ===== TEXTO "VENCIMIENTO" SOBRE EL CALENDARIO =====
  vencimientoLabel: {
    fontSize: 3.5,
    color: '#374151',
    marginBottom: 0.5,
  },

  // ===== CALENDARIO (bordes negros visibles, neutro) =====
  calendarSection: {
    borderWidth: 0.7,
    borderColor: '#000000',
    marginBottom: 2,
  },
  calendarRow: {
    flexDirection: 'row',
  },
  dayCell: {
    width: '3.226%',
    height: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#000000',
  },
  dayNum: {
    fontSize: 2.5,
    color: '#4b5563',
  },
  monthCell: {
    width: '8.333%',
    height: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#000000',
  },
  monthName: {
    fontSize: 2.5,
    color: '#4b5563',
  },

  // ===== FILA INFERIOR: CÓDIGO DE BARRAS (izq) | QR + WHATSAPP (der) =====
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftBottomCol: {
    flexDirection: 'column',
    flex: 1,
    marginRight: 2,
  },
  barcodeImg: {
    width: 65,
    height: 18,
  },
  noBarcode: {
    fontSize: 4,
    color: '#d1d5db',
  },
  elabText: {
    fontSize: 3.5,
    color: '#6b7280',
    marginTop: 1,
  },
  rightBottomCol: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  qrImg: {
    width: 20,
    height: 20,
  },
  waInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  whatsappIconImg: {
    width: 5,
    height: 5,
    marginRight: 1,
  },
  whatsappText: {
    fontSize: 3.5,
    color: '#25D366',
    fontWeight: 'bold',
  },
})

/** Dibuja el ícono de WhatsApp como un círculo verde con un teléfono blanco simplificado */
function WhatsAppIcon() {
  return (
    <View style={{ width: 5, height: 5, marginRight: 1 }}>
      {/* Círculo verde de fondo */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 5,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: '#25D366',
        }}
      />
      {/* Auricular del teléfono - parte superior (brazo curvo) */}
      <View
        style={{
          position: 'absolute',
          top: 1.2,
          left: 1.5,
          width: 2,
          height: 1,
          backgroundColor: '#FFFFFF',
          borderRadius: 0.5,
        }}
      />
      {/* Auricular - parte inferior */}
      <View
        style={{
          position: 'absolute',
          top: 2.3,
          left: 1.5,
          width: 2,
          height: 1,
          backgroundColor: '#FFFFFF',
          borderRadius: 0.5,
        }}
      />
      {/* Cuerpo del teléfono */}
      <View
        style={{
          position: 'absolute',
          top: 1.8,
          left: 1.8,
          width: 1.4,
          height: 1.4,
          backgroundColor: '#FFFFFF',
          borderRadius: 0.3,
        }}
      />
    </View>
  )
}

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

                      {/* ====== CALENDARIO NEUTRO (bordes negros visibles, sin selección) ====== */}
                      <View style={styles.calendarSection}>
                        {/* Días 1-31 */}
                        <View style={styles.calendarRow}>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
                            <View key={dia} style={styles.dayCell}>
                              <Text style={styles.dayNum}>{dia}</Text>
                            </View>
                          ))}
                        </View>
                        {/* Meses ene-dic */}
                        <View style={styles.calendarRow}>
                          {MESES.map((mes) => (
                            <View key={mes} style={styles.monthCell}>
                              <Text style={styles.monthName}>{mes}</Text>
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
                            {/* Logo WhatsApp: usar imagen si existe, sino dibujar con formas */}
                            {etiqueta.whatsappIconDataUrl ? (
                              <Image src={etiqueta.whatsappIconDataUrl} style={styles.whatsappIconImg} alt="WhatsApp" />
                            ) : (
                              <WhatsAppIcon />
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
