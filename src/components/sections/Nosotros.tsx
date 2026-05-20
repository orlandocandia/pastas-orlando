'use client'

import { motion } from 'framer-motion'
import { Palette, Clock, Award, Leaf } from 'lucide-react'

const values = [
  {
    icon: <Palette className="h-7 w-7" />,
    title: 'Artesanal',
    description:
      'Cada pasta se estira, se corta y se rellena a mano, respetando las técnicas tradicionales.',
  },
  {
    icon: <Clock className="h-7 w-7" />,
    title: 'Tradición',
    description:
      'Recetas heredadas que se perfeccionan con cada vuelta de masa, manteniendo la esencia.',
  },
  {
    icon: <Award className="h-7 w-7" />,
    title: 'Calidad',
    description:
      'Materia prima seleccionada y maquinaria de verdad para garantizar la mejor textura y sabor.',
  },
  {
    icon: <Leaf className="h-7 w-7" />,
    title: 'Frescura',
    description:
      'Ingredientes frescos de productores locales. De la huerta a tu mesa, sin intermediarios.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const textVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

export default function Nosotros() {
  return (
    <section id="nosotros" className="min-h-screen flex flex-col justify-center py-16 sm:py-20 bg-crema">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-marron">
            Sobre <span className="text-rojo">Nosotros</span>
          </h2>
          <div className="h-1 w-20 bg-mostaza mx-auto mt-4 rounded-full" />
        </div>

        {/* Story */}
        <motion.div
          className="max-w-3xl mx-auto text-center mb-14"
          variants={textVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-4">
            <strong className="text-marron">Pastas Orlando</strong> nació como
            un emprendimiento de una sola persona con una pasión inquebrantable
            por la pasta artesanal. Con maquinaria de verdad y la dedicación que
            solo da el amor por lo que uno hace, cada producto se elabora
            cuidando cada detalle.
          </p>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Trabajamos con productores locales de Posadas y la zona para
            conseguir la materia prima más fresca: huevos de campo, harinas
            selectas y verduras de estación. Porque creemos que una buena pasta
            empieza mucho antes de la mesa.
          </p>
        </motion.div>

        {/* Values Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {values.map((value, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="flex flex-col items-center text-center p-6 rounded-xl bg-white border border-border hover:border-mostaza/40 hover:shadow-md transition-all duration-300"
            >
              <div className="mb-4 flex items-center justify-center h-14 w-14 rounded-full bg-mostaza/15 text-mostaza">
                {value.icon}
              </div>
              <h3 className="font-bold text-marron text-lg mb-2">
                {value.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
