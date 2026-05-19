'use client'

import { motion } from 'framer-motion'
import { MessageCircle, MapPin, UtensilsCrossed, ChefHat, RefreshCw } from 'lucide-react'

const steps = [
  {
    icon: <MessageCircle className="h-8 w-8" />,
    accent: <span className="text-mostaza text-2xl">💬</span>,
    title: 'Pedido y seña',
    description:
      'Consultás por WhatsApp, te confirmamos stock o tiempo al instante. Si hay, abonás la seña por Mercado Pago y agendamos tu pedido.',
  },
  {
    icon: <MapPin className="h-8 w-8" />,
    accent: <span className="text-mostaza text-2xl">📍</span>,
    title: 'Coordinamos la entrega',
    description:
      'Con la seña lista, coordinamos lugar, horario y quién recibe. Envío GRATIS.',
  },
  {
    icon: <UtensilsCrossed className="h-8 w-8" />,
    accent: <span className="text-mostaza text-2xl">🍽️</span>,
    title: 'Disfrutás y volvés',
    description:
      'Recibís, pagás el resto, cocinás y disfrutás. ¿Te gustó? Dejá tu opinión.',
  },
  {
    icon: <ChefHat className="h-8 w-8" />,
    accent: <span className="text-mostaza text-2xl">👨‍🍳</span>,
    title: 'Elaboración artesanal',
    description:
      'Cada pasta se elabora a mano con materia prima fresca. Respetamos nuestras recetas y los tiempos.',
  },
  {
    icon: <RefreshCw className="h-8 w-8" />,
    accent: <span className="text-mostaza text-2xl">🔄</span>,
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
    <section id="como-pedir" className="py-16 sm:py-20 bg-white">
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
              className="flex flex-col items-center text-center p-6 rounded-xl bg-crema/50 border border-border hover:border-mostaza/40 hover:shadow-md transition-all duration-300"
            >
              {/* Icon */}
              <div className="mb-4 flex items-center justify-center h-16 w-16 rounded-full bg-mostaza/15 text-mostaza">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="font-bold text-marron text-lg mb-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
