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

  // ============================================
  // UNIDADES DE MEDIDA (FASE 3)
  // ============================================
  console.log('📐 Creando unidades de medida...')

  const unidadesData = [
    { codigo: 'g', nombre: 'Gramo', conversion_a_base: 1, tipo_medida: 'peso' },
    { codigo: 'kg', nombre: 'Kilogramo', conversion_a_base: 1000, tipo_medida: 'peso' },
    { codigo: 'unidad', nombre: 'Unidad', conversion_a_base: 1, tipo_medida: 'unidad' },
    { codigo: 'L', nombre: 'Litro', conversion_a_base: 1, tipo_medida: 'volumen' },
    { codigo: 'mL', nombre: 'Mililitro', conversion_a_base: 0.001, tipo_medida: 'volumen' },
    { codigo: 'cm', nombre: 'Centímetro', conversion_a_base: 1, tipo_medida: 'longitud' },
    { codigo: 'm', nombre: 'Metro', conversion_a_base: 100, tipo_medida: 'longitud' },
  ]

  const unidades = []
  for (const ud of unidadesData) {
    unidades.push(
      await prisma.unidadMedida.create({ data: ud })
    )
  }
  console.log(`✅ ${unidades.length} unidades de medida creadas`)

  // ============================================
  // CATEGORÍAS DE MATERIAS PRIMAS (FASE 3)
  // ============================================
  console.log('📂 Creando categorías de materias primas...')

  const categoriasMPData = [
    { nombre: 'Harinas', descripcion: 'Harinas de trigo, semolín y otras' },
    { nombre: 'Huevos', descripcion: 'Huevos frescos y derivados' },
    { nombre: 'Carnes', descripcion: 'Carnes para rellenos' },
    { nombre: 'Quesos', descripcion: 'Quesos para rellenos y salsas' },
    { nombre: 'Verduras', descripcion: 'Verduras frescas para rellenos y salsas' },
    { nombre: 'Aceites y Grasas', descripcion: 'Aceites, manteca y grasas' },
    { nombre: 'Especias y Condimentos', descripcion: 'Especias, hierbas y condimentos' },
    { nombre: 'Lácteos', descripcion: 'Leche, crema y otros lácteos' },
  ]

  const categoriasMP = []
  for (const cat of categoriasMPData) {
    categoriasMP.push(
      await prisma.categoriaMateriaPrima.create({ data: cat })
    )
  }
  console.log(`✅ ${categoriasMP.length} categorías de materias primas creadas`)

  // ============================================
  // TIPOS DE INSUMOS (FASE 3)
  // ============================================
  console.log('📦 Creando tipos de insumos...')

  const tiposInsumoData = [
    { nombre: 'Envases', descripcion: 'Envases para productos terminados' },
    { nombre: 'Bandejas', descripcion: 'Bandejas de poliestireno y cartón' },
    { nombre: 'Bolsas', descripcion: 'Bolsas de polietileno y papel' },
    { nombre: 'Etiquetas', descripcion: 'Etiquetas y rótulos para productos' },
    { nombre: 'Films', descripcion: 'Films de PVC y retráctil' },
    { nombre: 'Limpieza', descripcion: 'Productos de limpieza e higiene' },
    { nombre: 'Utensilios', descripcion: 'Utensilios y herramientas de trabajo' },
  ]

  const tiposInsumo = []
  for (const ti of tiposInsumoData) {
    tiposInsumo.push(
      await prisma.tipoInsumo.create({ data: ti })
    )
  }
  console.log(`✅ ${tiposInsumo.length} tipos de insumos creados`)

  // ============================================
  // MARCAS (FASE 3)
  // ============================================
  console.log('🏷️ Creando marcas...')

  const marcasData = [
    { nombre: 'Lario', descripcion: 'Harinas Lario' },
    { nombre: 'Cocinero', descripcion: 'Harinas Cocinero' },
    { nombre: 'Cañuelas', descripcion: 'Harinas Cañuelas' },
    { nombre: 'Molinos Río de la Plata', descripcion: 'Molinos Río de la Plata' },
    { nombre: 'La Serenísima', descripcion: 'Lácteos La Serenísima' },
    { nombre: 'Sancor', descripcion: 'Lácteos Sancor' },
    { nombre: ' generics', descripcion: 'Marcas genéricas' },
  ]

  for (const marca of marcasData) {
    await prisma.marca.create({ data: marca })
  }
  console.log(`✅ ${marcasData.length} marcas creadas`)

  // ============================================
  // CATEGORÍAS DE PRODUCTOS TERMINADOS (FASE 3)
  // ============================================
  console.log('🍝 Creando categorías de productos terminados...')

  const categoriasPTData = [
    { nombre: 'Pastas Secas', descripcion: 'Pastas sin relleno (fettuccine, tallarines, etc.)' },
    { nombre: 'Pastas Rellenas', descripcion: 'Sorrentinos, ravioles, capeletis, agnolottis' },
    { nombre: 'Ñoquis', descripcion: 'Ñoquis de papa, semolín, etc.' },
    { nombre: 'Tapas', descripcion: 'Tapas para empanadas y tartas' },
    { nombre: 'Empanadas', descripcion: 'Empanadas de diferentes gustos' },
    { nombre: 'Especiales', descripcion: 'Lasagna, canelones y preparaciones especiales' },
    { nombre: 'Salsas', descripcion: 'Salsas caseras para acompañar' },
  ]

  const categoriasPT = []
  for (const cat of categoriasPTData) {
    categoriasPT.push(
      await prisma.categoriaProductoTerminado.create({ data: cat })
    )
  }
  console.log(`✅ ${categoriasPT.length} categorías de productos terminados creadas`)

  // ============================================
  // MATERIAS PRIMAS DE EJEMPLO (FASE 3)
  // ============================================
  console.log('🥬 Creando materias primas de ejemplo...')

  const unidadGramo = unidades.find(u => u.codigo === 'g')!
  const unidadKilo = unidades.find(u => u.codigo === 'kg')!
  const unidadLitro = unidades.find(u => u.codigo === 'L')!
  const unidadUnidad = unidades.find(u => u.codigo === 'unidad')!

  const materiasPrimasData = [
    { codigo: 'MP-001', nombre: 'Harina 000', descripcion: 'Harina de trigo tipo 000', id_categoria: categoriasMP[0].id, id_unidad_base: unidadKilo.id, stock_actual: 50, stock_minimo: 10, precio_compra_referencia: 1200, estado: true },
    { codigo: 'MP-002', nombre: 'Harina 0000', descripcion: 'Harina de trigo tipo 0000', id_categoria: categoriasMP[0].id, id_unidad_base: unidadKilo.id, stock_actual: 30, stock_minimo: 8, precio_compra_referencia: 1400, estado: true },
    { codigo: 'MP-003', nombre: 'Semolín', descripcion: 'Semolín de trigo duro', id_categoria: categoriasMP[0].id, id_unidad_base: unidadKilo.id, stock_actual: 20, stock_minimo: 5, precio_compra_referencia: 1800, estado: true },
    { codigo: 'MP-004', nombre: 'Huevos Frescos', descripcion: 'Huevos de gallina frescos', id_categoria: categoriasMP[1].id, id_unidad_base: unidadUnidad.id, stock_actual: 200, stock_minimo: 60, precio_compra_referencia: 150, estado: true },
    { codigo: 'MP-005', nombre: 'Carne Picada Especial', descripcion: 'Carne picada especial para rellenos', id_categoria: categoriasMP[2].id, id_unidad_base: unidadKilo.id, stock_actual: 15, stock_minimo: 5, precio_compra_referencia: 5500, estado: true },
    { codigo: 'MP-006', nombre: 'Jamón Cocido', descripcion: 'Jamón cocido fiambre', id_categoria: categoriasMP[2].id, id_unidad_base: unidadKilo.id, stock_actual: 8, stock_minimo: 3, precio_compra_referencia: 6200, estado: true },
    { codigo: 'MP-007', nombre: 'Queso Mozzarella', descripcion: 'Queso mozzarella para rellenos', id_categoria: categoriasMP[3].id, id_unidad_base: unidadKilo.id, stock_actual: 10, stock_minimo: 3, precio_compra_referencia: 5800, estado: true },
    { codigo: 'MP-008', nombre: 'Queso Ricota', descripcion: 'Ricota fresca', id_categoria: categoriasMP[3].id, id_unidad_base: unidadKilo.id, stock_actual: 8, stock_minimo: 2, precio_compra_referencia: 3500, estado: true },
    { codigo: 'MP-009', nombre: 'Espinaca', descripcion: 'Espinaca fresca', id_categoria: categoriasMP[4].id, id_unidad_base: unidadKilo.id, stock_actual: 5, stock_minimo: 2, precio_compra_referencia: 2800, estado: true },
    { codigo: 'MP-010', nombre: 'Calabaza', descripcion: 'Calabaza fresca', id_categoria: categoriasMP[4].id, id_unidad_base: unidadKilo.id, stock_actual: 8, stock_minimo: 3, precio_compra_referencia: 1200, estado: true },
    { codigo: 'MP-011', nombre: 'Aceite de Girasol', descripcion: 'Aceite de girasol', id_categoria: categoriasMP[5].id, id_unidad_base: unidadLitro.id, stock_actual: 10, stock_minimo: 3, precio_compra_referencia: 1500, estado: true },
    { codigo: 'MP-012', nombre: 'Papa', descripcion: 'Papa fresca para ñoquis', id_categoria: categoriasMP[4].id, id_unidad_base: unidadKilo.id, stock_actual: 20, stock_minimo: 5, precio_compra_referencia: 900, estado: true },
  ]

  for (const mp of materiasPrimasData) {
    await prisma.materiaPrima.create({ data: mp })
  }
  console.log(`✅ ${materiasPrimasData.length} materias primas de ejemplo creadas`)

  // ============================================
  // INSUMOS DE EJEMPLO (FASE 3)
  // ============================================
  console.log('📦 Creando insumos de ejemplo...')

  const insumosData = [
    { codigo: 'INS-001', nombre: 'Bandeja PS 500g', descripcion: 'Bandeja de poliestireno para 500g', id_tipo_insumo: tiposInsumo[1].id, id_unidad_base: unidadUnidad.id, stock_actual: 200, stock_minimo: 50, precio_compra_referencia: 120, estado: true },
    { codigo: 'INS-002', nombre: 'Bolsa Polietileno', descripcion: 'Bolsa de polietileno para pastas', id_tipo_insumo: tiposInsumo[2].id, id_unidad_base: unidadUnidad.id, stock_actual: 500, stock_minimo: 100, precio_compra_referencia: 50, estado: true },
    { codigo: 'INS-003', nombre: 'Film PVC', descripcion: 'Film de PVC para envasar', id_tipo_insumo: tiposInsumo[4].id, id_unidad_base: unidadUnidad.id, stock_actual: 10, stock_minimo: 3, precio_compra_referencia: 800, estado: true },
    { codigo: 'INS-004', nombre: 'Etiqueta Producto', descripcion: 'Etiqueta adhesiva para productos', id_tipo_insumo: tiposInsumo[3].id, id_unidad_base: unidadUnidad.id, stock_actual: 1000, stock_minimo: 200, precio_compra_referencia: 30, estado: true },
    { codigo: 'INS-005', nombre: 'Lavandina', descripcion: 'Lavandina para desinfección', id_tipo_insumo: tiposInsumo[5].id, id_unidad_base: unidadLitro.id, stock_actual: 5, stock_minimo: 2, precio_compra_referencia: 600, estado: true },
  ]

  for (const ins of insumosData) {
    await prisma.insumo.create({ data: ins })
  }
  console.log(`✅ ${insumosData.length} insumos de ejemplo creados`)

  // ============================================
  // PRODUCTOS TERMINADOS DE EJEMPLO (FASE 3)
  // ============================================
  console.log('🍝 Creando productos terminados de ejemplo...')

  const productosTerminadosData = [
    { codigo: 'PT-001', nombre: 'Sorrentinos Jamón y Queso', descripcion: 'Sorrentinos rellenos de jamón y queso mozzarella', id_categoria: categoriasPT[1].id, peso_unitario_aprox: 0.5, precio_venta: 3500, stock_actual: 25, stock_minimo: 5, destacado: true, orden: 1, visible_en_landing: true, estado: true },
    { codigo: 'PT-002', nombre: 'Ravioles Ricota y Nuez', descripcion: 'Ravioles con relleno de ricota y nuez', id_categoria: categoriasPT[1].id, peso_unitario_aprox: 0.5, precio_venta: 3200, stock_actual: 20, stock_minimo: 5, destacado: true, orden: 2, visible_en_landing: true, estado: true },
    { codigo: 'PT-003', nombre: 'Fettuccine al Huevo', descripcion: 'Fettuccine de masa al huevo', id_categoria: categoriasPT[0].id, peso_unitario_aprox: 0.5, precio_venta: 2500, stock_actual: 30, stock_minimo: 8, destacado: true, orden: 3, visible_en_landing: true, estado: true },
    { codigo: 'PT-004', nombre: 'Ñoquis de Papa', descripcion: 'Ñoquis de papa caseros', id_categoria: categoriasPT[2].id, peso_unitario_aprox: 0.5, precio_venta: 2800, stock_actual: 18, stock_minimo: 5, destacado: true, orden: 4, visible_en_landing: true, estado: true },
    { codigo: 'PT-005', nombre: 'Sorrentinos de Calabaza', descripcion: 'Sorrentinos rellenos de calabaza y queso', id_categoria: categoriasPT[1].id, peso_unitario_aprox: 0.5, precio_venta: 3400, stock_actual: 15, stock_minimo: 5, destacado: true, orden: 5, visible_en_landing: true, estado: true },
    { codigo: 'PT-006', nombre: 'Tallarines al Huevo', descripcion: 'Tallarines clásicos de masa al huevo', id_categoria: categoriasPT[0].id, peso_unitario_aprox: 0.5, precio_venta: 2300, stock_actual: 0, stock_minimo: 8, destacado: false, orden: 6, visible_en_landing: true, estado: true },
    { codigo: 'PT-007', nombre: 'Canelones de Carne', descripcion: 'Canelones rellenos de carne', id_categoria: categoriasPT[6].id, peso_unitario_aprox: 0.5, precio_venta: 3500, stock_actual: 10, stock_minimo: 3, destacado: false, orden: 7, visible_en_landing: true, estado: true },
    { codigo: 'PT-008', nombre: 'Lasagna de Carne', descripcion: 'Lasagna con carne y bechamel', id_categoria: categoriasPT[6].id, peso_unitario_aprox: 0.5, precio_venta: 4000, stock_actual: 8, stock_minimo: 3, destacado: true, orden: 8, visible_en_landing: true, estado: true },
    { codigo: 'PT-009', nombre: 'Ravioles de Verdura', descripcion: 'Ravioles de espinaca y queso', id_categoria: categoriasPT[1].id, peso_unitario_aprox: 0.5, precio_venta: 3000, stock_actual: 12, stock_minimo: 4, destacado: false, orden: 9, visible_en_landing: true, estado: true },
    { codigo: 'PT-010', nombre: 'Tapas para Empanadas', descripcion: 'Tapas de masa para empanadas', id_categoria: categoriasPT[3].id, peso_unitario_aprox: 0.06, precio_venta: 800, stock_actual: 50, stock_minimo: 10, destacado: false, orden: 10, visible_en_landing: false, estado: true },
  ]

  for (const pt of productosTerminadosData) {
    await prisma.productoTerminado.create({ data: pt })
  }
  console.log(`✅ ${productosTerminadosData.length} productos terminados de ejemplo creados`)

  // ============================================
  // PERMISOS ADICIONALES FASE 3
  // ============================================
  const permisosFase3 = [
    { nombre: 'materias-primas.ver', descripcion: 'Ver materias primas' },
    { nombre: 'materias-primas.crear', descripcion: 'Crear materias primas' },
    { nombre: 'materias-primas.editar', descripcion: 'Editar materias primas' },
    { nombre: 'materias-primas.eliminar', descripcion: 'Eliminar materias primas' },
    { nombre: 'insumos.ver', descripcion: 'Ver insumos' },
    { nombre: 'insumos.crear', descripcion: 'Crear insumos' },
    { nombre: 'insumos.editar', descripcion: 'Editar insumos' },
    { nombre: 'insumos.eliminar', descripcion: 'Eliminar insumos' },
    { nombre: 'productos-terminados.ver', descripcion: 'Ver productos terminados' },
    { nombre: 'productos-terminados.crear', descripcion: 'Crear productos terminados' },
    { nombre: 'productos-terminados.editar', descripcion: 'Editar productos terminados' },
    { nombre: 'productos-terminados.eliminar', descripcion: 'Eliminar productos terminados' },
  ]

  for (const perm of permisosFase3) {
    const created = await prisma.permiso.create({ data: perm })
    // Assign to Admin
    await prisma.rolPermiso.create({
      data: { id_rol: rolAdmin.id, id_permiso: created.id },
    })
  }
  console.log(`✅ ${permisosFase3.length} permisos de Fase 3 creados y asignados a Admin`)

  // ============================================
  // FORMAS DE PAGO (FASE 4)
  // ============================================
  console.log('💳 Creando formas de pago...')

  const formasPagoData = [
    { nombre_forma: 'Efectivo', requiere_identificacion: false, requiere_cuenta: false },
    { nombre_forma: 'Débito', requiere_identificacion: false, requiere_cuenta: false },
    { nombre_forma: 'Crédito', requiere_identificacion: false, requiere_cuenta: false },
    { nombre_forma: 'Mercado Pago', requiere_identificacion: false, requiere_cuenta: false },
    { nombre_forma: 'Transferencia', requiere_identificacion: false, requiere_cuenta: false },
  ]

  for (const fp of formasPagoData) {
    await prisma.formaPago.create({ data: fp })
  }
  console.log(`✅ ${formasPagoData.length} formas de pago creadas`)

  // ============================================
  // ESTADOS GENERALES (FASE 4)
  // ============================================
  console.log('📋 Creando estados generales...')

  const estadosGeneralesData = [
    { nombre_estado: 'pendiente', entidad_aplicable: 'compra,pedido,pedido_cliente,venta,reserva', es_final: false },
    { nombre_estado: 'confirmado', entidad_aplicable: 'pedido,pedido_cliente,reserva', es_final: false },
    { nombre_estado: 'en_proceso', entidad_aplicable: 'compra,pedido_cliente', es_final: false },
    { nombre_estado: 'en_produccion', entidad_aplicable: 'pedido_cliente', es_final: false },
    { nombre_estado: 'listo_para_entregar', entidad_aplicable: 'pedido_cliente', es_final: false },
    { nombre_estado: 'completado', entidad_aplicable: 'compra,pedido,pedido_cliente,venta', es_final: true },
    { nombre_estado: 'recibido', entidad_aplicable: 'compra', es_final: true },
    { nombre_estado: 'entregado', entidad_aplicable: 'pedido_cliente,venta', es_final: true },
    { nombre_estado: 'anulado', entidad_aplicable: 'compra,pedido,pedido_cliente,venta,reserva', es_final: true },
    { nombre_estado: 'expirado', entidad_aplicable: 'reserva', es_final: true },
    { nombre_estado: 'cancelado', entidad_aplicable: 'pedido_cliente,reserva', es_final: true },
  ]

  for (const eg of estadosGeneralesData) {
    await prisma.estadoGeneral.create({ data: eg })
  }
  console.log(`✅ ${estadosGeneralesData.length} estados generales creados`)

  // ============================================
  // PERMISOS ADICIONALES FASE 4
  // ============================================
  const permisosFase4 = [
    { nombre: 'compras.ver', descripcion: 'Ver compras' },
    { nombre: 'compras.crear', descripcion: 'Crear compras' },
    { nombre: 'compras.editar', descripcion: 'Editar compras' },
    { nombre: 'compras.eliminar', descripcion: 'Eliminar compras' },
    { nombre: 'pedidos-proveedores.ver', descripcion: 'Ver pedidos a proveedores' },
    { nombre: 'pedidos-proveedores.crear', descripcion: 'Crear pedidos a proveedores' },
    { nombre: 'pedidos-proveedores.editar', descripcion: 'Editar pedidos a proveedores' },
    { nombre: 'stock.ver', descripcion: 'Ver movimientos de stock' },
    { nombre: 'configuracion.ver', descripcion: 'Ver configuración' },
    { nombre: 'configuracion.editar', descripcion: 'Editar configuración' },
  ]

  for (const perm of permisosFase4) {
    const created = await prisma.permiso.create({ data: perm })
    await prisma.rolPermiso.create({
      data: { id_rol: rolAdmin.id, id_permiso: created.id },
    })
  }
  console.log(`✅ ${permisosFase4.length} permisos de Fase 4 creados y asignados a Admin`)

  // ============================================
  // PERMISOS ADICIONALES FASE 5
  // ============================================
  const permisosFase5 = [
    { nombre: 'ventas.ver', descripcion: 'Ver ventas' },
    { nombre: 'ventas.crear', descripcion: 'Crear ventas' },
    { nombre: 'ventas.editar', descripcion: 'Editar ventas' },
    { nombre: 'ventas.eliminar', descripcion: 'Eliminar ventas' },
    { nombre: 'pedidos-clientes.ver', descripcion: 'Ver pedidos de clientes' },
    { nombre: 'pedidos-clientes.crear', descripcion: 'Crear pedidos de clientes' },
    { nombre: 'pedidos-clientes.editar', descripcion: 'Editar pedidos de clientes' },
    { nombre: 'reservas.ver', descripcion: 'Ver reservas' },
    { nombre: 'reservas.crear', descripcion: 'Crear reservas' },
    { nombre: 'reservas.editar', descripcion: 'Editar reservas' },
  ]

  for (const perm of permisosFase5) {
    const created = await prisma.permiso.create({ data: perm })
    await prisma.rolPermiso.create({
      data: { id_rol: rolAdmin.id, id_permiso: created.id },
    })
  }
  console.log(`✅ ${permisosFase5.length} permisos de Fase 5 creados y asignados a Admin`)

  // ============================================
  // ESTADOS PARA PRODUCCIÓN (FASE 6)
  // ============================================
  console.log('🏭 Creando estados para producción...')

  const estadosProduccion = [
    { nombre_estado: 'planificado', entidad_aplicable: 'produccion', es_final: false },
    { nombre_estado: 'en_curso', entidad_aplicable: 'produccion', es_final: false },
    { nombre_estado: 'completado', entidad_aplicable: 'produccion', es_final: true },
  ]
  // "cancelado" ya existe de fases anteriores

  for (const ep of estadosProduccion) {
    await prisma.estadoGeneral.create({ data: ep })
  }
  console.log(`✅ ${estadosProduccion.length} estados de producción creados`)

  // Actualizar "cancelado" para incluir "produccion"
  const estadoCancelado = await prisma.estadoGeneral.findFirst({
    where: { nombre_estado: 'cancelado' },
  })
  if (estadoCancelado) {
    const nuevasEntidades = estadoCancelado.entidad_aplicable
      ? estadoCancelado.entidad_aplicable + ',produccion'
      : 'produccion'
    await prisma.estadoGeneral.update({
      where: { id: estadoCancelado.id },
      data: { entidad_aplicable: nuevasEntidades },
    })
  }

  // ============================================
  // PERMISOS ADICIONALES FASE 6
  // ============================================
  const permisosFase6 = [
    { nombre: 'recetas.ver', descripcion: 'Ver recetas' },
    { nombre: 'recetas.crear', descripcion: 'Crear recetas' },
    { nombre: 'recetas.editar', descripcion: 'Editar recetas' },
    { nombre: 'produccion.ver', descripcion: 'Ver producción' },
    { nombre: 'produccion.crear', descripcion: 'Crear producción' },
    { nombre: 'produccion.editar', descripcion: 'Editar producción' },
  ]

  for (const perm of permisosFase6) {
    const created = await prisma.permiso.create({ data: perm })
    await prisma.rolPermiso.create({
      data: { id_rol: rolAdmin.id, id_permiso: created.id },
    })
  }
  console.log(`✅ ${permisosFase6.length} permisos de Fase 6 creados y asignados a Admin`)

  // ============================================
  // PERMISOS ADICIONALES FASE 7
  // ============================================
  const permisosFase7 = [
    { nombre: 'productos-terminados.public', descripcion: 'Ver productos terminados público (landing)' },
  ]

  for (const perm of permisosFase7) {
    const created = await prisma.permiso.create({ data: perm })
    await prisma.rolPermiso.create({
      data: { id_rol: rolAdmin.id, id_permiso: created.id },
    })
  }
  console.log(`✅ ${permisosFase7.length} permisos de Fase 7 creados y asignados a Admin`)

  // ============================================
  // PERMISOS ADICIONALES FASE 8
  // ============================================
  const permisosFase8 = [
    { nombre: 'auditoria.ver', descripcion: 'Ver auditoría del sistema' },
    { nombre: 'reportes.ver', descripcion: 'Ver reportes del sistema' },
    { nombre: 'reportes.exportar', descripcion: 'Exportar reportes a Excel/PDF/CSV' },
  ]

  for (const perm of permisosFase8) {
    const created = await prisma.permiso.create({ data: perm })
    await prisma.rolPermiso.create({
      data: { id_rol: rolAdmin.id, id_permiso: created.id },
    })
  }
  console.log(`✅ ${permisosFase8.length} permisos de Fase 8 creados y asignados a Admin`)

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
