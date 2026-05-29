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
  { id: 'sin_gluten', label: 'Sin gluten' },
  { id: 'con_gluten', label: 'Con gluten' },
  { id: 'integral', label: 'Integral' },
  { id: 'congelado', label: 'Congelado' },
  { id: 'artesanal', label: 'Producto artesanal' },
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
  const [infoExtra, setInfoExtra] = useState<string[]>([])
  const [incluirLogo, setIncluirLogo] = useState<boolean>(true)

  // Data URLs
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [whatsappIconDataUrl, setWhatsappIconDataUrl] = useState<string | null>(null)

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
        const res = await fetch('/images/logoweb.png')
        const blob = await res.blob()
        const reader = new FileReader()
        reader.onloadend = () => setLogoDataUrl(reader.result as string)
        reader.readAsDataURL(blob)
      } catch {
        setLogoDataUrl(null)
      }
    }
    loadLogo()
  }, [])

  // Generate QR code for WhatsApp (bigger for new design)
  useEffect(() => {
    async function generateQR() {
      try {
        const url = await QRCode.toDataURL(
          'https://wa.me/5493754419324?text=Hola%20Orlando%20quiero%20hacer%20un%20pedido',
          { width: 256, margin: 1, color: { dark: '#333333', light: '#FFFFFF' } }
        )
        setQrCodeDataUrl(url)
      } catch (err) {
        console.error('Error generando QR:', err)
        setQrCodeDataUrl(null)
      }
    }
    generateQR()
  }, [])

  // Load WhatsApp icon as base64
  useEffect(() => {
    async function loadWhatsappIcon() {
      try {
        const res = await fetch('/images/whatsapp-icon.png')
        const blob = await res.blob()
        const reader = new FileReader()
        reader.onloadend = () => setWhatsappIconDataUrl(reader.result as string)
        reader.readAsDataURL(blob)
      } catch {
        setWhatsappIconDataUrl(null)
      }
    }
    loadWhatsappIcon()
  }, [])

  // Lazy load PDF component
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
    if (pesoOption === 'custom') return pesoCustom || '—'
    const found = PESOS_PREDEFINIDOS.find((p) => p.value === pesoOption)
    return found ? found.label : pesoOption
  }

  const getVencimientoDia = (): number => {
    if (!fechaVencimiento) return 1
    return new Date(fechaVencimiento + 'T12:00:00').getDate()
  }

  const getVencimientoMes = (): number => {
    if (!fechaVencimiento) return 1
    return new Date(fechaVencimiento + 'T12:00:00').getMonth() + 1
  }

  const hojasNecesarias = Math.ceil(cantidad / 24)

  const handleGeneratePDF = useCallback(async () => {
    if (!selectedProducto || !PDFComponent) return

    setGenerating(true)

    try {
      const barcodeDataUrl = selectedProducto.codigo_barras
        ? generateBarcodeDataUrl(selectedProducto.codigo_barras)
        : null

      const infoExtraLabels = infoExtra.map((id) => {
        const option = INFO_EXTRA_OPCIONES.find((o) => o.id === id)
        return option ? option.label : id
      })

      const etiquetaData = {
        nombre: selectedProducto.nombre,
        codigo_barras: selectedProducto.codigo_barras,
        precio_venta: selectedProducto.precio_venta,
        peso: getPesoDisplay(),
        fecha_elaboracion: formatDateDisplay(fechaElaboracion),
        fecha_vencimiento: formatDateDisplay(fechaVencimiento),
        incluir_logo: incluirLogo,
        barcodeDataUrl,
        logoDataUrl,
        qrCodeDataUrl,
        whatsappIconDataUrl,
        vencimientoDia: getVencimientoDia(),
        vencimientoMes: getVencimientoMes(),
        info_extra: infoExtraLabels,
      }

      const etiquetas = Array.from({ length: cantidad }, () => etiquetaData)
      const { pdf } = await import('@react-pdf/renderer')
      const blob = await pdf(<PDFComponent etiquetas={etiquetas} />).toBlob()

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
    incluirLogo,
    logoDataUrl,
    qrCodeDataUrl,
    whatsappIconDataUrl,
    infoExtra,
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, código o código de barras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
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
                        <div className="font-medium text-marron truncate">{producto.nombre}</div>
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Vista previa</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedProducto ? (
                <div
                  className="mx-auto rounded-lg overflow-hidden bg-white border-2 border-gray-300 p-3"
                  style={{ width: '220px', minHeight: '280px' }}
                >
                  <div className="flex flex-col" style={{ fontSize: '8px' }}>
                    {/* Logo izquierda + Nombre/Precio derecha */}
                    <div className="flex mb-2">
                      {incluirLogo && (
                        <div className="w-[30%] flex items-start justify-center pr-2">
                          <img
                            src="/images/logoweb.png"
                            alt="Logo"
                            className="w-10 h-10 object-contain"
                          />
                        </div>
                      )}
                      <div className={incluirLogo ? 'w-[70%]' : 'w-full'}>
                        <div className="font-bold text-gray-800 text-[8px] leading-tight mb-1">
                          {selectedProducto.nombre}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-[6px]">{getPesoDisplay()}</span>
                          <span className="font-bold text-rojo text-[10px]">
                            ${selectedProducto.precio_venta.toLocaleString('es-AR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Calendario de vencimiento */}
                    <div className="border border-blue-400 rounded-sm mb-1 overflow-hidden">
                      {/* Días 1-31 */}
                      <div className="flex">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
                          <div
                            key={dia}
                            className={`flex items-center justify-center leading-none border-r border-b border-blue-300 ${
                              dia === vencDia
                                ? 'bg-blue-700 text-white font-bold'
                                : 'text-gray-500'
                            }`}
                            style={{ width: '3.226%', height: '7px', fontSize: '3px' }}
                          >
                            {dia}
                          </div>
                        ))}
                      </div>
                      {/* Meses */}
                      <div className="flex">
                        {MESES_CORTOS.map((mes, idx) => (
                          <div
                            key={mes}
                            className={`flex items-center justify-center leading-none border-r border-blue-300 ${
                              idx + 1 === vencMes
                                ? 'bg-rojo text-white font-bold'
                                : 'text-gray-500'
                            }`}
                            style={{ width: '8.333%', height: '7px', fontSize: '3px' }}
                          >
                            {mes}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Info extra badges */}
                    {infoExtra.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 my-1">
                        {infoExtra.map((id) => {
                          const option = INFO_EXTRA_OPCIONES.find((o) => o.id === id)
                          return option ? (
                            <span
                              key={id}
                              className="text-blue-700 border border-blue-300 rounded-sm px-1"
                              style={{ fontSize: '3px' }}
                            >
                              {option.label}
                            </span>
                          ) : null
                        })}
                      </div>
                    )}

                    {/* Código de barras + QR + WhatsApp */}
                    <div className="flex items-end justify-between mt-1">
                      <div className="flex-1">
                        {selectedProducto.codigo_barras ? (
                          <div className="flex gap-px items-end h-4">
                            {Array.from({ length: 35 }, (_, i) => (
                              <div
                                key={i}
                                className="bg-black"
                                style={{
                                  width: Math.random() > 0.5 ? '1.5px' : '0.7px',
                                  height: `${8 + Math.random() * 6}px`,
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-[4px] text-gray-300">Sin código de barras</span>
                        )}
                      </div>
                      <div className="flex flex-col items-center ml-2">
                        <div className="w-7 h-7 border border-gray-200 rounded-sm bg-white flex items-center justify-center">
                          <span className="text-[4px] text-gray-400 font-bold">QR</span>
                        </div>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <img
                            src="/images/whatsapp-icon.png"
                            alt="WA"
                            className="w-2.5 h-2.5 object-contain"
                          />
                          <span className="text-[3.5px] text-green-600 font-bold">3754-419324</span>
                        </div>
                      </div>
                    </div>

                    {/* Fecha de elaboración */}
                    <div className="mt-1.5">
                      <span className="text-gray-500 text-[5px]">
                        Elab: {formatDateDisplay(fechaElaboracion)}
                      </span>
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
              ⚠️ Este producto no tiene código de barras. Se generará uno automáticamente al crear el producto.
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
