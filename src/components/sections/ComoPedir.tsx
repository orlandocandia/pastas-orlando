'use client'

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
} from 'lucide-react'

interface Step {
  icons: React.ReactNode
  title: string
  description: string
}

const steps: Step[] = [
  {
    icons: (
      <>
        <MessageCircle size={28} className="text-[#25D366]" />
        <span className="text-lg font-bold text-gray-300 mx-0.5">+</span>
        <Banknote size={28} className="text-[#009EE3]" />
      </>
    ),
    title: 'Pedido y seña',
    description:
      'Consultás por WhatsApp, te confirmamos stock o tiempo al instante. Si hay, abonás la seña por Mercado Pago y agendamos tu pedido.',
  },
  {
    icons: <Truck size={32} className="text-mostaza" />,
    title: 'Coordinamos la entrega',
    description:
      'Con la seña lista, coordinamos lugar, horario y quién recibe. Envío GRATIS.',
  },
  {
    icons: <ThumbsUp size={32} className="text-rojo" />,
    title: 'Disfrutás y volvés',
    description:
      'Recibís, pagás el resto, cocinás y disfrutás. ¿Te gustó? Dejá tu opinión.',
  },
  {
    icons: (
      <>
        <Heart size={26} className="text-marron" />
        <ChefHat size={26} className="text-marron ml-1" />
      </>
    ),
    title: 'Elaboración artesanal',
    description:
      'Cada pasta se elabora a mano con materia prima fresca. Respetamos nuestras recetas y los tiempos.',
  },
  {
    icons: (
      <>
        <Snowflake size={26} className="text-[#3B82F6]" />
        <Sun size={26} className="text-mostaza ml-1" />
      </>
    ),
    title: 'Fresco o congelado',
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Círculo decorativo con íconos */}
              <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-105 hover:shadow-lg transition-all duration-300">
                {step.icons}
              </div>

              {/* Título del paso */}
              <h3 className="text-lg font-bold text-marron mb-2">
                {step.title}
              </h3>

              {/* Texto descriptivo */}
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
