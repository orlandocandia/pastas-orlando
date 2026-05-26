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
}

interface EtiquetaProductoPDFProps {
  etiquetas: EtiquetaData[]
}

const ETIQUETAS_POR_HOJA = 24 // 3 columnas x 8 filas

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const styles = StyleSheet.create({
  a4Page: {
    padding: 6,
    fontFamily: 'Helvetica',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
  },
  cell: {
    width: '33.333%',
    height: '12.5%',
    padding: 3,
    borderWidth: 0.3,
    borderColor: '#CCCCCC',
    borderStyle: 'solid',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  // Header row: logo left, slogan right
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  logo: {
    width: 14,
    height: 14,
  },
  slogan: {
    fontSize: 4,
    fontStyle: 'italic',
    color: '#5C3A21',
  },
  // Sub-header: artesanal + whatsapp
  subHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1.5,
  },
  artesanal: {
    fontSize: 3.5,
    fontStyle: 'italic',
    color: '#5C3A21',
  },
  whatsapp: {
    fontSize: 3.5,
    color: '#25D366',
    fontWeight: 'bold',
  },
  // Calendar
  calendarLabel: {
    fontSize: 3.5,
    color: '#333333',
    fontWeight: 'bold',
    marginBottom: 0.5,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0.5,
  },
  dayText: {
    fontSize: 2.8,
    color: '#AAAAAA',
    width: 5.2,
    textAlign: 'center',
  },
  dayHighlight: {
    fontSize: 2.8,
    color: '#FFFFFF',
    width: 5.2,
    textAlign: 'center',
    backgroundColor: '#5C3A21',
    borderRadius: 1.5,
    fontWeight: 'bold',
  },
  monthsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  monthText: {
    fontSize: 2.8,
    color: '#AAAAAA',
    width: 13,
    textAlign: 'center',
  },
  monthHighlight: {
    fontSize: 2.8,
    color: '#FFFFFF',
    width: 13,
    textAlign: 'center',
    backgroundColor: '#C41E3A',
    borderRadius: 1.5,
    fontWeight: 'bold',
  },
  // Product info
  productName: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#5C3A21',
    textAlign: 'left',
    lineHeight: 1.1,
    marginBottom: 1,
  },
  // Barcode
  barcodeContainer: {
    alignItems: 'flex-start',
    marginBottom: 1,
  },
  barcode: {
    width: 90,
    height: 18,
  },
  barcodeText: {
    fontSize: 3.5,
    color: '#333333',
    marginTop: 0.3,
  },
  // Footer: price + details
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
    lineHeight: 1.3,
  },
  noBarcode: {
    fontSize: 3.5,
    color: '#CCCCCC',
    marginBottom: 1,
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
                  {/* Fila 1: Logo (izq) + Slogan (der) */}
                  <View style={styles.headerRow}>
                    {etiqueta.incluir_logo && etiqueta.logoDataUrl ? (
                      <Image src={etiqueta.logoDataUrl} style={styles.logo} alt="Logo" />
                    ) : (
                      <View style={{ width: 14, height: 14 }} />
                    )}
                    <Text style={styles.slogan}>El amigo de las pastas</Text>
                  </View>

                  {/* Fila 2: artesanal + WhatsApp */}
                  <View style={styles.subHeaderRow}>
                    <Text style={styles.artesanal}>
                      {esArtesanal ? 'Producto artesanal' : ''}
                    </Text>
                    <Text style={styles.whatsapp}>WhatsApp: 3754-419324</Text>
                  </View>

                  {/* Calendario de vencimiento */}
                  <Text style={styles.calendarLabel}>Vencimiento:</Text>

                  {/* Días 1-31 en dos filas */}
                  <View style={styles.daysRow}>
                    {Array.from({ length: 16 }, (_, i) => i + 1).map((dia) => (
                      <Text
                        key={dia}
                        style={dia === vencDia ? styles.dayHighlight : styles.dayText}
                      >
                        {dia}
                      </Text>
                    ))}
                  </View>
                  <View style={{ ...styles.daysRow, marginBottom: 0.5 }}>
                    {Array.from({ length: 15 }, (_, i) => i + 17).map((dia) => (
                      <Text
                        key={dia}
                        style={dia === vencDia ? styles.dayHighlight : styles.dayText}
                      >
                        {dia <= 31 ? dia : ''}
                      </Text>
                    ))}
                  </View>

                  {/* Meses */}
                  <View style={styles.monthsRow}>
                    {MESES.map((mes, idx) => {
                      const mesNum = idx + 1
                      return (
                        <Text
                          key={mes}
                          style={mesNum === vencMes ? styles.monthHighlight : styles.monthText}
                        >
                          {mes}
                        </Text>
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
                    <Text style={styles.price}>
                      ${etiqueta.precio_venta.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                    </Text>
                    <View style={styles.detailsRight}>
                      <Text style={styles.detailText}>Peso: {etiqueta.peso}</Text>
                      <Text style={styles.detailText}>Elab: {etiqueta.fecha_elaboracion}</Text>
                      <Text style={styles.detailText}>Lote: {etiqueta.lote}</Text>
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
