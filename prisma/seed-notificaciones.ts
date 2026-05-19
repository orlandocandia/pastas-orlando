import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PlantillaNotificacion y AlertaConfiguracion...\n');

  // ============================================
  // PLANTILLAS DE NOTIFICACIÓN
  // ============================================

  const plantillas = [
    {
      nombre: 'pedido_confirmado',
      canal: 'whatsapp',
      asunto: null,
      mensaje: '✅ ¡Hola {{nombre}}! Tu pedido N° {{pedido_id}} fue confirmado. Te avisaremos cuando esté listo para la entrega.',
      activo: true,
    },
    {
      nombre: 'pedido_listo',
      canal: 'whatsapp',
      asunto: null,
      mensaje: '🍝 ¡Hola {{nombre}}! Tu pedido N° {{pedido_id}} está listo. Coordinamos la entrega para {{fecha_entrega}}.',
      activo: true,
    },
    {
      nombre: 'entrega_recordatorio',
      canal: 'whatsapp',
      asunto: null,
      mensaje: '📦 Recordatorio: tu pedido se entregará hoy {{fecha}} en {{punto_encuentro}} de {{hora_desde}} a {{hora_hasta}}.',
      activo: true,
    },
    {
      nombre: 'entrega_completada',
      canal: 'whatsapp',
      asunto: null,
      mensaje: '🎉 ¡Tu pedido fue entregado! Esperamos que lo disfrutes. Dejanos tu opinión en nuestra web.',
      activo: true,
    },
    {
      nombre: 'stock_bajo',
      canal: 'email',
      asunto: '⚠️ Alerta: Stock bajo en {{producto}}',
      mensaje: 'El producto {{producto}} tiene solo {{stock_actual}} unidades restantes. Stock mínimo: {{stock_minimo}}.',
      activo: true,
    },
    {
      nombre: 'bienvenida',
      canal: 'email',
      asunto: 'Bienvenido a Pastas Orlando',
      mensaje: '¡Hola {{nombre}}! Gracias por registrarte. Tenemos las mejores pastas artesanales para vos.',
      activo: true,
    },
  ];

  for (const plantilla of plantillas) {
    const result = await prisma.plantillaNotificacion.upsert({
      where: { nombre: plantilla.nombre },
      update: {
        canal: plantilla.canal,
        asunto: plantilla.asunto,
        mensaje: plantilla.mensaje,
        activo: plantilla.activo,
      },
      create: plantilla,
    });
    console.log(`  ✅ Plantilla "${result.nombre}" (id: ${result.id})`);
  }

  console.log('');

  // ============================================
  // ALERTAS DE CONFIGURACIÓN
  // ============================================

  const alertas = [
    {
      tipo: 'stock_bajo',
      activo: true,
      umbral: 10,
      frecuencia: 'diario',
      destinatarios: null,
    },
    {
      tipo: 'pedido_pendiente',
      activo: true,
      umbral: null,
      frecuencia: 'diario',
      destinatarios: null,
    },
    {
      tipo: 'entrega_proxima',
      activo: true,
      umbral: null,
      frecuencia: 'inmediato',
      destinatarios: null,
    },
    {
      tipo: 'produccion_atrasada',
      activo: true,
      umbral: null,
      frecuencia: 'diario',
      destinatarios: null,
    },
  ];

  for (const alerta of alertas) {
    const result = await prisma.alertaConfiguracion.upsert({
      where: { tipo: alerta.tipo },
      update: {
        activo: alerta.activo,
        umbral: alerta.umbral,
        frecuencia: alerta.frecuencia,
        destinatarios: alerta.destinatarios,
      },
      create: alerta,
    });
    console.log(`  ✅ Alerta "${result.tipo}" (id: ${result.id})`);
  }

  console.log('\n🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
