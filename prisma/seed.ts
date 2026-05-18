import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Sembrando base de datos...')

  // Crear usuario admin
  const hashedPassword = await bcrypt.hash('Pastas2026!', 10)
  const admin = await prisma.usuario.upsert({
    where: { email: 'orlando.candia@gmail.com' },
    update: {},
    create: {
      email: 'orlando.candia@gmail.com',
      password: hashedPassword,
      nombre: 'Orlando Candia',
      rol: 'admin',
      activo: true,
    },
  })
  console.log('✅ Admin creado:', admin.email)

  // Crear productos iniciales
  const productos = [
    {
      nombre: 'Sorrentinos de Jamón y Queso',
      descripcion: 'Clásicos sorrentinos rellenos de jamón cocido y queso mozzarella, elaborados artesanalmente.',
      categoria: 'Rellenos',
      precio: 3500,
      peso: '500g',
      imagen: '/images/productos/sorrentinos.jpg',
      stock: true,
      destacado: true,
      orden: 1,
    },
    {
      nombre: 'Ravioles de Ricota y Nuez',
      descripcion: 'Delicados ravioles con relleno cremoso de ricota y nuez, tradición italiana pura.',
      categoria: 'Rellenos',
      precio: 3200,
      peso: '500g',
      imagen: '/images/productos/ravioles.jpg',
      stock: true,
      destacado: true,
      orden: 2,
    },
    {
      nombre: 'Fettuccine al Huevo',
      descripcion: 'Fettuccine de masa al huevo, ideales para acompañar con cualquier salsa.',
      categoria: 'Secos',
      precio: 2500,
      peso: '500g',
      imagen: '/images/productos/fettuccine.jpg',
      stock: true,
      destacado: true,
      orden: 3,
    },
    {
      nombre: 'Ñoquis de Papa',
      descripcion: 'Ñoquis de papa suaves y esponjosos, hechos con papas frescas de la zona.',
      categoria: 'Ñoquis',
      precio: 2800,
      peso: '500g',
      imagen: '/images/productos/noquis.jpg',
      stock: true,
      destacado: true,
      orden: 4,
    },
    {
      nombre: 'Canelones de Carne',
      descripcion: 'Canelones rellenos de carne picada con especias, listos para gratinar.',
      categoria: 'Rellenos',
      precio: 3500,
      peso: '500g',
      imagen: '/images/productos/canelones.jpg',
      stock: true,
      destacado: false,
      orden: 5,
    },
    {
      nombre: 'Tallarines al Huevo',
      descripcion: 'Tallarines clásicos de masa al huevo, cortados a cuchillo como manda la tradición.',
      categoria: 'Secos',
      precio: 2300,
      peso: '500g',
      imagen: '/images/productos/tallarines.jpg',
      stock: true,
      destacado: false,
      orden: 6,
    },
    {
      nombre: 'Ravioles de Verdura',
      descripcion: 'Ravioles rellenos de espinaca y acelga fresca con queso, sabor casero.',
      categoria: 'Rellenos',
      precio: 3000,
      peso: '500g',
      imagen: '/images/productos/ravioles-verdura.jpg',
      stock: true,
      destacado: false,
      orden: 7,
    },
    {
      nombre: 'Capeletis de Pollo',
      descripcion: 'Capeletis con relleno de pollo desmenuzado y queso crema, suaves y sabrosos.',
      categoria: 'Rellenos',
      precio: 3300,
      peso: '500g',
      imagen: '/images/productos/capeletis.jpg',
      stock: true,
      destacado: false,
      orden: 8,
    },
    {
      nombre: 'Sorrentinos de Calabaza',
      descripcion: 'Sorrentinos rellenos de puré de calabaza con queso y nuez, un clásico regional.',
      categoria: 'Rellenos',
      precio: 3400,
      peso: '500g',
      imagen: '/images/productos/sorrentinos-calabaza.jpg',
      stock: true,
      destacado: true,
      orden: 9,
    },
    {
      nombre: 'Ñoquis de Semolín',
      descripcion: 'Ñoquis de semolín al huevo, con textura firme ideales para salsas gruesas.',
      categoria: 'Ñoquis',
      precio: 2600,
      peso: '500g',
      imagen: '/images/productos/noquis-semolin.jpg',
      stock: true,
      destacado: false,
      orden: 10,
    },
    {
      nombre: 'Lasagna de Carne',
      descripcion: 'Láminas de pasta intercaladas con carne y salsa bechamel, lista para hornear.',
      categoria: 'Especiales',
      precio: 4000,
      peso: '500g',
      imagen: '/images/productos/lasagna.jpg',
      stock: true,
      destacado: true,
      orden: 11,
    },
    {
      nombre: 'Agnolottis de Cerdo',
      descripcion: 'Agnolottis rellenos de carne de cerdo condimentada, tradición del norte italiano.',
      categoria: 'Rellenos',
      precio: 3600,
      peso: '500g',
      imagen: '/images/productos/agnolottis.jpg',
      stock: true,
      destacado: false,
      orden: 12,
    },
  ]

  for (const producto of productos) {
    await prisma.producto.create({ data: producto })
  }
  console.log(`✅ ${productos.length} productos creados`)

  // Crear opiniones de ejemplo
  const opiniones = [
    {
      nombre: 'María González',
      calificacion: 5,
      comentario: 'Las mejores pastas de Posadas, sin duda. Los sorrentinos son increíbles, se nota que están hechos con amor. Ya pedimos varias veces y siempre la misma calidad.',
      estado: 'approved',
      destacado: true,
      orden: 1,
    },
    {
      nombre: 'Carlos Martínez',
      calificacion: 5,
      comentario: 'Increíble la frescura de los ravioles. Se nota la materia prima de calidad. Muy recomendable, el envío fue puntual y todo llegó perfecto.',
      estado: 'approved',
      destacado: true,
      orden: 2,
    },
    {
      nombre: 'Lucía Ramírez',
      calificacion: 4,
      comentario: 'Los ñoquis de papa son espectaculares, bien esponjosos como los de mi abuela. Vuelvo siempre, el servicio es excelente.',
      estado: 'approved',
      destacado: false,
      orden: 3,
    },
    {
      nombre: 'Roberto Fernández',
      calificacion: 5,
      comentario: 'Probé la lasagna y fue una experiencia increíble. La pasta casera no tiene comparación. Orlando sabe lo que hace.',
      estado: 'approved',
      destacado: true,
      orden: 4,
    },
    {
      nombre: 'Ana Torres',
      calificacion: 4,
      comentario: 'Las fettuccine quedan perfectas con cualquier salsa. Se nota que usan huevos de verdad. Muy buena atención por WhatsApp.',
      estado: 'approved',
      destacado: false,
      orden: 5,
    },
    {
      nombre: 'Pedro Sánchez',
      calificacion: 5,
      comentario: 'Pedí para un evento familiar y todos quedaron encantados. Los sorrentinos de calabaza son una bomba. 100% recomendado.',
      estado: 'approved',
      destacado: false,
      orden: 6,
    },
  ]

  for (const opinion of opiniones) {
    await prisma.opinion.create({
      data: {
        ...opinion,
        fecha_aprobacion: new Date(),
      },
    })
  }
  console.log(`✅ ${opiniones.length} opiniones creadas`)

  console.log('🎉 Base de datos sembrada exitosamente')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
