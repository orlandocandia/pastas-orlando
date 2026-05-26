'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Loader2, Tag, FileDown, Package } from 'lucide-react'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'

interface ProductoTerminado {
  id: number
  nombre: string
  descripcion: string | null
  codigo: string | null
  codigo_barras: string | null
  precio_venta: number
  peso_unitario_aprox: number
  categoria?: { nombre: string } | null
  estado: boolean
}

type EtiquetaProductoPDFType = React.ComponentType<{
  etiquetas: import('@/components/print/EtiquetaProductoPDF').EtiquetaData[]
}>

const PESOS_PREDEFINIDOS = [
  { label: '500 g', value: '500g' },
  { label: '1 kg', value: '1kg' },
  { label: '2 kg', value: '2kg' },
  { label: 'Personalizado', value: 'custom' },
]

const INFO_EXTRA_OPCIONES = [
  { id: 'sin_tacc', label: 'Sin TACC' },
  { id: 'artesanal', label: 'Producto artesanal' },
  { id: 'contiene_gluten', label: 'Contiene gluten' },
  { id: 'congelado', label: 'Producto congelado' },
  { id: 'refrigerado', label: 'Mantener refrigerado' },
]

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatDateDisplay(dateStr: string): string {
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function generateLoteNumber(): string {
  const now = new Date()
  const y = now.getFullYear().toString().slice(-2)
  const m = (now.getMonth() + 1).toString().padStart(2, '0')
  const d = now.getDate().toString().padStart(2, '0')
  const h = now.getHours().toString().padStart(2, '0')
  const min = now.getMinutes().toString().padStart(2, '0')
  return `L${y}${m}${d}-${h}${min}`
}

function generateBarcodeDataUrl(code: string): string | null {
  try {
    const canvas = document.createElement('canvas')
    const format = code.length === 13 ? 'EAN13' : 'CODE128'
    JsBarcode(canvas, code, {
      format,
      width: 2,
      height: 50,
      displayValue: true,
      fontSize: 12,
      margin: 5,
      background: '#FFFFFF',
    })
    return canvas.toDataURL('image/png')
  } catch {
    try {
      const canvas = document.createElement('canvas')
      JsBarcode(canvas, code, {
        format: 'CODE128',
        width: 2,
        height: 50,
        displayValue: true,
        fontSize: 12,
        margin: 5,
        background: '#FFFFFF',
      })
      return canvas.toDataURL('image/png')
    } catch (err) {
      console.error('Error generando código de barras:', err)
      return null
    }
  }
}

export default function EtiquetasPage() {
  const [productos, setProductos] = useState<ProductoTerminado[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Form state
  const [selectedProductoId, setSelectedProductoId] = useState<string>('')
  const [pesoOption, setPesoOption] = useState<string>('1kg')
  const [pesoCustom, setPesoCustom] = useState<string>('')
  const [cantidad, setCantidad] = useState<number>(24)
  const [fechaElaboracion, setFechaElaboracion] = useState<string>(formatDateForInput(new Date()))
  const [fechaVencimiento, setFechaVencimiento] = useState<string>('')
  const [lote, setLote] = useState<string>(generateLoteNumber())
  const [infoExtra, setInfoExtra] = useState<string[]>(['artesanal'])
  const [incluirLogo, setIncluirLogo] = useState<boolean>(true)

  // Logo data URL (loaded once)
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)

  // QR Code data URL (generated once)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)

  // PDF component (lazy loaded)
  const [PDFComponent, setPDFComponent] = useState<EtiquetaProductoPDFType | null>(null)

  // Load products
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/productos-terminados?limite=200&estado=true')
        if (res.ok) {
          const result = await res.json()
          setProductos(result.data || result.productos || result || [])
        }
      } catch (err) {
        console.error('Error cargando productos:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  // Load logo as base64
  useEffect(() => {
    async function loadLogo() {
      try {
        const res = await fetch('/images/logo.png')
        const blob = await res.blob()
        const reader = new FileReader()
        reader.onloadend = () => {
          setLogoDataUrl(reader.result as string)
        }
        reader.readAsDataURL(blob)
      } catch {
        setLogoDataUrl(null)
      }
    }
    loadLogo()
  }, [])

  // Generate QR code for WhatsApp
  useEffect(() => {
    async function generateQR() {
      try {
        const url = await QRCode.toDataURL(
          'https://wa.me/5493754419324?text=Hola%20Orlando%20quiero%20hacer%20un%20pedido',
          { width: 140, margin: 1, color: { dark: '#5C3A21', light: '#FFFFFF' } }
        )
        setQrCodeDataUrl(url)
      } catch (err) {
        console.error('Error generando QR:', err)
        setQrCodeDataUrl(null)
      }
    }
    generateQR()
  }, [])

  // Lazy load @react-pdf/renderer components
  useEffect(() => {
    async function loadPDFComponent() {
      try {
        const mod = await import('@/components/print/EtiquetaProductoPDF')
        setPDFComponent(() => mod.EtiquetaProductoPDF)
      } catch (err) {
        console.error('Error cargando componente PDF:', err)
      }
    }
    loadPDFComponent()
  }, [])

  // Set default vencimiento (30 days from elaboración)
  useEffect(() => {
    if (fechaElaboracion && !fechaVencimiento) {
      const elab = new Date(fechaElaboracion + 'T12:00:00')
      elab.setDate(elab.getDate() + 30)
      setFechaVencimiento(formatDateForInput(elab))
    }
  }, [fechaElaboracion, fechaVencimiento])

  const selectedProducto = productos.find((p) => p.id === Number(selectedProductoId))

  const filteredProductos = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.codigo_barras && p.codigo_barras.includes(searchTerm)) ||
      (p.codigo && p.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleInfoExtraToggle = (id: string) => {
    setInfoExtra((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const getPesoDisplay = (): string => {
    if (pesoOption === 'custom') {
      return pesoCustom || '—'
    }
    const found = PESOS_PREDEFINIDOS.find((p) => p.value === pesoOption)
    return found ? found.label : pesoOption
  }

  const getVencimientoDia = (): number => {
    if (!fechaVencimiento) return 1
    const d = new Date(fechaVencimiento + 'T12:00:00')
    return d.getDate()
  }

  const getVencimientoMes = (): number => {
    if (!fechaVencimiento) return 1
    const d = new Date(fechaVencimiento + 'T12:00:00')
    return d.getMonth() + 1
  }

  const hojasNecesarias = Math.ceil(cantidad / 24)

  const handleGeneratePDF = useCallback(async () => {
    if (!selectedProducto || !PDFComponent) return

    setGenerating(true)

    try {
      // Generate barcode image
      const barcodeDataUrl = selectedProducto.codigo_barras
        ? generateBarcodeDataUrl(selectedProducto.codigo_barras)
        : null

      // Get info extra labels
      const infoExtraLabels = infoExtra.map((id) => {
        const option = INFO_EXTRA_OPCIONES.find((o) => o.id === id)
        return option ? option.label : id
      })

      // Build etiqueta data
      const etiquetaData = {
        nombre: selectedProducto.nombre,
        descripcion: selectedProducto.descripcion,
        codigo_barras: selectedProducto.codigo_barras,
        codigo: selectedProducto.codigo,
        precio_venta: selectedProducto.precio_venta,
        peso: getPesoDisplay(),
        categoria: selectedProducto.categoria?.nombre || null,
        fecha_elaboracion: formatDateDisplay(fechaElaboracion),
        fecha_vencimiento: formatDateDisplay(fechaVencimiento),
        lote,
        info_extra: infoExtraLabels,
        incluir_logo: incluirLogo,
        barcodeDataUrl,
        logoDataUrl,
        qrCodeDataUrl,
        vencimientoDia: getVencimientoDia(),
        vencimientoMes: getVencimientoMes(),
      }

      // Create array with requested copies
      const etiquetas = Array.from({ length: cantidad }, () => etiquetaData)

      // Dynamic import of pdf function
      const { pdf } = await import('@react-pdf/renderer')

      // Generate PDF blob
      const blob = await pdf(<PDFComponent etiquetas={etiquetas} />).toBlob()

      // Download
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `etiquetas-${selectedProducto.nombre.replace(/\s+/g, '-').toLowerCase()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error generando PDF:', err)
      alert('Error al generar el PDF. Intentá de nuevo.')
    } finally {
      setGenerating(false)
    }
  }, [
    selectedProducto,
    PDFComponent,
    cantidad,
    fechaElaboracion,
    fechaVencimiento,
    lote,
    infoExtra,
    incluirLogo,
    logoDataUrl,
    qrCodeDataUrl,
    pesoOption,
    pesoCustom,
  ])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-mostaza" />
        <span className="ml-3 text-muted-foreground">Cargando productos...</span>
      </div>
    )
  }

  const vencMes = getVencimientoMes()
  const vencDia = getVencimientoDia()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-mostaza/10 rounded-lg">
          <Tag className="h-6 w-6 text-mostaza" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Generador de Etiquetas</h1>
          <p className="text-sm text-muted-foreground">
            Generá etiquetas PDF · 24 etiquetas por hoja A4 (3×8)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-mostaza" />
                Seleccionar Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, código o código de barras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Product list */}
              <div className="max-h-64 overflow-y-auto border rounded-lg">
                {filteredProductos.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No se encontraron productos
                  </div>
                ) : (
                  filteredProductos.map((producto) => (
                    <button
                      key={producto.id}
                      onClick={() => setSelectedProductoId(String(producto.id))}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-mostaza/5 transition-colors border-b last:border-b-0 ${
                        selectedProductoId === String(producto.id)
                          ? 'bg-mostaza/10 border-l-2 border-l-mostaza'
                          : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-marron truncate">
                          {producto.nombre}
                        </div>
                        <div className="text-xs text-muted-foreground flex gap-2">
                          {producto.codigo && <span>Cód: {producto.codigo}</span>}
                          {producto.codigo_barras && (
                            <span className="font-mono">{producto.codigo_barras}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-semibold text-rojo text-sm">
                          ${producto.precio_venta.toLocaleString('es-AR')}
                        </div>
                        {producto.categoria && (
                          <Badge variant="secondary" className="text-[10px] h-4 mt-0.5">
                            {producto.categoria.nombre}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Label Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4 text-mostaza" />
                Opciones de Etiqueta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Peso */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Peso</Label>
                  <Select value={pesoOption} onValueChange={setPesoOption}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PESOS_PREDEFINIDOS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {pesoOption === 'custom' && (
                    <Input
                      placeholder="Ej: 750g"
                      value={pesoCustom}
                      onChange={(e) => setPesoCustom(e.target.value)}
                      className="mt-1.5"
                    />
                  )}
                </div>

                {/* Cantidad */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Cantidad de etiquetas</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                      disabled={cantidad <= 1}
                    >
                      −
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      max={240}
                      value={cantidad}
                      onChange={(e) =>
                        setCantidad(Math.max(1, Math.min(240, parseInt(e.target.value) || 1)))
                      }
                      className="w-20 text-center"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCantidad(Math.min(240, cantidad + 1))}
                      disabled={cantidad >= 240}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Fecha elaboración */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Fecha de elaboración</Label>
                  <Input
                    type="date"
                    value={fechaElaboracion}
                    onChange={(e) => setFechaElaboracion(e.target.value)}
                  />
                </div>

                {/* Fecha vencimiento */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Fecha de vencimiento</Label>
                  <Input
                    type="date"
                    value={fechaVencimiento}
                    onChange={(e) => setFechaVencimiento(e.target.value)}
                  />
                </div>

                {/* Lote */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-sm font-medium">Número de lote</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={lote}
                      onChange={(e) => setLote(e.target.value)}
                      placeholder="Ej: L260526-1430"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLote(generateLoteNumber())}
                      title="Generar automáticamente"
                    >
                      Auto
                    </Button>
                  </div>
                </div>
              </div>

              {/* Info extra checkboxes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Información adicional</Label>
                <div className="flex flex-wrap gap-3">
                  {INFO_EXTRA_OPCIONES.map((opcion) => (
                    <label
                      key={opcion.id}
                      className="flex items-center gap-1.5 cursor-pointer"
                    >
                      <Checkbox
                        checked={infoExtra.includes(opcion.id)}
                        onCheckedChange={() => handleInfoExtraToggle(opcion.id)}
                      />
                      <span className="text-sm">{opcion.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Incluir logo */}
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={incluirLogo}
                  onCheckedChange={(v) => setIncluirLogo(v === true)}
                />
                <span className="text-sm">Incluir logo en la etiqueta</span>
              </label>
            </CardContent>
          </Card>
        </div>

        {/* Preview Column */}
        <div className="space-y-4">
          {/* Live Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Vista previa</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedProducto ? (
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-2.5 mx-auto" style={{ width: '210px', minHeight: '115px' }}>
                  {/* Header: Logo + Slogan */}
                  <div className="flex items-center justify-between mb-1">
                    {incluirLogo ? (
                      <div className="w-5 h-5 bg-mostaza/10 rounded-full flex items-center justify-center text-[5px] font-bold text-marron shrink-0">
                        PO
                      </div>
                    ) : (
                      <div className="w-5 h-5" />
                    )}
                    <span className="text-[6px] italic text-marron">El amigo de las pastas</span>
                  </div>

                  {/* Sub-header: artesanal + WhatsApp */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[5px] italic text-marron">
                      {infoExtra.includes('artesanal') ? 'Producto artesanal' : ''}
                    </span>
                    <span className="text-[5px] font-semibold text-green-600">WhatsApp: 3754-419324</span>
                  </div>

                  {/* Calendar */}
                  <div className="mb-1">
                    <div className="text-[5px] font-bold text-gray-700 mb-0.5">Vencimiento:</div>
                    {/* Days row 1: 1-16 */}
                    <div className="flex justify-between mb-px">
                      {Array.from({ length: 16 }, (_, i) => i + 1).map((dia) => (
                        <span
                          key={dia}
                          className={`text-[4px] leading-none px-px ${
                            dia === vencDia
                              ? 'bg-marron text-white font-bold rounded-[1px]'
                              : 'text-gray-400'
                          }`}
                          style={{ minWidth: '6px', textAlign: 'center', display: 'inline-block' }}
                        >
                          {dia}
                        </span>
                      ))}
                    </div>
                    {/* Days row 2: 17-31 */}
                    <div className="flex justify-between mb-px">
                      {Array.from({ length: 15 }, (_, i) => i + 17).map((dia) => (
                        <span
                          key={dia}
                          className={`text-[4px] leading-none px-px ${
                            dia === vencDia
                              ? 'bg-marron text-white font-bold rounded-[1px]'
                              : 'text-gray-400'
                          }`}
                          style={{ minWidth: '6px', textAlign: 'center', display: 'inline-block' }}
                        >
                          {dia <= 31 ? dia : ''}
                        </span>
                      ))}
                    </div>
                    {/* Months */}
                    <div className="flex justify-between">
                      {MESES_CORTOS.map((mes, idx) => (
                        <span
                          key={mes}
                          className={`text-[4px] leading-none ${
                            idx + 1 === vencMes
                              ? 'bg-rojo text-white font-bold rounded-[1px] px-0.5'
                              : 'text-gray-400'
                          }`}
                          style={{ minWidth: '10px', textAlign: 'center', display: 'inline-block' }}
                        >
                          {mes}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Product name */}
                  <div className="text-[7px] font-bold text-marron leading-tight mb-0.5">
                    {selectedProducto.nombre}
                  </div>

                  {/* Barcode placeholder */}
                  <div className="flex items-center my-0.5">
                    {selectedProducto.codigo_barras ? (
                      <div className="flex items-center gap-1">
                        <div className="flex gap-px items-end h-3">
                          {Array.from({ length: 30 }, (_, i) => (
                            <div
                              key={i}
                              className="bg-black"
                              style={{
                                width: Math.random() > 0.5 ? '1px' : '0.5px',
                                height: `${8 + Math.random() * 4}px`,
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-[4px] text-gray-500 font-mono">
                          {selectedProducto.codigo_barras}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[4px] text-gray-300">Sin código de barras</span>
                    )}
                  </div>

                  {/* Footer: Price + details */}
                  <div className="flex items-end justify-between mt-0.5">
                    <span className="text-[9px] font-bold text-rojo">
                      ${selectedProducto.precio_venta.toLocaleString('es-AR')}
                    </span>
                    <div className="text-right">
                      <div className="text-[4px] text-gray-500">Peso: {getPesoDisplay()}</div>
                      <div className="text-[4px] text-gray-500">Elab: {formatDateDisplay(fechaElaboracion)}</div>
                      <div className="text-[4px] text-gray-500">Lote: {lote}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  <Tag className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>Seleccioná un producto para ver la vista previa</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            className="w-full bg-mostaza hover:bg-mostaza/90 text-white h-12 text-base"
            onClick={handleGeneratePDF}
            disabled={!selectedProducto || generating || !PDFComponent}
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generando PDF...
              </>
            ) : (
              <>
                <FileDown className="h-5 w-5 mr-2" />
                GENERAR ({cantidad}) · {hojasNecesarias} hoja{hojasNecesarias !== 1 ? 's' : ''}
              </>
            )}
          </Button>

          {!selectedProducto && (
            <p className="text-xs text-center text-muted-foreground">
              Seleccioná un producto para generar las etiquetas
            </p>
          )}

          {selectedProducto && !selectedProducto.codigo_barras && (
            <p className="text-xs text-center text-amber-600">
              ⚠️ Este producto no tiene código de barras. La etiqueta se generará sin código de barras.
            </p>
          )}

          {selectedProducto && (
            <p className="text-xs text-center text-muted-foreground">
              📄 {cantidad} etiquetas en {hojasNecesarias} hoja{hojasNecesarias !== 1 ? 's' : ''} A4 (24 por hoja)
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
