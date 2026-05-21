'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  MessageCircle,
  Banknote,
  Truck,
  ThumbsUp,
  Heart,
  ChefHat,
  Snowflake,
  Sun,
  ImageIcon,
} from 'lucide-react'

interface Step {
  icons: React.ReactNode
  title: string
  image: string
  imageAlt: string
  description: string
}

const steps: Step[] = [
  {
    icons: (
      <>
        <MessageCircle size={40} className="text-[#25D366]" />
        <span className="text-2xl font-bold text-gray-300 mx-0.5">+</span>
        <Banknote size={40} className="text-[#009EE3]" />
      </>
    ),
    title: 'Pedido y seña',
    image: '/images/pasos/pedido-sena.jpg',
    imageAlt: 'Pedido y seña por WhatsApp y Mercado Pago',
    description:
      'Consultás por WhatsApp, te confirmamos stock o tiempo al instante. Si hay, abonás la seña por Mercado Pago y agendamos tu pedido.',
  },
  {
    icons: <Truck size={40} className="text-mostaza" />,
    title: 'Coordinamos la entrega',
    image: '/images/pasos/coordinacion.jpg',
    imageAlt: 'Coordinación de entrega a domicilio',
    description:
      'Con la seña lista, coordinamos lugar, horario y quién recibe. Envío GRATIS.',
  },
  {
    icons: <ThumbsUp size={40} className="text-rojo" />,
    title: 'Disfrutás y volvés',
    image: '/images/pasos/disfrute.jpg',
    imageAlt: 'Plato de pastas caseras',
    description:
      'Recibís, pagás el resto, cocinás y disfrutás. ¿Te gustó? Dejá tu opinión.',
  },
  {
    icons: (
      <>
        <Heart size={32} className="text-marron" />
        <ChefHat size={32} className="text-marron ml-1" />
      </>
    ),
    title: 'Elaboración artesanal',
    image: '/images/pasos/elaboracion.jpg',
    imageAlt: 'Elaboración artesanal de pastas',
    description:
      'Cada pasta se elabora a mano con materia prima fresca. Respetamos nuestras recetas y los tiempos.',
  },
  {
    icons: (
      <>
        <Snowflake size={32} className="text-[#3B82F6]" />
        <Sun size={32} className="text-mostaza ml-1" />
      </>
    ),
    title: 'Fresco o congelado',
    image: '/images/pasos/fresco-congelado.jpg',
    imageAlt: 'Pastas frescas o congeladas',
    description:
      'Vos decidís: frescas o freezadas. El sabor se mantiene intacto.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

function StepImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 gap-2">
        <ImageIcon className="h-8 w-8" strokeWidth={1.2} />
        <span className="text-xs">Imagen no disponible</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 33vw"
      onError={() => setError(true)}
    />
  )
}

export default function ComoPedir() {
  return (
    <section id="como-pedir" className="min-h-screen flex flex-col justify-center py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-marron">
            Tu pedido <span className="text-rojo">paso a paso</span>
          </h2>
          <div className="h-1 w-20 bg-mostaza mx-auto mt-4 rounded-full" />
        </div>

        {/* Steps Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              /*
                DEFINITIVE FIX: CSS Grid con filas explícitas en lugar de flexbox.
                - Fila 1 (auto): ícono + título → se adapta al contenido
                - Fila 2 (11rem): imagen → SIEMPRE 176px, posición fija
                - Fila 3 (1fr): texto → ocupa el espacio restante

                A diferencia de flexbox con justify-between (que distribuye
                espacio extra entre items), CSS Grid mantiene la imagen
                exactamente en la misma posición vertical en todas las tarjetas.
              */
              className="grid bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 min-h-[480px]"
              style={{ gridTemplateRows: 'auto 11rem 1fr' }}
            >
              {/* Fila 1: Ícono + Título */}
              <div className="text-center pb-3">
                <div className="w-20 h-20 mx-auto mb-3 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-105 hover:shadow-lg transition-all duration-300">
                  {step.icons}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-marron whitespace-nowrap px-2">
                  {step.title}
                </h3>
              </div>

              {/* Fila 2: Imagen — altura fija h-48, misma posición en TODAS las tarjetas */}
              <div className="relative h-48 w-full my-3 rounded-lg overflow-hidden bg-gray-100">
                <StepImage src={step.image} alt={step.imageAlt} />
              </div>

              {/* Fila 3: Texto — ocupa espacio restante */}
              <div className="flex items-start pt-1">
                <p className="text-gray-600 text-sm text-center leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
