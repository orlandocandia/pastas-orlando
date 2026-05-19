'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: '¿Cómo hago para pedir pastas?',
    answer:
      'Muy fácil: escribinos por WhatsApp al 3754-419324, te confirmamos disponibilidad y coordinamos la entrega. Podés pagar la seña por Mercado Pago y el resto al recibir.',
  },
  {
    question: '¿Cuánto cuesta el envío?',
    answer:
      'El envío es GRATIS dentro de la ciudad de Posadas. Para localidades cercanas (alrededores), consultanos por WhatsApp y te decimos el costo.',
  },
  {
    question: '¿Las pastas vienen frescas o congeladas?',
    answer:
      'Vos elegís: las podés pedir frescas para consumir de inmediato o freezadas para tener siempre a mano. El sabor se mantiene intacto en ambas presentaciones.',
  },
  {
    question: '¿Con cuánta anticipación debo pedir?',
    answer:
      'Recomendamos pedir con al menos 24-48 horas de anticipación, así podemos elaborar tu pedido con el tiempo y la dedicación que merece. Para pedidos grandes o eventos, consultanos con más tiempo.',
  },
  {
    question: '¿Qué medios de pago aceptan?',
    answer:
      'Aceptamos Mercado Pago para la seña y efectivo al momento de la entrega. El resto del pago se abona cuando recibís tu pedido.',
  },
  {
    question: '¿Tienen local a la calle?',
    answer:
      'No contamos con local a la calle. Trabajamos de forma artesanal desde nuestro taller y realizamos entregas a domicilio. Esto nos permite mantener los precios accesibles y la calidad máxima.',
  },
  {
    question: '¿Hacen pedidos para eventos o fiestas?',
    answer:
      '¡Sí! Hacemos pedidos para eventos, reuniones y fiestas. Escribinos por WhatsApp con la cantidad de personas y te armamos un presupuesto a medida.',
  },
]

export default function FAQ() {
  return (
    <section id="faq" className="py-16 sm:py-20 bg-crema">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-marron">
            Preguntas <span className="text-rojo">Frecuentes</span>
          </h2>
          <div className="h-1 w-20 bg-mostaza mx-auto mt-4 rounded-full" />
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="border-border"
            >
              <AccordionTrigger className="text-marron font-medium hover:text-mostaza hover:no-underline text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
