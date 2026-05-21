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
      '¡Es muy fácil! Podés escribirnos por WhatsApp al 3754-419324, completar el formulario de contacto o utilizar cualquiera de los medios disponibles en nuestra web para comunicarte con nosotros.\n\nContanos qué productos y cantidades necesitás, y te confirmaremos el stock disponible o el tiempo de elaboración a la brevedad.\n\nPara confirmar el pedido, solicitamos una seña mediante transferencia o billetera virtual, y el saldo restante se abona al momento de la entrega. Las transferencias pueden realizarse sin inconvenientes a nuestra cuenta de Mercado Pago.\n\nAdemás, todos los datos enviados a través del formulario son tratados de manera segura y confidencial. Una vez confirmado el pedido, coordinamos el punto de entrega.',
  },
  {
    question: '¿Cuánto cuesta el envío?',
    answer:
      'El envío es gratuito dentro de la ciudad de Posadas abonando la seña correspondiente.\n\nPara localidades cercanas o alrededores, podés consultarnos por WhatsApp o utilizar cualquiera de los medios de contacto disponibles en nuestra web, y te informaremos el costo según la zona de entrega.',
  },
  {
    question: '¿Las pastas vienen frescas o congeladas?',
    answer:
      '¡Vos elegís! Podés pedirlas frescas para consumir en el momento o freezadas para conservarlas y disfrutarlas cuando quieras.\n\nEn ambas presentaciones mantenemos la misma calidad, sabor y elaboración artesanal que nos caracteriza.',
  },
  {
    question: '¿Con cuánta anticipación debo realizar el pedido?',
    answer:
      'Recomendamos realizar los pedidos con al menos 24 a 48 horas de anticipación en productos sin stock disponible o en pedidos de gran cantidad, para poder elaborarlos con el tiempo, la frescura y la dedicación que merecen.',
  },
  {
    question: '¿Qué medios de pago aceptan?',
    answer:
      'Aceptamos pagos mediante transferencias bancarias, billeteras virtuales y efectivo.\n\nLas transferencias pueden realizarse sin inconvenientes a nuestra cuenta de Mercado Pago. En algunos pedidos solicitamos una seña previa para confirmar la reserva, mientras que el saldo restante se abona al momento de la entrega.',
  },
  {
    question: '¿Cuentan con local físico?',
    answer:
      'Actualmente no contamos con atención en local físico. Elaboramos nuestros productos de manera artesanal en nuestra fábrica de pastas y realizamos entregas a domicilio.\n\nEsta modalidad nos permite mantener la frescura, la calidad de cada elaboración y ofrecer precios accesibles a nuestros clientes.',
  },
  {
    question: '¿Realizan pedidos para eventos, instituciones o fiestas?',
    answer:
      'Sí, trabajamos con pedidos para eventos, reuniones, instituciones y celebraciones. Elaboramos productos en cantidades especiales según las necesidades de cada cliente.\n\nPodés realizar tu consulta por WhatsApp o completando el formulario de contacto para enviarnos tu solicitud. Todos los mensajes y pedidos son respondidos a la brevedad para brindarte una atención rápida y personalizada.',
  },
]

export default function FAQ() {
  return (
    <section id="faq" className="min-h-screen flex flex-col justify-center py-12 sm:py-16 md:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-marron">
            Preguntas <span className="text-rojo">Frecuentes</span>
          </h2>
          <div className="h-1 w-20 bg-mostaza mx-auto mt-4 rounded-full" />
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem
                  value={`faq-${index}`}
                  className="border-none"
                >
                  <AccordionTrigger className="text-lg font-bold text-marron hover:text-mostaza hover:no-underline text-left px-5 py-4 sm:px-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed px-5 pb-5 sm:px-6 sm:pb-6 whitespace-pre-line">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
