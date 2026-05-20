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
  Phone,
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
    <section id="contacto" className="py-16 sm:py-24 bg-[#F8F7FF]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — Hominis style */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-[#6F57FF]/10 text-[#6F57FF] rounded-full text-sm font-semibold tracking-wide mb-4">
            CONTACTO
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#3C3C3B] leading-tight">
            ¿Listo para hacer tu pedido?
          </h2>
          <p className="mt-5 text-[#575756] max-w-2xl mx-auto text-base sm:text-[17px] leading-relaxed">
            Completá el formulario con tu pedido o tu consulta y me comunico con vos al instante.
            También podés contactarme directamente por los siguientes canales:
          </p>
        </div>

        {/* Two columns — Hominis style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">

          {/* LEFT COLUMN — Contact channels + QR */}
          <div className="space-y-5">

            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsAppClick}
              className="w-full flex items-center gap-5 bg-white rounded-2xl p-5 shadow-[2px_2px_11px_1px_rgba(0,0,0,0.08)] hover:shadow-[2px_2px_16px_3px_rgba(37,211,102,0.2)] transition-all duration-300 group text-left border border-transparent hover:border-[#25D366]/30"
            >
              <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 shadow-md">
                <MessageCircle className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#575756] uppercase tracking-wide">WhatsApp Directo</p>
                <p className="text-[#25D366] font-extrabold text-xl mt-0.5">3754-419324</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0 group-hover:bg-[#25D366]/20 transition-colors">
                <svg className="h-4 w-4 text-[#25D366]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </div>
            </button>

            {/* Email */}
            <a
              href="mailto:laspastasdeorlando@gmail.com"
              className="w-full flex items-center gap-5 bg-white rounded-2xl p-5 shadow-[2px_2px_11px_1px_rgba(0,0,0,0.08)] hover:shadow-[2px_2px_16px_3px_rgba(111,87,255,0.2)] transition-all duration-300 group border border-transparent hover:border-[#6F57FF]/30"
            >
              <div className="w-14 h-14 rounded-full bg-[#6F57FF] flex items-center justify-center shrink-0 shadow-md">
                <Mail className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#575756] uppercase tracking-wide">Email</p>
                <p className="text-[#6F57FF] font-extrabold text-lg mt-0.5 truncate">laspastasdeorlando@gmail.com</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#6F57FF]/10 flex items-center justify-center shrink-0 group-hover:bg-[#6F57FF]/20 transition-colors">
                <svg className="h-4 w-4 text-[#6F57FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </div>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/laspastasdeorlando"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-5 bg-white rounded-2xl p-5 shadow-[2px_2px_11px_1px_rgba(0,0,0,0.08)] hover:shadow-[2px_2px_16px_3px_rgba(225,48,108,0.2)] transition-all duration-300 group border border-transparent hover:border-[#E1306C]/30"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center shrink-0 shadow-md">
                <Instagram className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#575756] uppercase tracking-wide">Instagram</p>
                <p className="text-[#E1306C] font-extrabold text-xl mt-0.5">@laspastasdeorlando</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#E1306C]/10 flex items-center justify-center shrink-0 group-hover:bg-[#E1306C]/20 transition-colors">
                <svg className="h-4 w-4 text-[#E1306C]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </div>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com/laspastasdeorlando"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-5 bg-white rounded-2xl p-5 shadow-[2px_2px_11px_1px_rgba(0,0,0,0.08)] hover:shadow-[2px_2px_16px_3px_rgba(24,119,242,0.2)] transition-all duration-300 group border border-transparent hover:border-[#1877F2]/30"
            >
              <div className="w-14 h-14 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0 shadow-md">
                <Facebook className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#575756] uppercase tracking-wide">Facebook</p>
                <p className="text-[#1877F2] font-extrabold text-xl mt-0.5">laspastasdeorlando</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#1877F2]/10 flex items-center justify-center shrink-0 group-hover:bg-[#1877F2]/20 transition-colors">
                <svg className="h-4 w-4 text-[#1877F2]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </div>
            </a>

            {/* QR Code Card */}
            <div
              className="bg-white rounded-2xl p-6 shadow-[2px_2px_11px_1px_rgba(0,0,0,0.08)] flex flex-col sm:flex-row items-center gap-6 mt-2 border border-gray-100"
              onMouseEnter={handleQRHover}
            >
              <div className="bg-white rounded-xl p-3 shadow-[inset_0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 shrink-0">
                <QRCode
                  value={QR_LINK}
                  size={130}
                  bgColor="#FFFFFF"
                  fgColor="#3C3C3B"
                  level="M"
                />
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <Phone className="h-4 w-4 text-[#6F57FF]" />
                  <p className="text-sm font-bold text-[#575756] uppercase tracking-wide">
                    Escaneá y escribile a Orlando
                  </p>
                </div>
                <p className="text-[#25D366] font-extrabold text-lg">
                  WhatsApp 3754-419324
                </p>
                <p className="text-[#8B8B8A] text-xs mt-1">
                  Apretá o escaneá el código QR
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — Form */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[2px_2px_11px_1px_rgba(0,0,0,0.08)] border border-gray-100 self-start">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-[#6F57FF]/10 flex items-center justify-center">
                <Send className="h-5 w-5 text-[#6F57FF]" />
              </div>
              <h3 className="text-2xl font-bold text-[#3C3C3B]">
                Hacé tu consulta
              </h3>
            </div>
            <p className="text-[#575756] text-sm mb-7 ml-[52px]">
              Completá tus datos y te contacto a la brevedad
            </p>

            {success && (
              <div className="mb-6 p-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#1a7a36] text-sm flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                Mensaje enviado correctamente. Te responderemos a la brevedad.
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="nombre" className="block text-sm font-bold text-[#575756] mb-2">
                  Nombre completo <span className="text-[#FF5A5F]">*</span>
                </label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="bg-[#FAFAFA] border-[#E0E0E0] focus:border-[#6F57FF] focus:ring-[#6F57FF]/20 rounded-xl h-[52px] text-[#575756] placeholder:text-[#BFBFBF] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-[#575756] mb-2">
                  Email <span className="text-[#FF5A5F]">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#FAFAFA] border-[#E0E0E0] focus:border-[#6F57FF] focus:ring-[#6F57FF]/20 rounded-xl h-[52px] text-[#575756] placeholder:text-[#BFBFBF] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-bold text-[#575756] mb-2">
                  Teléfono / WhatsApp <span className="text-[#FF5A5F]">*</span>
                </label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="3754-000000"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                  className="bg-[#FAFAFA] border-[#E0E0E0] focus:border-[#6F57FF] focus:ring-[#6F57FF]/20 rounded-xl h-[52px] text-[#575756] placeholder:text-[#BFBFBF] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="mensaje" className="block text-sm font-bold text-[#575756] mb-2">
                  Mensaje <span className="text-[#FF5A5F]">*</span>
                </label>
                <Textarea
                  id="mensaje"
                  placeholder="Escribí tu consulta o pedido..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  required
                  rows={5}
                  className="bg-[#FAFAFA] border-[#E0E0E0] focus:border-[#6F57FF] focus:ring-[#6F57FF]/20 rounded-xl resize-none text-[#575756] placeholder:text-[#BFBFBF] transition-colors"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6F57FF] hover:bg-[#5B46CA] text-white font-semibold text-base py-[22px] rounded-xl shadow-[0_4px_14px_rgba(111,87,255,0.35)] hover:shadow-[0_6px_20px_rgba(111,87,255,0.45)] transition-all duration-300 tracking-wide"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="h-5 w-5" />
                    Estoy listo para ser contactado
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
