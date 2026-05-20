'use client'

import { useState } from 'react'
import {
  MessageCircle,
  Mail,
  Instagram,
  Facebook,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import QRCode from 'react-qr-code'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const WHATSAPP_LINK =
  'https://wa.me/5493754419324?text=Hola!%20Quiero%20hacer%20un%20pedido%20de%20pastas'

const QR_LINK =
  'https://wa.me/5493754419324?text=Hola%20Orlando%2C%20vengo%20de%20la%20web%20(QR)%20y%20quiero%20hacer%20un%20pedido'

async function trackInteraction(tipo: string) {
  try {
    await fetch('/api/contacto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo,
        mensaje_enviado: tipo === 'whatsapp_click' ? 'Click en botón WhatsApp' : 'Escaneo QR',
      }),
    })
  } catch {
    // silencioso
  }
}

export default function Contacto() {
  const [qrHovered, setQrHovered] = useState(false)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleWhatsAppClick = () => {
    trackInteraction('whatsapp_click')
    window.open(WHATSAPP_LINK, '_blank')
  }

  const handleQRHover = () => {
    if (!qrHovered) {
      setQrHovered(true)
      trackInteraction('qr_scan')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!nombre.trim() || !email.trim() || !telefono.trim() || !mensaje.trim()) {
      setError('Todos los campos son obligatorios.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Ingresá un email válido.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/consultas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, telefono, mensaje }),
      })

      if (!res.ok) throw new Error('Error al enviar')

      setSuccess(true)
      setNombre('')
      setEmail('')
      setTelefono('')
      setMensaje('')
    } catch {
      setError('Ocurrió un error al enviar. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contacto" className="py-16 sm:py-20 bg-crema">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title — mismo estilo que el resto de las secciones */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-marron">
            <span className="text-rojo">Contacto</span>
          </h2>
          <div className="h-1 w-20 bg-mostaza mx-auto mt-4 rounded-full" />
          <p className="text-marron font-bold text-lg sm:text-xl mt-5">
            ¿Listo para hacer tu pedido?
          </p>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Completá el formulario y me comunico con vos en menos de 24 horas.
            También podés contactarme directamente por los siguientes canales:
          </p>
        </div>

        {/* Two columns — equal height */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">

          {/* ===== LEFT COLUMN — Contact channels + QR ===== */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8 flex flex-col">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsAppClick}
              className="flex items-center gap-4 p-4 rounded-xl bg-green-50 border border-green-100 hover:bg-green-100 hover:border-green-200 transition-colors group w-full text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 32 32" className="w-7 h-7" fill="white">
                  <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.132 6.742 3.054 9.378L1.054 31.29l6.118-1.962A15.9 15.9 0 0016.004 32C24.826 32 32 24.826 32 16.004S24.826 0 16.004 0zm9.31 22.61c-.39 1.1-1.932 2.014-3.164 2.28-.844.18-1.946.324-5.66-1.216-4.748-1.97-7.804-6.78-8.038-7.094-.226-.314-1.886-2.512-1.886-4.79s1.194-3.398 1.618-3.864c.39-.428.852-.536 1.136-.536.282 0 .566.002.812.016.262.012.614-.1.96.732.356.854 1.21 2.95 1.316 3.164.108.214.18.466.036.748-.136.282-.204.458-.408.706-.214.248-.448.554-.638.744-.214.214-.436.446-.188.876.248.428 1.104 1.82 2.37 2.948 1.63 1.452 3.004 1.902 3.432 2.116.428.214.676.18.924-.108.248-.288 1.064-1.24 1.348-1.666.282-.428.566-.356.952-.214.39.142 2.478 1.168 2.902 1.382.428.214.712.322.818.498.108.178.108 1.022-.282 2.12z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-green-900">WhatsApp Directo</div>
                <div className="text-sm text-green-700 font-semibold">3754-419324</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </div>
            </button>

            {/* Email */}
            <a
              href="mailto:laspastasdeorlando@gmail.com"
              className="flex items-center gap-4 p-4 rounded-xl bg-mostaza/5 border border-mostaza/20 hover:bg-mostaza/10 hover:border-mostaza/30 transition-colors group mt-4"
            >
              <div className="w-12 h-12 rounded-xl bg-mostaza flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-marron">Email</div>
                <div className="text-sm text-marron/70 font-medium truncate">laspastasdeorlando@gmail.com</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-mostaza/10 flex items-center justify-center flex-shrink-0 group-hover:bg-mostaza/20 transition-colors">
                <svg className="h-4 w-4 text-mostaza" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </div>
            </a>

            {/* Instagram + Facebook — 2-column grid */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* Instagram */}
              <a
                href="https://instagram.com/laspastasdeorlando"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 hover:from-pink-100 hover:to-purple-100 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm min-w-0">
                  <div className="font-bold text-pink-900 truncate">@laspastasdeorlando</div>
                  <div className="text-xs text-pink-600">Instagram</div>
                </div>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com/laspastasdeorlando"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#1877F2] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Facebook className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm min-w-0">
                  <div className="font-bold text-blue-900 truncate">laspastasdeorlando</div>
                  <div className="text-xs text-blue-600">Facebook</div>
                </div>
              </a>
            </div>

            {/* QR Code */}
            <div
              className="flex flex-col items-center mt-6 pt-6 border-t border-border"
              onMouseEnter={handleQRHover}
            >
              <p className="text-sm font-bold text-marron mb-1">
                Escaneá y escribile a Orlando
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Apretá con la cámara de tu celular
              </p>
              <div className="bg-white p-3 rounded-2xl shadow-md border border-border">
                <QRCode
                  value={QR_LINK}
                  size={120}
                  bgColor="#FFFFFF"
                  fgColor="#5C3A21"
                  level="M"
                />
              </div>
              <p className="text-xs text-marron/70 mt-3 flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
                WhatsApp 3754-419324
              </p>
            </div>
          </div>

          {/* ===== RIGHT COLUMN — Form ===== */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8 flex flex-col">
            {/* Form header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-mostaza/15 flex items-center justify-center">
                  <Send className="h-5 w-5 text-mostaza" />
                </div>
                <h3 className="text-xl font-bold text-marron">
                  Hacé tu consulta
                </h3>
              </div>
              <p className="text-muted-foreground text-sm ml-[52px]">
                Completá tus datos y te contacto a la brevedad
              </p>
            </div>

            {success && (
              <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                Mensaje enviado correctamente. Te responderemos a la brevedad.
              </div>
            )}

            {error && (
              <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-marron mb-1.5">
                  Nombre completo <span className="text-rojo">*</span>
                </label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre y apellido"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  minLength={2}
                  className="bg-crema/40 border-border focus:border-mostaza focus:ring-mostaza/20 rounded-xl h-12 text-marron placeholder:text-muted-foreground/60"
                />
              </div>

              {/* Email + Teléfono — 2 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-marron mb-1.5">
                    Email <span className="text-rojo">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-crema/40 border-border focus:border-mostaza focus:ring-mostaza/20 rounded-xl h-12 text-marron placeholder:text-muted-foreground/60"
                  />
                </div>
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-marron mb-1.5">
                    Teléfono / WhatsApp <span className="text-rojo">*</span>
                  </label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="3754-000000"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                    className="bg-crema/40 border-border focus:border-mostaza focus:ring-mostaza/20 rounded-xl h-12 text-marron placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              {/* Mensaje — bigger to fill height */}
              <div className="flex-1 flex flex-col">
                <label htmlFor="mensaje" className="block text-sm font-medium text-marron mb-1.5">
                  Mensaje <span className="text-rojo">*</span>
                </label>
                <Textarea
                  id="mensaje"
                  placeholder="Contame qué necesitás o cualquier consulta..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  required
                  rows={6}
                  className="bg-crema/40 border-border focus:border-mostaza focus:ring-mostaza/20 rounded-xl resize-none text-marron placeholder:text-muted-foreground/60 flex-1"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-mostaza hover:bg-mostaza/90 text-marron font-bold text-base py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Enviar Solicitud
                    <Send className="h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Al enviar este formulario, aceptás que me comunique con vos para responder tu consulta. Tus datos están protegidos.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
