import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Sembrando base de datos...')

  // ============================================
  // DATOS GEOGRÁFICOS
  // ============================================
  console.log('📍 Creando datos geográficos...')

  const argentina = await prisma.pais.create({
    data: { nombre: 'Argentina' },
  })

  const misiones = await prisma.provincia.create({
    data: { nombre: 'Misiones', id_pais: argentina.id },
  })

  // Departamentos de Misiones
  const departamentosData = [
    { nombre: 'Capital' },
    { nombre: 'Candelaria' },
    { nombre: 'San Ignacio' },
    { nombre: 'Oberá' },
    { nombre: 'Leandro N. Alem' },
    { nombre: 'Apóstoles' },
    { nombre: 'San Javier' },
    { nombre: 'Concepción' },
    { nombre: 'Eldorado' },
    { nombre: 'Montecarlo' },
    { nombre: 'Guaraní' },
    { nombre: 'Iguazú' },
    { nombre: 'General Manuel Belgrano' },
    { nombre: 'Cainguás' },
    { nombre: 'Libertador General San Martín' },
    { nombre: 'San Pedro' },
    { nombre: '25 de Mayo' },
    { nombre: 'Adolfo Alsina' },
  ]

  const departamentos = []
  for (const dep of departamentosData) {
    departamentos.push(
      await prisma.departamento.create({
        data: { nombre: dep.nombre, id_provincia: misiones.id },
      })
    )
  }

  // Municipios de Misiones (principales)
  const municipiosData = [
    { nombre: 'Posadas', depIndex: 0 },
    { nombre: 'Garupá', depIndex: 0 },
    { nombre: 'Candelaria', depIndex: 1 },
    { nombre: 'Santa Ana', depIndex: 1 },
    { nombre: 'San Ignacio', depIndex: 2 },
    { nombre: 'Oberá', depIndex: 3 },
    { nombre: 'Campo Viera', depIndex: 3 },
    { nombre: 'Leandro N. Alem', depIndex: 4 },
    { nombre: 'Jardín América', depIndex: 4 },
    { nombre: 'Apóstoles', depIndex: 5 },
    { nombre: 'San Javier', depIndex: 6 },
    { nombre: 'Concepción de la Sierra', depIndex: 7 },
    { nombre: 'Eldorado', depIndex: 8 },
    { nombre: 'Montecarlo', depIndex: 9 },
    { nombre: 'Puerto Rico', depIndex: 9 },
    { nombre: 'Puerto Iguazú', depIndex: 11 },
    { nombre: 'Wanda', depIndex: 11 },
    { nombre: 'Campinas de Misiones', depIndex: 12 },
    { nombre: 'Aristóbulo del Valle', depIndex: 13 },
    { nombre: 'Campo Grande', depIndex: 13 },
    { nombre: 'Puerto Leoni', depIndex: 14 },
    { nombre: 'San Pedro', depIndex: 15 },
    { nombre: 'Almafuerte', depIndex: 15 },
    { nombre: 'Alba Posse', depIndex: 16 },
  ]

  const municipios = []
  for (const mun of municipiosData) {
    municipios.push(
      await prisma.municipio.create({
        data: {
          nombre: mun.nombre,
          id_departamento: departamentos[mun.depIndex].id,
        },
      })
    )
  }

  console.log(`✅ ${municipios.length} municipios creados`)

  // ============================================
  // TIPOS DE PERSONA
  // ============================================
  const tiposPersona = ['cliente', 'proveedor', 'empleado', 'particular', 'otro']
  for (const tipo of tiposPersona) {
    await prisma.tipoPersona.create({ data: { nombre: tipo } })
  }
  console.log('✅ Tipos de persona creados')

  // ============================================
  // TIPOS DE CONTACTO
  // ============================================
  const tiposContacto = ['Teléfono', 'Email', 'WhatsApp', 'Facebook', 'Instagram']
  for (const tipo of tiposContacto) {
    await prisma.tipoContacto.create({ data: { nombre: tipo } })
  }
  console.log('✅ Tipos de contacto creados')

  // ============================================
  // TIPOS DE DIRECCIÓN
  // ============================================
  const tiposDireccion = ['Particular', 'Laboral', 'Comercial']
  for (const tipo of tiposDireccion) {
    await prisma.tipoDireccion.create({ data: { nombre: tipo } })
  }
  console.log('✅ Tipos de dirección creados')

  // ============================================
  // ROLES Y PERMISOS
  // ============================================
  const rolAdmin = await prisma.rol.create({
    data: { nombre: 'Admin', descripcion: 'Administrador con acceso total' },
  })
  const rolEmpleado = await prisma.rol.create({
    data: { nombre: 'Empleado', descripcion: 'Empleado con acceso limitado' },
  })
  const rolCliente = await prisma.rol.create({
    data: { nombre: 'Cliente', descripcion: 'Cliente del negocio' },
  })
  const rolSupervisor = await prisma.rol.create({
    data: { nombre: 'Supervisor', descripcion: 'Supervisor de producción' },
  })

  // Permisos
  const permisosData = [
    { nombre: 'dashboard.ver', descripcion: 'Ver dashboard' },
    { nombre: 'productos.ver', descripcion: 'Ver productos' },
    { nombre: 'productos.crear', descripcion: 'Crear productos' },
    { nombre: 'productos.editar', descripcion: 'Editar productos' },
    { nombre: 'productos.eliminar', descripcion: 'Eliminar productos' },
    { nombre: 'opiniones.ver', descripcion: 'Ver opiniones' },
    { nombre: 'opiniones.moderar', descripcion: 'Moderar opiniones' },
    { nombre: 'estadisticas.ver', descripcion: 'Ver estadísticas' },
    { nombre: 'personas.ver', descripcion: 'Ver personas' },
    { nombre: 'personas.crear', descripcion: 'Crear personas' },
    { nombre: 'personas.editar', descripcion: 'Editar personas' },
    { nombre: 'personas.eliminar', descripcion: 'Eliminar personas' },
    { nombre: 'usuarios.ver', descripcion: 'Ver usuarios' },
    { nombre: 'usuarios.crear', descripcion: 'Crear usuarios' },
    { nombre: 'usuarios.editar', descripcion: 'Editar usuarios' },
    { nombre: 'usuarios.eliminar', descripcion: 'Eliminar usuarios' },
  ]

  const permisos = []
  for (const perm of permisosData) {
    permisos.push(
      await prisma.permiso.create({ data: perm })
    )
  }

  // Asignar todos los permisos a Admin
  for (const permiso of permisos) {
    await prisma.rolPermiso.create({
      data: { id_rol: rolAdmin.id, id_permiso: permiso.id },
    })
  }

  // Asignar permisos a Empleado
  const empleadoPermisos = permisos.filter((p) =>
    ['dashboard.ver', 'productos.ver', 'productos.crear', 'productos.editar', 'opiniones.ver', 'personas.ver', 'personas.crear'].includes(p.nombre)
  )
  for (const permiso of empleadoPermisos) {
    await prisma.rolPermiso.create({
      data: { id_rol: rolEmpleado.id, id_permiso: permiso.id },
    })
  }

  console.log('✅ Roles y permisos creados')

  // ============================================
  // PERSONA + USUARIO ADMIN
  // ============================================
  const posadas = municipios[0] // Posadas es el primer municipio

  const personaAdmin = await prisma.persona.create({
    data: {
      nombre: 'Orlando',
      apellido: 'Candia',
      numero_documento: '37544193',
      tipo_persona: 'empleado',
      id_municipio: posadas.id,
      imagen: null,
    },
  })

  // Crear contacto para la persona admin
  const tipoWhatsApp = await prisma.tipoContacto.findFirst({ where: { nombre: 'WhatsApp' } })
  const tipoEmail = await prisma.tipoContacto.findFirst({ where: { nombre: 'Email' } })
  if (tipoWhatsApp) {
    await prisma.contacto.create({
      data: {
        id_persona: personaAdmin.id,
        id_tipo_contacto: tipoWhatsApp.id,
        valor: '3754419324',
        es_principal: true,
      },
    })
  }
  if (tipoEmail) {
    await prisma.contacto.create({
      data: {
        id_persona: personaAdmin.id,
        id_tipo_contacto: tipoEmail.id,
        valor: 'orlando.candia@gmail.com',
        es_principal: true,
      },
    })
  }

  // Crear dirección para la persona admin
  const tipoParticular = await prisma.tipoDireccion.findFirst({ where: { nombre: 'Particular' } })
  if (tipoParticular) {
    await prisma.direccion.create({
      data: {
        id_persona: personaAdmin.id,
        id_tipo_direccion: tipoParticular.id,
        id_municipio: posadas.id,
        direccion: 'Posadas, Misiones',
        es_principal: true,
      },
    })
  }

  // Crear usuario admin vinculado a la persona
  const hashedPassword = await bcrypt.hash('Pastas2026!', 10)
  const usuarioAdmin = await prisma.usuario.create({
    data: {
      id_persona: personaAdmin.id,
      email: 'orlando.candia@gmail.com',
      password: hashedPassword,
      estado: true,
    },
  })

  // Asignar rol Admin
  await prisma.usuarioRol.create({
    data: { id_usuario: usuarioAdmin.id, id_rol: rolAdmin.id },
  })

  console.log('✅ Admin creado:', usuarioAdmin.email)

  // ============================================
  // PERSONAS DE EJEMPLO
  // ============================================
  const personasEjemplo = [
    {
      nombre: 'María',
      apellido: 'González',
      numero_documento: '28456789',
      tipo_persona: 'cliente',
      id_municipio: posadas.id,
      contactos: [
        { tipo: 'Teléfono', valor: '3754-556677', es_principal: true },
        { tipo: 'Email', valor: 'maria.gonzalez@email.com', es_principal: false },
      ],
    },
    {
      nombre: 'Carlos',
      apellido: 'Martínez',
      numero_documento: '30123456',
      tipo_persona: 'cliente',
      id_municipio: posadas.id,
      contactos: [
        { tipo: 'WhatsApp', valor: '3754-667788', es_principal: true },
      ],
    },
    {
      nombre: 'Lucía',
      apellido: 'Ramírez',
      numero_documento: '32567890',
      tipo_persona: 'proveedor',
      id_municipio: municipios[4]?.id, // Leandro N. Alem
      razon_social: 'Harinas del Litoral',
      cuit: '20-32567890-5',
      condicion_iva: 'responsable_inscripto',
      contactos: [
        { tipo: 'Teléfono', valor: '3754-445566', es_principal: true },
        { tipo: 'Email', valor: 'harinas@litoral.com', es_principal: false },
      ],
    },
    {
      nombre: 'Roberto',
      apellido: 'Fernández',
      numero_documento: '26789012',
      tipo_persona: 'empleado',
      id_municipio: posadas.id,
      contactos: [
        { tipo: 'WhatsApp', valor: '3754-778899', es_principal: true },
      ],
    },
    {
      nombre: 'Ana',
      apellido: 'Torres',
      numero_documento: '34890123',
      tipo_persona: 'cliente',
      id_municipio: municipios[5]?.id, // Oberá
      contactos: [
        { tipo: 'Teléfono', valor: '3755-334455', es_principal: true },
        { tipo: 'Instagram', valor: '@ana.torres', es_principal: false },
      ],
    },
  ]

  for (const personaData of personasEjemplo) {
    const { contactos, ...datosPersona } = personaData
    const persona = await prisma.persona.create({ data: datosPersona })

    for (const contactoData of contactos) {
      const tipoContacto = await prisma.tipoContacto.findFirst({
        where: { nombre: contactoData.tipo },
      })
      if (tipoContacto) {
        await prisma.contacto.create({
          data: {
            id_persona: persona.id,
            id_tipo_contacto: tipoContacto.id,
            valor: contactoData.valor,
            es_principal: contactoData.es_principal,
          },
        })
      }
    }
  }

  console.log(`✅ ${personasEjemplo.length} personas de ejemplo creadas`)

  // ============================================
  // PRODUCTOS INICIALES
  // ============================================
  const productos = [
    { nombre: 'Sorrentinos de Jamón y Queso', descripcion: 'Clásicos sorrentinos rellenos de jamón cocido y queso mozzarella, elaborados artesanalmente.', categoria: 'Rellenos', precio: 3500, peso: '500g', imagen: '/images/productos/sorrentinos.jpg', stock: true, destacado: true, orden: 1 },
    { nombre: 'Ravioles de Ricota y Nuez', descripcion: 'Delicados ravioles con relleno cremoso de ricota y nuez, tradición italiana pura.', categoria: 'Rellenos', precio: 3200, peso: '500g', imagen: '/images/productos/ravioles.jpg', stock: true, destacado: true, orden: 2 },
    { nombre: 'Fettuccine al Huevo', descripcion: 'Fettuccine de masa al huevo, ideales para acompañar con cualquier salsa.', categoria: 'Secos', precio: 2500, peso: '500g', imagen: '/images/productos/fettuccine.jpg', stock: true, destacado: true, orden: 3 },
    { nombre: 'Ñoquis de Papa', descripcion: 'Ñoquis de papa suaves y esponjosos, hechos con papas frescas de la zona.', categoria: 'Ñoquis', precio: 2800, peso: '500g', imagen: '/images/productos/noquis.jpg', stock: true, destacado: true, orden: 4 },
    { nombre: 'Canelones de Carne', descripcion: 'Canelones rellenos de carne picada con especias, listos para gratinar.', categoria: 'Rellenos', precio: 3500, peso: '500g', imagen: '/images/productos/canelones.jpg', stock: true, destacado: false, orden: 5 },
    { nombre: 'Tallarines al Huevo', descripcion: 'Tallarines clásicos de masa al huevo, cortados a cuchillo como manda la tradición.', categoria: 'Secos', precio: 2300, peso: '500g', imagen: '/images/productos/tallarines.jpg', stock: true, destacado: false, orden: 6 },
    { nombre: 'Ravioles de Verdura', descripcion: 'Ravioles rellenos de espinaca y acelga fresca con queso, sabor casero.', categoria: 'Rellenos', precio: 3000, peso: '500g', imagen: '/images/productos/ravioles-verdura.jpg', stock: true, destacado: false, orden: 7 },
    { nombre: 'Capeletis de Pollo', descripcion: 'Capeletis con relleno de pollo desmenuzado y queso crema, suaves y sabrosos.', categoria: 'Rellenos', precio: 3300, peso: '500g', imagen: '/images/productos/capeletis.jpg', stock: true, destacado: false, orden: 8 },
    { nombre: 'Sorrentinos de Calabaza', descripcion: 'Sorrentinos rellenos de puré de calabaza con queso y nuez, un clásico regional.', categoria: 'Rellenos', precio: 3400, peso: '500g', imagen: '/images/productos/sorrentinos-calabaza.jpg', stock: true, destacado: true, orden: 9 },
    { nombre: 'Ñoquis de Semolín', descripcion: 'Ñoquis de semolín al huevo, con textura firme ideales para salsas gruesas.', categoria: 'Ñoquis', precio: 2600, peso: '500g', imagen: '/images/productos/noquis-semolin.jpg', stock: true, destacado: false, orden: 10 },
    { nombre: 'Lasagna de Carne', descripcion: 'Láminas de pasta intercaladas con carne y salsa bechamel, lista para hornear.', categoria: 'Especiales', precio: 4000, peso: '500g', imagen: '/images/productos/lasagna.jpg', stock: true, destacado: true, orden: 11 },
    { nombre: 'Agnolottis de Cerdo', descripcion: 'Agnolottis rellenos de carne de cerdo condimentada, tradición del norte italiano.', categoria: 'Rellenos', precio: 3600, peso: '500g', imagen: '/images/productos/agnolottis.jpg', stock: true, destacado: false, orden: 12 },
  ]
  for (const producto of productos) {
    await prisma.producto.create({ data: producto })
  }
  console.log(`✅ ${productos.length} productos creados`)

  // ============================================
  // OPINIONES DE EJEMPLO
  // ============================================
  const opiniones = [
    { nombre: 'María González', calificacion: 5, comentario: 'Las mejores pastas de Posadas, sin duda. Los sorrentinos son increíbles, se nota que están hechos con amor.', estado: 'approved', destacado: true, orden: 1, fecha_aprobacion: new Date() },
    { nombre: 'Carlos Martínez', calificacion: 5, comentario: 'Increíble la frescura de los ravioles. Se nota la materia prima de calidad. Muy recomendable.', estado: 'approved', destacado: true, orden: 2, fecha_aprobacion: new Date() },
    { nombre: 'Lucía Ramírez', calificacion: 4, comentario: 'Los ñoquis de papa son espectaculares, bien esponjosos como los de mi abuela.', estado: 'approved', destacado: false, orden: 3, fecha_aprobacion: new Date() },
    { nombre: 'Roberto Fernández', calificacion: 5, comentario: 'Probé la lasagna y fue una experiencia increíble. La pasta casera no tiene comparación.', estado: 'approved', destacado: true, orden: 4, fecha_aprobacion: new Date() },
    { nombre: 'Ana Torres', calificacion: 4, comentario: 'Las fettuccine quedan perfectas con cualquier salsa. Se nota que usan huevos de verdad.', estado: 'approved', destacado: false, orden: 5, fecha_aprobacion: new Date() },
    { nombre: 'Pedro Sánchez', calificacion: 5, comentario: 'Pedí para un evento familiar y todos quedaron encantados. Los sorrentinos de calabaza son una bomba.', estado: 'approved', destacado: false, orden: 6, fecha_aprobacion: new Date() },
  ]
  for (const opinion of opiniones) {
    await prisma.opinion.create({ data: opinion })
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
