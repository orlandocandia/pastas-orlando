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
}

interface EtiquetaProductoPDFProps {
  etiquetas: EtiquetaData[]
}

const ETIQUETAS_POR_HOJA = 8 // 2 columnas x 4 filas

const styles = StyleSheet.create({
  a4Page: {
    padding: 15,
    fontFamily: 'Helvetica',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
  },
  etiquetaCell: {
    width: '50%',
    height: '25%',
    padding: 6,
    borderWidth: 0.5,
    borderColor: '#DDDDDD',
    borderStyle: 'dashed',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Logo
  logo: {
    width: 24,
    height: 24,
    marginBottom: 1,
  },
  // Product info
  productName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#5C3A21',
    textAlign: 'center',
    lineHeight: 1.1,
  },
  productDescription: {
    fontSize: 5,
    color: '#666666',
    textAlign: 'center',
    marginTop: 1,
  },
  category: {
    fontSize: 5,
    color: '#999999',
    marginTop: 0.5,
  },
  weight: {
    fontSize: 7,
    color: '#333333',
    marginTop: 1,
  },
  // Dates
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  dateText: {
    fontSize: 5.5,
    color: '#555555',
  },
  lotText: {
    fontSize: 5.5,
    color: '#555555',
    marginTop: 0.5,
  },
  // Barcode
  barcodeContainer: {
    alignItems: 'center',
    marginVertical: 1,
  },
  barcode: {
    width: 100,
    height: 28,
  },
  barcodeText: {
    fontSize: 5.5,
    color: '#333333',
    marginTop: 0.5,
  },
  // Extra info
  extraInfo: {
    alignItems: 'center',
  },
  extraItem: {
    fontSize: 5,
    color: '#5C3A21',
  },
  // Price
  price: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#C41E3A',
    marginTop: 1,
  },
  // Contact
  contactContainer: {
    borderTopWidth: 0.5,
    borderTopColor: '#CCCCCC',
    paddingTop: 2,
    marginTop: 1,
    alignItems: 'center',
    width: '100%',
  },
  whatsappRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  qrCode: {
    width: 22,
    height: 22,
  },
  whatsappText: {
    fontSize: 5.5,
    color: '#25D366',
    fontWeight: 'bold',
  },
  contactText: {
    fontSize: 4.5,
    color: '#888888',
  },
  codeText: {
    fontSize: 5,
    color: '#999999',
    marginTop: 0.5,
  },
})

const WHATSAPP_LABEL = '\uD83D\uDCDE WhatsApp: 3754-419324'

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
                // Empty cell placeholder
                return <View key={cellIdx} style={styles.etiquetaCell} />
              }

              return (
                <View key={cellIdx} style={styles.etiquetaCell}>
                  {/* Logo (sin texto redundante) */}
                  {etiqueta.incluir_logo && etiqueta.logoDataUrl && (
                    <Image src={etiqueta.logoDataUrl} style={styles.logo} alt="Logo" />
                  )}

                  {/* Información del producto */}
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.productName}>{etiqueta.nombre}</Text>
                    {etiqueta.descripcion && (
                      <Text style={styles.productDescription}>{etiqueta.descripcion}</Text>
                    )}
                    {etiqueta.categoria && (
                      <Text style={styles.category}>{etiqueta.categoria}</Text>
                    )}
                    <Text style={styles.weight}>Peso: {etiqueta.peso}</Text>
                  </View>

                  {/* Fechas y Lote */}
                  <View style={{ alignItems: 'center' }}>
                    <View style={styles.dateRow}>
                      <Text style={styles.dateText}>Elab: {etiqueta.fecha_elaboracion}</Text>
                      <Text style={styles.dateText}>Vence: {etiqueta.fecha_vencimiento}</Text>
                    </View>
                    <Text style={styles.lotText}>Lote: {etiqueta.lote}</Text>
                  </View>

                  {/* Código de barras */}
                  {etiqueta.barcodeDataUrl ? (
                    <View style={styles.barcodeContainer}>
                      <Image src={etiqueta.barcodeDataUrl} style={styles.barcode} alt="Código de barras" />
                      <Text style={styles.barcodeText}>{etiqueta.codigo_barras}</Text>
                    </View>
                  ) : (
                    <View style={styles.barcodeContainer}>
                      <Text style={{ fontSize: 5.5, color: '#AAAAAA' }}>Sin código de barras</Text>
                    </View>
                  )}

                  {/* Código interno */}
                  {etiqueta.codigo && (
                    <Text style={styles.codeText}>Cód: {etiqueta.codigo}</Text>
                  )}

                  {/* Información extra */}
                  {etiqueta.info_extra.length > 0 && (
                    <View style={styles.extraInfo}>
                      {etiqueta.info_extra.map((info, idx) => (
                        <Text key={idx} style={styles.extraItem}>
                          {'\u2022'} {info}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Precio */}
                  <Text style={styles.price}>
                    ${etiqueta.precio_venta.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                  </Text>

                  {/* Contacto con QR y WhatsApp */}
                  <View style={styles.contactContainer}>
                    <View style={styles.whatsappRow}>
                      {etiqueta.qrCodeDataUrl && (
                        <Image src={etiqueta.qrCodeDataUrl} style={styles.qrCode} alt="QR WhatsApp" />
                      )}
                      <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Text style={styles.whatsappText}>{WHATSAPP_LABEL}</Text>
                        <Text style={styles.contactText}>laspastasdeorlando@gmail.com</Text>
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
