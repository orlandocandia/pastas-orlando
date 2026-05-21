'use client'

import { useState, Fragment } from 'react'
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
  ChevronRight,
  ChevronDown,
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

        {/* Steps with arrows — flex wrapper for arrow alignment */}
        <motion.div
          className="flex flex-wrap justify-center items-center gap-4 lg:gap-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {steps.map((step, index) => (
            <Fragment key={index}>
              {/* Tarjeta */}
              <motion.div
                variants={cardVariants}
                className="grid bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 min-h-[480px] w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)]"
                style={{ gridTemplateRows: 'auto 11rem 1fr' }}
              >
                {/* Fila 1: Número + Ícono + Título */}
                <div className="text-center pb-3">
                  {/* Numeración */}
                  <div className="w-8 h-8 mx-auto mb-2 bg-mostaza rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  {/* Ícono */}
                  <div className="w-20 h-20 mx-auto mb-3 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-105 hover:shadow-lg transition-all duration-300">
                    {step.icons}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-marron whitespace-nowrap px-2">
                    {step.title}
                  </h3>
                </div>

                {/* Fila 2: Imagen */}
                <div className="relative h-48 w-full my-3 rounded-lg overflow-hidden bg-gray-100">
                  <StepImage src={step.image} alt={step.imageAlt} />
                </div>

                {/* Fila 3: Texto */}
                <div className="flex items-start pt-1">
                  <p className="text-gray-600 text-sm text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>

              {/* Flecha entre tarjetas — no después de la última */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center text-mostaza/60 mx-1">
                  <ChevronRight className="h-6 w-6" />
                </div>
              )}

              {/* Flecha vertical en mobile — no después de la última */}
              {index < steps.length - 1 && (
                <div className="flex lg:hidden items-center justify-center text-mostaza/60 my-1 w-full">
                  <ChevronDown className="h-6 w-6" />
                </div>
              )}
            </Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
