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
}

interface EtiquetaProductoPDFProps {
  etiquetas: EtiquetaData[]
}

const ETIQUETAS_POR_HOJA = 24 // 3 columnas x 8 filas

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const styles = StyleSheet.create({
  a4Page: {
    padding: 4,
    fontFamily: 'Helvetica',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
  },
  cell: {
    width: '33.333%',
    height: '12.5%',
    padding: 1.5,
  },
  etiqueta: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E1AD01',
    borderRadius: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  // ===== TOP SECTION: Logo (left) + Checkered/Info (right) =====
  topSection: {
    flexDirection: 'row',
    flex: 1,
  },
  // Left side: Logo area
  logoArea: {
    width: '35%',
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8E7',
  },
  logoCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8E7',
  },
  logoImage: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  brandName: {
    fontSize: 4.5,
    color: '#C41E3A',
    fontWeight: 'bold',
    marginTop: 1,
    textAlign: 'center',
  },
  slogan: {
    fontSize: 2.8,
    color: '#5C3A21',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 0.5,
  },
  // Right side: Product info + checkered background
  rightArea: {
    width: '65%',
    padding: 3,
    justifyContent: 'space-between',
    position: 'relative',
  },
  checkeredBg: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%',
    height: '100%',
    opacity: 0.08,
  },
  productNameMain: {
    fontSize: 5.5,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 1.1,
  },
  artesanalText: {
    fontSize: 3.5,
    fontStyle: 'italic',
    color: '#C41E3A',
    marginTop: 1,
  },
  productSubtext: {
    fontSize: 3,
    color: '#666666',
    marginTop: 0.5,
  },
  whatsappRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 1,
  },
  whatsappIcon: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#25D366',
  },
  whatsappNumber: {
    fontSize: 4,
    fontWeight: 'bold',
    color: '#333333',
  },
  // ===== BOTTOM SECTION: Calendar =====
  calendarSection: {
    paddingHorizontal: 3,
    paddingVertical: 2,
    backgroundColor: '#FFF8E7',
    borderTopWidth: 0.5,
    borderTopColor: '#E1AD01',
  },
  calendarLabel: {
    fontSize: 3,
    color: '#5C3A21',
    fontWeight: 'bold',
    marginBottom: 1,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  dayBox: {
    width: 4.3,
    height: 4.3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 0.2,
    borderColor: '#CCCCCC',
  },
  dayBoxActive: {
    width: 4.3,
    height: 4.3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5C3A21',
    borderWidth: 0.2,
    borderColor: '#5C3A21',
  },
  dayText: {
    fontSize: 2.5,
    color: '#888888',
  },
  dayTextActive: {
    fontSize: 2.5,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  monthsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthBox: {
    width: 10,
    height: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 0.2,
    borderColor: '#CCCCCC',
  },
  monthBoxActive: {
    width: 10,
    height: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C41E3A',
    borderWidth: 0.2,
    borderColor: '#C41E3A',
  },
  monthText: {
    fontSize: 2.5,
    color: '#888888',
  },
  monthTextActive: {
    fontSize: 2.5,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // ===== EXTRA SECTION: Barcode, price, details =====
  extraSection: {
    paddingHorizontal: 3,
    paddingVertical: 1.5,
    borderTopWidth: 0.3,
    borderTopColor: '#E1AD01',
    backgroundColor: '#FFFFFF',
  },
  barcodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  barcode: {
    width: 70,
    height: 12,
  },
  barcodeText: {
    fontSize: 3,
    color: '#333333',
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#C41E3A',
  },
  detailsCol: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  detailText: {
    fontSize: 2.5,
    color: '#666666',
    lineHeight: 1.3,
  },
  qrSmall: {
    width: 7,
    height: 7,
    marginTop: 0.5,
  },
  noBarcode: {
    fontSize: 3,
    color: '#CCCCCC',
    textAlign: 'center',
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
          <Page key={hojaIdx} size="A4" style={styles.a4Page}>
            {Array.from({ length: ETIQUETAS_POR_HOJA }).map((_, cellIdx) => {
              const etiqueta = etiquetasHoja[cellIdx]
              if (!etiqueta) {
                return <View key={cellIdx} style={styles.cell} />
              }

              const esArtesanal = etiqueta.info_extra.some(
                (i) => i.toLowerCase().includes('artesanal')
              )
              const vencDia = etiqueta.vencimientoDia || 1
              const vencMes = etiqueta.vencimientoMes || 1

              return (
                <View key={cellIdx} style={styles.cell}>
                  <View style={styles.etiqueta}>
                    {/* ===== TOP: Logo (izq) + Info (der) ===== */}
                    <View style={styles.topSection}>
                      {/* Logo area (left) */}
                      <View style={styles.logoArea}>
                        {etiqueta.incluir_logo && etiqueta.logoDataUrl ? (
                          <View style={styles.logoCircle}>
                            <Image src={etiqueta.logoDataUrl} style={styles.logoImage} alt="Logo" />
                          </View>
                        ) : (
                          <View style={styles.logoCircle}>
                            <Text style={{ fontSize: 5, color: '#C41E3A', fontWeight: 'bold' }}>O</Text>
                          </View>
                        )}
                        <Text style={styles.brandName}>Orlando</Text>
                        <Text style={styles.slogan}>El amigo de{'\n'}las pastas</Text>
                      </View>

                      {/* Product info (right) */}
                      <View style={styles.rightArea}>
                        {/* Decorative checkered bg */}
                        {etiqueta.fondoDataUrl && (
                          <Image src={etiqueta.fondoDataUrl} style={styles.checkeredBg} alt="" />
                        )}

                        {/* Product name (replaces "Espagueti al Morrón") */}
                        <Text style={styles.productNameMain}>{etiqueta.nombre}</Text>

                        {/* "producto artesanal" in red italic */}
                        {esArtesanal && (
                          <Text style={styles.artesanalText}>producto artesanal</Text>
                        )}

                        {/* Category/description */}
                        {etiqueta.categoria && (
                          <Text style={styles.productSubtext}>{etiqueta.categoria}</Text>
                        )}

                        {/* WhatsApp + phone */}
                        <View style={styles.whatsappRow}>
                          <View style={styles.whatsappIcon} />
                          <Text style={styles.whatsappNumber}>3754-419324</Text>
                        </View>
                      </View>
                    </View>

                    {/* ===== CALENDAR SECTION ===== */}
                    <View style={styles.calendarSection}>
                      <Text style={styles.calendarLabel}>Fecha vencimiento</Text>

                      {/* Days 1-31 in a single row with cuadritos */}
                      <View style={styles.daysRow}>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => {
                          const isActive = dia === vencDia
                          return (
                            <View
                              key={dia}
                              style={isActive ? styles.dayBoxActive : styles.dayBox}
                            >
                              <Text style={isActive ? styles.dayTextActive : styles.dayText}>
                                {dia}
                              </Text>
                            </View>
                          )
                        })}
                      </View>

                      {/* Months ene-dic in a single row */}
                      <View style={styles.monthsRow}>
                        {MESES.map((mes, idx) => {
                          const isActive = idx + 1 === vencMes
                          return (
                            <View
                              key={mes}
                              style={isActive ? styles.monthBoxActive : styles.monthBox}
                            >
                              <Text style={isActive ? styles.monthTextActive : styles.monthText}>
                                {mes}
                              </Text>
                            </View>
                          )
                        })}
                      </View>
                    </View>

                    {/* ===== EXTRA: Barcode + Price + Details ===== */}
                    <View style={styles.extraSection}>
                      {/* Barcode */}
                      {etiqueta.barcodeDataUrl ? (
                        <View style={styles.barcodeRow}>
                          <Image src={etiqueta.barcodeDataUrl} style={styles.barcode} alt="Código de barras" />
                        </View>
                      ) : (
                        <Text style={styles.noBarcode}>Sin código de barras</Text>
                      )}

                      {/* Footer: Price + Details + QR */}
                      <View style={styles.footerRow}>
                        <View style={{ flexDirection: 'column' }}>
                          <Text style={styles.priceText}>
                            ${etiqueta.precio_venta.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                          </Text>
                          {etiqueta.qrCodeDataUrl && (
                            <Image src={etiqueta.qrCodeDataUrl} style={styles.qrSmall} alt="QR" />
                          )}
                        </View>
                        <View style={styles.detailsCol}>
                          <Text style={styles.detailText}>Peso: {etiqueta.peso}</Text>
                          <Text style={styles.detailText}>Elab: {etiqueta.fecha_elaboracion}</Text>
                          <Text style={styles.detailText}>Lote: {etiqueta.lote}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )
            })}
          </Page>
        )
      })}
    </Document>
  )
}
