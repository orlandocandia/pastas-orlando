'use client'

import { useState } from 'react'
import {
  MessageCircle,
  Mail,
  Instagram,
  Facebook,
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
    <section id="contacto" className="py-16 sm:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#5C3A21]">
            ¿Listo para hacer tu pedido?
          </h2>
          <p className="mt-4 text-[#6B7280] max-w-2xl mx-auto text-base leading-relaxed">
            Completá el formulario con tu pedido o tu consulta y me comunico con vos al instante.
            También podés contactarme directamente por los siguientes canales:
          </p>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT COLUMN — Contact channels + QR */}
          <div className="space-y-4">

            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsAppClick}
              className="w-full flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-green-300 transition-all group text-left"
            >
              <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#374151]">WhatsApp Directo</p>
                <p className="text-[#25D366] font-bold text-lg">3754-419324</p>
              </div>
              <svg className="h-5 w-5 text-gray-300 group-hover:text-[#25D366] transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>

            {/* Email */}
            <a
              href="mailto:laspastasdeorlando@gmail.com"
              className="w-full flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#E1AD01] transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-[#E1AD01] flex items-center justify-center shrink-0">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#374151]">Email</p>
                <p className="text-[#E1AD01] font-bold text-base truncate">laspastasdeorlando@gmail.com</p>
              </div>
              <svg className="h-5 w-5 text-gray-300 group-hover:text-[#E1AD01] transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/laspastasdeorlando"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#E1306C] transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center shrink-0">
                <Instagram className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#374151]">Instagram</p>
                <p className="text-[#E1306C] font-bold text-lg">@laspastasdeorlando</p>
              </div>
              <svg className="h-5 w-5 text-gray-300 group-hover:text-[#E1306C] transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com/laspastasdeorlando"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#1877F2] transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0">
                <Facebook className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#374151]">Facebook</p>
                <p className="text-[#1877F2] font-bold text-lg">laspastasdeorlando</p>
              </div>
              <svg className="h-5 w-5 text-gray-300 group-hover:text-[#1877F2] transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </a>

            {/* QR Code Card */}
            <div
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col items-center mt-2"
              onMouseEnter={handleQRHover}
            >
              <div className="bg-white rounded-xl p-2 shadow-inner border border-gray-100">
                <QRCode
                  value={QR_LINK}
                  size={120}
                />
              </div>
              <p className="mt-3 text-sm font-medium text-[#374151]">
                Escaneá y escribile a Orlando
              </p>
              <p className="mt-1 text-xs text-[#6B7280]">
                WhatsApp 3754-419324
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN — Form */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-[#5C3A21] mb-1">
              Hacé tu consulta
            </h3>
            <p className="text-[#6B7280] text-sm mb-6">
              Completá tus datos y te contacto a la brevedad
            </p>

            {success && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2">
                <span className="text-green-500 text-lg">✓</span>
                Mensaje enviado correctamente. Te responderemos a la brevedad.
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <span className="text-red-500 text-lg">!</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="nombre" className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Nombre completo <span className="text-[#C41E3A]">*</span>
                </label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="bg-[#F9FAFB] border-gray-200 focus:border-[#E1AD01] focus:ring-[#E1AD01]/20 rounded-xl h-11"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Email <span className="text-[#C41E3A]">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#F9FAFB] border-gray-200 focus:border-[#E1AD01] focus:ring-[#E1AD01]/20 rounded-xl h-11"
                />
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Teléfono / WhatsApp <span className="text-[#C41E3A]">*</span>
                </label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="3754-000000"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                  className="bg-[#F9FAFB] border-gray-200 focus:border-[#E1AD01] focus:ring-[#E1AD01]/20 rounded-xl h-11"
                />
              </div>

              <div>
                <label htmlFor="mensaje" className="block text-sm font-semibold text-[#374151] mb-1.5">
                  Mensaje <span className="text-[#C41E3A]">*</span>
                </label>
                <Textarea
                  id="mensaje"
                  placeholder="Escribí tu consulta o pedido..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  required
                  rows={4}
                  className="bg-[#F9FAFB] border-gray-200 focus:border-[#E1AD01] focus:ring-[#E1AD01]/20 rounded-xl resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E1AD01] hover:bg-[#d4a300] text-[#5C3A21] font-bold text-base py-6 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Enviando...
                  </span>
                ) : (
                  'Enviar Solicitud'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
