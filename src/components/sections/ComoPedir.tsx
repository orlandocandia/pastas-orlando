'use client'

import { useState, Fragment } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Truck,
  ThumbsUp,
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
      <div className="flex items-center justify-center gap-2">
        <svg viewBox="0 0 32 32" className="w-9 h-9" fill="#25D366">
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.132 6.742 3.054 9.378L1.054 31.29l6.118-1.962A15.9 15.9 0 0016.004 32C24.826 32 32 24.826 32 16.004S24.826 0 16.004 0zm9.31 22.61c-.39 1.1-1.932 2.014-3.164 2.28-.844.18-1.946.324-5.66-1.216-4.748-1.97-7.804-6.78-8.038-7.094-.226-.314-1.886-2.512-1.886-4.79s1.194-3.398 1.618-3.864c.39-.428.852-.536 1.136-.536.282 0 .566.002.812.016.262.012.614-.1.96.732.356.854 1.21 2.95 1.316 3.164.108.214.18.466.036.748-.136.282-.204.458-.408.706-.214.248-.448.554-.638.744-.214.214-.436.446-.188.876.248.428 1.104 1.82 2.37 2.948 1.63 1.452 3.004 1.902 3.432 2.116.428.214.676.18.924-.108.248-.288 1.064-1.24 1.348-1.666.282-.428.566-.356.952-.214.39.142 2.478 1.168 2.902 1.382.428.214.712.322.818.498.108.178.108 1.022-.282 2.12z" />
        </svg>
        <span className="text-2xl font-bold text-gray-300">+</span>
        <Image src="/images/mp.jpg" alt="Mercado Pago" width={36} height={36} className="w-9 h-9 rounded object-contain" />
      </div>
    ),
    title: 'Pedido y seña',
    image: '/images/pasos/pedido-sena.jpg',
    imageAlt: 'Pedido y seña por WhatsApp y Mercado Pago',
    description:
      'Consultás por cualquiera de nuestros medios de contacto (WhatsApp, email, redes sociales o el formulario de la web). Te confirmamos al instante si tenemos stock disponible o cuánto tiempo nos llevará preparar tu pedido. Si hay stock o podemos elaborarlo, abonás la seña por Mercado Pago y agendamos tu pedido.',
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
    imageAlt: 'Persona disfrutando pastas caseras',
    description:
      'Recibís, pagás el resto, cocinás y disfrutás. ¿Te gustó? Dejá tu opinión.',
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
    <section id="como-pedir" className="min-h-screen flex flex-col justify-center py-12 sm:py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-marron">
            Tu pedido <span className="text-rojo">paso a paso</span>
          </h2>
          <div className="h-1 w-20 bg-mostaza mx-auto mt-4 rounded-full" />
        </div>

        {/* Steps with arrows — flex wrapper for horizontal alignment */}
        <motion.div
          className="flex flex-wrap md:flex-nowrap justify-center items-stretch gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {steps.map((step, index) => (
            <Fragment key={index}>
              {/* Tarjeta — flex column layout for proper text allocation */}
              <motion.div
                variants={cardVariants}
                className="flex flex-col bg-crema rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-4 sm:p-6 w-full md:flex-1"
              >
                {/* Bloque superior: Número + Ícono + Título */}
                <div className="flex-shrink-0 text-center pb-3">
                  {/* Numeración */}
                  <div className="w-8 h-8 mx-auto mb-2 bg-mostaza rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  {/* Ícono */}
                  <div className="w-20 h-20 mx-auto mb-3 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-105 hover:shadow-lg transition-all duration-300">
                    {step.icons}
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-marron whitespace-nowrap px-2">
                    {step.title}
                  </h3>
                </div>

                {/* Imagen — altura fija, no se encoge */}
                <div className="relative h-40 sm:h-48 w-full my-3 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <StepImage src={step.image} alt={step.imageAlt} />
                </div>

                {/* Texto — ocupa el espacio restante, siempre visible */}
                <div className="flex-grow mt-2">
                  <p className="text-gray-600 text-sm text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>

              {/* Flecha horizontal en desktop — no después de la última */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center text-marron/50">
                  <ChevronRight className="h-8 w-8" />
                </div>
              )}

              {/* Flecha vertical en mobile — no después de la última */}
              {index < steps.length - 1 && (
                <div className="flex md:hidden items-center justify-center text-marron/50 w-full">
                  <ChevronDown className="h-8 w-8" />
                </div>
              )}
            </Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
