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

const styles = StyleSheet.create({
  page: {
    padding: 8,
    fontFamily: 'Helvetica',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  logo: {
    width: 36,
    height: 36,
    marginBottom: 2,
  },
  brandName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#5C3A21',
  },
  brandSlogan: {
    fontSize: 6,
    color: '#888888',
  },
  productInfo: {
    alignItems: 'center',
    marginBottom: 4,
  },
  productName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#5C3A21',
    textAlign: 'center',
  },
  productDescription: {
    fontSize: 7,
    color: '#666666',
    textAlign: 'center',
    marginTop: 1,
  },
  category: {
    fontSize: 7,
    color: '#999999',
    marginTop: 1,
  },
  weight: {
    fontSize: 9,
    color: '#333333',
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 2,
  },
  dateText: {
    fontSize: 7,
    color: '#555555',
  },
  lotText: {
    fontSize: 7,
    color: '#555555',
    marginTop: 1,
  },
  barcodeContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  barcode: {
    width: 130,
    height: 40,
  },
  barcodeText: {
    fontSize: 7,
    color: '#333333',
    marginTop: 1,
  },
  extraInfo: {
    alignItems: 'center',
    marginBottom: 2,
  },
  extraItem: {
    fontSize: 6,
    color: '#5C3A21',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#C41E3A',
    marginTop: 2,
  },
  contactContainer: {
    borderTopWidth: 0.5,
    borderTopColor: '#CCCCCC',
    paddingTop: 3,
    marginTop: 3,
    alignItems: 'center',
    width: '100%',
  },
  whatsappRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  qrCode: {
    width: 35,
    height: 35,
  },
  contactText: {
    fontSize: 5.5,
    color: '#888888',
  },
  whatsappText: {
    fontSize: 6.5,
    color: '#25D366',
    fontWeight: 'bold',
  },
  codeText: {
    fontSize: 6,
    color: '#999999',
    marginTop: 1,
  },
})

const WHATSAPP_NUMBER = '3754-419324'
const WHATSAPP_LABEL = '\uD83D\uDCDE WhatsApp: 3754-419324'

export function EtiquetaProductoPDF({ etiquetas }: EtiquetaProductoPDFProps) {
  return (
    <Document>
      {etiquetas.map((etiqueta, index) => (
        <Page key={index} size={[200, 300]} style={styles.page}>
          {/* Logo */}
          {etiqueta.incluir_logo && etiqueta.logoDataUrl && (
            <View style={styles.logoContainer}>
              <Image src={etiqueta.logoDataUrl} style={styles.logo} alt="Logo Pastas Orlando" />
              <Text style={styles.brandName}>Pastas Orlando</Text>
              <Text style={styles.brandSlogan}>El amigo de las pastas</Text>
            </View>
          )}

          {!etiqueta.incluir_logo && (
            <View style={{ alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#5C3A21' }}>
                Pastas Orlando
              </Text>
              <Text style={{ fontSize: 6, color: '#888888' }}>El amigo de las pastas</Text>
            </View>
          )}

          {/* Información del producto */}
          <View style={styles.productInfo}>
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
          <View style={{ alignItems: 'center', marginBottom: 2 }}>
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
              <Text style={{ fontSize: 7, color: '#AAAAAA' }}>Sin código de barras</Text>
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
              {/* QR Code */}
              {etiqueta.qrCodeDataUrl && (
                <Image src={etiqueta.qrCodeDataUrl} style={styles.qrCode} alt="QR WhatsApp" />
              )}
              <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                <Text style={styles.whatsappText}>{WHATSAPP_LABEL}</Text>
                <Text style={styles.contactText}>laspastasdeorlando@gmail.com</Text>
              </View>
            </View>
          </View>
        </Page>
      ))}
    </Document>
  )
}
