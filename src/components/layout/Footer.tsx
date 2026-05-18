'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Facebook, Instagram } from 'lucide-react'
import { MessageCircle } from 'lucide-react'

const whatsappLink = 'https://wa.me/549376419324?text=Hola!%20Quiero%20hacer%20un%20pedido%20de%20pastas'

export default function Footer() {
  return (
    <footer className="bg-marron text-crema mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo + Copyright */}
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Pastas Orlando"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <div>
              <p className="font-bold text-mostaza">Pastas Orlando</p>
              <p className="text-xs text-crema/70">
                &copy; {new Date().getFullYear()} Todos los derechos reservados
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-crema/70 hover:text-mostaza transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-crema/70 hover:text-mostaza transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-crema/70 hover:text-whatsapp transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
            </a>

            {/* Discreet admin access */}
            <Link
              href="/admin/login"
              className="text-crema/30 hover:text-rojo transition-colors ml-2"
              aria-label="Admin"
            >
              <Heart className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-crema/10 text-center">
          <p className="text-xs text-crema/50">
            Pastas artesanales hechas con amor y tradición en Posadas, Misiones
          </p>
        </div>
      </div>
    </footer>
  )
}
