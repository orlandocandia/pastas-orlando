'use client'

import { useState } from 'react'
import {
  Star,
  Truck,
  MapPin,
  Phone,
  Mail,
  Calendar,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const WHATSAPP_LINK =
  'https://wa.me/549376419324?text=Hola!%20Quiero%20hacer%20un%20pedido%20de%20pastas'

const orderSteps = [
  'Escribinos por WhatsApp',
  'Decinos qué producto y cantidades',
  'Te confirmamos stock o tiempo al instante',
  'Abonás la seña (datos por privado)',
  'Coordinamos lugar, horario y quién recibe',
  'Recibís, pagás el resto y disfrutás',
]

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
                  Posadas: envío gratis
                </p>
                <p className="text-muted-foreground text-sm">
                  Alrededores: consultanos según el pedido
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
              <Calendar className="h-5 w-5 text-mostaza shrink-0 mt-0.5" />
              <div>
                <p className="text-marron font-medium text-sm">Pedidos con anticipación</p>
                <p className="text-muted-foreground text-sm">
                  Eventos, instituciones, grandes cantidades: consultanos cuando quieras, incluso fines de semana.
                </p>
              </div>
            </div>

            {/* Botón WhatsApp */}
            <Button
              onClick={handleWhatsAppClick}
              size="lg"
              className="w-full sm:w-auto bg-whatsapp hover:bg-whatsapp/90 text-white font-bold text-base px-8 py-6 mt-4"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              📲 PEDIR POR WHATSAPP
            </Button>

            {/* Código QR */}
            <div
              className="mt-6 flex flex-col items-center"
              onMouseEnter={handleQRHover}
            >
              <div className="w-[100px] h-[100px] bg-muted rounded-lg flex items-center justify-center border border-border">
                <div className="text-center">
                  <span className="text-2xl">📱</span>
                  <p className="text-[8px] text-muted-foreground mt-0.5">QR</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Escaneá y pedí</p>
            </div>
          </div>

          {/* Columna derecha - Pasos para pedir */}
          <div className="bg-crema/50 rounded-xl border border-border p-6 sm:p-8">
            <h3 className="text-xl font-bold text-marron mb-6">
              ¿Cómo hacer tu pedido?
            </h3>
            <ol className="space-y-4">
              {orderSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-4">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-mostaza text-marron font-bold text-sm shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
