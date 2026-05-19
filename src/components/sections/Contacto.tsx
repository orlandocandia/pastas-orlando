'use client'

import { useState } from 'react'
import {
  Star,
  Truck,
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
} from 'lucide-react'
import QRCode from 'react-qr-code'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const WHATSAPP_LINK =
  'https://wa.me/5493754419324?text=Hola!%20Quiero%20hacer%20un%20pedido%20de%20pastas'

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

    // Validation
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

      if (!res.ok) {
        throw new Error('Error al enviar')
      }

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-marron">
            <span className="text-rojo">Contacto</span>
          </h2>
          <div className="h-1 w-20 bg-mostaza mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Columna izquierda - Información */}
          <div className="space-y-5">
            <h3 className="text-2xl font-bold text-marron mb-2">
              El amigo de las pastas
            </h3>

            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-mostaza shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-marron">El amigo de las pastas</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-mostaza shrink-0 mt-0.5" />
              <div>
                <p className="text-muted-foreground">
                  Envío <strong className="text-marron">GRATIS</strong> con seña
                </p>
                <p className="text-muted-foreground text-sm">
                  No contamos con local a la calle
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-mostaza shrink-0 mt-0.5" />
              <div>
                <p className="text-marron font-medium">Zona de cobertura</p>
                <p className="text-muted-foreground text-sm">
                  Corrientes: envío gratis
                </p>
                <p className="text-muted-foreground text-sm">
                  Alrededores: consultanos
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-mostaza shrink-0 mt-0.5" />
              <div>
                <a
                  href="tel:3754419324"
                  className="text-marron font-medium hover:text-mostaza transition-colors text-lg"
                >
                  3754-419324
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-mostaza shrink-0 mt-0.5" />
              <div>
                <a
                  href="mailto:laspastasdeorlando@gmail.com"
                  className="text-muted-foreground hover:text-mostaza transition-colors"
                >
                  laspastasdeorlando@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-mostaza shrink-0 mt-0.5" />
              <div>
                <p className="text-marron font-medium">Pedidos con anticipación</p>
                <p className="text-muted-foreground text-sm">
                  Eventos, instituciones, grandes cantidades: consultanos cuando quieras, incluso fines de semana.
                </p>
              </div>
            </div>

            {/* Botón WhatsApp */}
            <Button
              onClick={handleWhatsAppClick}
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-base px-8 py-6 mt-4"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              📲 PEDIR POR WHATSAPP
            </Button>

            {/* Código QR */}
            <div
              className="mt-6 flex flex-col items-center"
              onMouseEnter={handleQRHover}
            >
              <div className="bg-white rounded-xl border border-border p-3 shadow-sm">
                <QRCode
                  value="https://wa.me/5493754419324?text=Hola%20Orlando%2C%20vengo%20de%20la%20web%20(QR)%20y%20quiero%20hacer%20un%20pedido"
                  size={120}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Escaneá y escribí a Orlando
              </p>
            </div>
          </div>

          {/* Columna derecha - Formulario */}
          <div className="bg-crema/50 rounded-xl border border-border p-6 sm:p-8">
            <h3 className="text-xl font-bold text-marron mb-6">
              Envianos tu consulta
            </h3>

            {success && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
                ✅ Mensaje enviado. Te responderemos a la brevedad.
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-marron mb-1">
                  Nombre y apellido <span className="text-rojo">*</span>
                </label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="bg-white"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-marron mb-1">
                  Email <span className="text-rojo">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white"
                />
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-marron mb-1">
                  Teléfono / WhatsApp <span className="text-rojo">*</span>
                </label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="3754-000000"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                  className="bg-white"
                />
              </div>

              <div>
                <label htmlFor="mensaje" className="block text-sm font-medium text-marron mb-1">
                  Mensaje <span className="text-rojo">*</span>
                </label>
                <Textarea
                  id="mensaje"
                  placeholder="Escribí tu consulta..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  required
                  rows={4}
                  className="bg-white resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-mostaza hover:bg-mostaza/90 text-marron font-bold text-base py-6"
              >
                {loading ? 'Enviando...' : 'Enviar Solicitud'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
