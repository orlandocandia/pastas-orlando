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
    padding: 2,
    position: 'relative',
  },
  etiqueta: {
    flex: 1,
    backgroundColor: '#FFF8E7',
    borderWidth: 0.8,
    borderColor: '#E1AD01',
    borderRadius: 2,
    padding: 3,
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  fondoImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.12,
  },
  // Header: logo + slogan
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  logo: {
    width: 12,
    height: 12,
  },
  slogan: {
    fontSize: 3.8,
    fontStyle: 'italic',
    color: '#5C3A21',
    fontWeight: 'bold',
  },
  // Sub-header
  subHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1.5,
    paddingBottom: 1,
    borderBottomWidth: 0.3,
    borderBottomColor: '#E1AD01',
  },
  artesanal: {
    fontSize: 3.2,
    fontStyle: 'italic',
    color: '#5C3A21',
  },
  whatsapp: {
    fontSize: 3.2,
    color: '#25D366',
    fontWeight: 'bold',
  },
  // Calendar
  calendarTitle: {
    fontSize: 3.5,
    color: '#5C3A21',
    fontWeight: 'bold',
    marginBottom: 1,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 1,
  },
  daySquare: {
    width: 6,
    height: 5,
    borderWidth: 0.3,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 0.5,
    marginBottom: 0.3,
    backgroundColor: '#FFFFFF',
  },
  daySquareActive: {
    width: 6,
    height: 5,
    borderWidth: 0.3,
    borderColor: '#5C3A21',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 0.5,
    marginBottom: 0.3,
    backgroundColor: '#5C3A21',
  },
  dayText: {
    fontSize: 2.8,
    color: '#888888',
  },
  dayTextActive: {
    fontSize: 2.8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  monthSquare: {
    width: 12.8,
    height: 5,
    borderWidth: 0.3,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 0.5,
    marginBottom: 0.3,
    backgroundColor: '#FFFFFF',
  },
  monthSquareActive: {
    width: 12.8,
    height: 5,
    borderWidth: 0.3,
    borderColor: '#C41E3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 0.5,
    marginBottom: 0.3,
    backgroundColor: '#C41E3A',
  },
  monthText: {
    fontSize: 2.8,
    color: '#888888',
  },
  monthTextActive: {
    fontSize: 2.8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Product name
  productName: {
    fontSize: 6.5,
    fontWeight: 'bold',
    color: '#5C3A21',
    textAlign: 'center',
    lineHeight: 1.1,
    marginBottom: 1,
    marginTop: 0.5,
  },
  // Barcode
  barcodeContainer: {
    alignItems: 'center',
    marginBottom: 1,
  },
  barcode: {
    width: 85,
    height: 16,
  },
  barcodeText: {
    fontSize: 3.5,
    color: '#333333',
    marginTop: 0.3,
  },
  noBarcode: {
    fontSize: 3.5,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 1,
  },
  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 0.3,
    borderTopColor: '#E1AD01',
    paddingTop: 1,
  },
  price: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#C41E3A',
  },
  detailsRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  detailText: {
    fontSize: 3,
    color: '#666666',
    lineHeight: 1.4,
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginTop: 0.5,
  },
  qrCode: {
    width: 10,
    height: 10,
  },
  qrLabel: {
    fontSize: 2.5,
    color: '#888888',
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
                    {/* Background image (decorative) */}
                    {etiqueta.fondoDataUrl && (
                      <Image src={etiqueta.fondoDataUrl} style={styles.fondoImage} alt="" />
                    )}

                    {/* Header: Logo (izq) + Slogan (der) */}
                    <View style={styles.headerRow}>
                      {etiqueta.incluir_logo && etiqueta.logoDataUrl ? (
                        <Image src={etiqueta.logoDataUrl} style={styles.logo} alt="Logo" />
                      ) : (
                        <View style={{ width: 12, height: 12 }} />
                      )}
                      <Text style={styles.slogan}>El amigo de las pastas</Text>
                    </View>

                    {/* Sub-header: artesanal + WhatsApp */}
                    <View style={styles.subHeaderRow}>
                      <Text style={styles.artesanal}>
                        {esArtesanal ? 'Producto artesanal' : ''}
                      </Text>
                      <Text style={styles.whatsapp}>WhatsApp: 3754-419324</Text>
                    </View>

                    {/* Calendario de vencimiento con cuadritos */}
                    <Text style={styles.calendarTitle}>Vencimiento:</Text>

                    {/* Días 1-31 en cuadritos */}
                    <View style={styles.daysGrid}>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => {
                        const isActive = dia === vencDia
                        return (
                          <View
                            key={dia}
                            style={isActive ? styles.daySquareActive : styles.daySquare}
                          >
                            <Text style={isActive ? styles.dayTextActive : styles.dayText}>
                              {dia}
                            </Text>
                          </View>
                        )
                      })}
                    </View>

                    {/* Meses en cuadritos */}
                    <View style={styles.monthsGrid}>
                      {MESES.map((mes, idx) => {
                        const isActive = idx + 1 === vencMes
                        return (
                          <View
                            key={mes}
                            style={isActive ? styles.monthSquareActive : styles.monthSquare}
                          >
                            <Text style={isActive ? styles.monthTextActive : styles.monthText}>
                              {mes}
                            </Text>
                          </View>
                        )
                      })}
                    </View>

                    {/* Nombre del producto */}
                    <Text style={styles.productName}>{etiqueta.nombre}</Text>

                    {/* Código de barras */}
                    {etiqueta.barcodeDataUrl ? (
                      <View style={styles.barcodeContainer}>
                        <Image src={etiqueta.barcodeDataUrl} style={styles.barcode} alt="Código de barras" />
                        <Text style={styles.barcodeText}>{etiqueta.codigo_barras}</Text>
                      </View>
                    ) : (
                      <Text style={styles.noBarcode}>Sin código de barras</Text>
                    )}

                    {/* Footer: Precio (izq) + Detalles (der) */}
                    <View style={styles.footerRow}>
                      <View style={{ flexDirection: 'column' }}>
                        <Text style={styles.price}>
                          ${etiqueta.precio_venta.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                        </Text>
                        {etiqueta.qrCodeDataUrl && (
                          <View style={styles.qrRow}>
                            <Image src={etiqueta.qrCodeDataUrl} style={styles.qrCode} alt="QR" />
                            <Text style={styles.qrLabel}>Pedidos</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.detailsRight}>
                        <Text style={styles.detailText}>Peso: {etiqueta.peso}</Text>
                        <Text style={styles.detailText}>Elab: {etiqueta.fecha_elaboracion}</Text>
                        <Text style={styles.detailText}>Lote: {etiqueta.lote}</Text>
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
