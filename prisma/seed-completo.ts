import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed COMPLETO de la base de datos...\n')

  // ============================================
  // 1. PAÍSES
  // ============================================
  const argentina = await prisma.pais.upsert({
    where: { nombre: 'Argentina' },
    update: {},
    create: { nombre: 'Argentina' },
  })
  console.log(`✅ País: ${argentina.nombre} (ID: ${argentina.id})`)

  // ============================================
  // 2. PROVINCIAS (23 + CABA)
  // ============================================
  const provinciasData = [
    'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Ciudad Autónoma de Buenos Aires',
    'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy',
    'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
    'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
    'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
  ]

  const provincias: Record<string, number> = {}
  for (const nombre of provinciasData) {
    const p = await prisma.provincia.upsert({
      where: { id_pais_nombre: { id_pais: argentina.id, nombre } },
      update: {},
      create: { id_pais: argentina.id, nombre },
    })
    provincias[nombre] = p.id
  }
  console.log(`✅ ${provinciasData.length} provincias creadas`)

  // ============================================
  // 3. DEPARTAMENTOS (principales de Corrientes + CABA + GBA)
  // ============================================
  const departamentosData: { nombre: string; provincia: string }[] = [
    // Corrientes
    { nombre: 'Capital', provincia: 'Corrientes' },
    { nombre: 'General Paz', provincia: 'Corrientes' },
    { nombre: 'San Cosme', provincia: 'Corrientes' },
    { nombre: 'Itatí', provincia: 'Corrientes' },
    { nombre: 'Bella Vista', provincia: 'Corrientes' },
    { nombre: 'Empedrado', provincia: 'Corrientes' },
    { nombre: 'Saladas', provincia: 'Corrientes' },
    { nombre: 'Esquina', provincia: 'Corrientes' },
    { nombre: 'Goya', provincia: 'Corrientes' },
    { nombre: 'Lavalle', provincia: 'Corrientes' },
    { nombre: 'Santo Tomé', provincia: 'Corrientes' },
    { nombre: 'Paso de los Libres', provincia: 'Corrientes' },
    { nombre: 'Monte Caseros', provincia: 'Corrientes' },
    { nombre: 'Curuzú Cuatiá', provincia: 'Corrientes' },
    { nombre: 'Mercedes', provincia: 'Corrientes' },
    // CABA
    { nombre: 'Comuna 1', provincia: 'Ciudad Autónoma de Buenos Aires' },
    { nombre: 'Comuna 2', provincia: 'Ciudad Autónoma de Buenos Aires' },
    { nombre: 'Comuna 3', provincia: 'Ciudad Autónoma de Buenos Aires' },
    { nombre: 'Comuna 4', provincia: 'Ciudad Autónoma de Buenos Aires' },
    { nombre: 'Comuna 5', provincia: 'Ciudad Autónoma de Buenos Aires' },
    // Buenos Aires (GBA)
    { nombre: 'General San Martín', provincia: 'Buenos Aires' },
    { nombre: 'La Matanza', provincia: 'Buenos Aires' },
    { nombre: 'Lomas de Zamora', provincia: 'Buenos Aires' },
    { nombre: 'Quilmes', provincia: 'Buenos Aires' },
    { nombre: 'Almirante Brown', provincia: 'Buenos Aires' },
    { nombre: 'Avellaneda', provincia: 'Buenos Aires' },
    { nombre: 'Morón', provincia: 'Buenos Aires' },
    { nombre: 'Tres de Febrero', provincia: 'Buenos Aires' },
    { nombre: 'San Isidro', provincia: 'Buenos Aires' },
    { nombre: 'Vicente López', provincia: 'Buenos Aires' },
    // Córdoba
    { nombre: 'Capital', provincia: 'Córdoba' },
    { nombre: 'Colón', provincia: 'Córdoba' },
    { nombre: 'San Justo', provincia: 'Córdoba' },
    // Santa Fe
    { nombre: 'La Capital', provincia: 'Santa Fe' },
    { nombre: 'Rosario', provincia: 'Santa Fe' },
    // Mendoza
    { nombre: 'Capital', provincia: 'Mendoza' },
    { nombre: 'Godoy Cruz', provincia: 'Mendoza' },
    // Tucumán
    { nombre: 'Capital', provincia: 'Tucumán' },
    { nombre: 'Cruz Alta', provincia: 'Tucumán' },
    // Salta
    { nombre: 'Capital', provincia: 'Salta' },
    // Entre Ríos
    { nombre: 'Paraná', provincia: 'Entre Ríos' },
    { nombre: 'Concordia', provincia: 'Entre Ríos' },
  ]

  const departamentos: Record<string, number> = {}
  for (const depto of departamentosData) {
    const idProv = provincias[depto.provincia]
    if (!idProv) continue
    const d = await prisma.departamento.upsert({
      where: { id_provincia_nombre: { id_provincia: idProv, nombre: depto.nombre } },
      update: {},
      create: { id_provincia: idProv, nombre: depto.nombre },
    })
    departamentos[`${depto.provincia}-${depto.nombre}`] = d.id
  }
  console.log(`✅ ${Object.keys(departamentos).length} departamentos creados`)

  // ============================================
  // 4. MUNICIPIOS (principales de Corrientes Capital + GBA)
  // ============================================
  const municipiosData: { nombre: string; deptoKey: string }[] = [
    // Corrientes Capital
    { nombre: 'Corrientes', deptoKey: 'Corrientes-Capital' },
    { nombre: 'Barrio Esperanza', deptoKey: 'Corrientes-Capital' },
    // General Paz
    { nombre: 'Nuestra Señora del Rosario de Caa Catí', deptoKey: 'Corrientes-General Paz' },
    // San Cosme
    { nombre: 'San Cosme', deptoKey: 'Corrientes-San Cosme' },
    // Itatí
    { nombre: 'Itatí', deptoKey: 'Corrientes-Itatí' },
    // Bella Vista
    { nombre: 'Bella Vista', deptoKey: 'Corrientes-Bella Vista' },
    // Empedrado
    { nombre: 'Pedro Y. Cañete (Empedrado)', deptoKey: 'Corrientes-Empedrado' },
    // Goya
    { nombre: 'Goya', deptoKey: 'Corrientes-Goya' },
    // Esquina
    { nombre: 'Esquina', deptoKey: 'Corrientes-Esquina' },
    // Mercedes
    { nombre: 'Mercedes', deptoKey: 'Corrientes-Mercedes' },
    // Paso de los Libres
    { nombre: 'Paso de los Libres', deptoKey: 'Corrientes-Paso de los Libres' },
    // Monte Caseros
    { nombre: 'Monte Caseros', deptoKey: 'Corrientes-Monte Caseros' },
    // Curuzú Cuatiá
    { nombre: 'Curuzú Cuatiá', deptoKey: 'Corrientes-Curuzú Cuatiá' },
    // Santo Tomé
    { nombre: 'Santo Tomé', deptoKey: 'Corrientes-Santo Tomé' },
    // CABA
    { nombre: 'Retiro', deptoKey: 'Ciudad Autónoma de Buenos Aires-Comuna 1' },
    { nombre: 'San Nicolás', deptoKey: 'Ciudad Autónoma de Buenos Aires-Comuna 1' },
    { nombre: 'Puerto Madero', deptoKey: 'Ciudad Autónoma de Buenos Aires-Comuna 1' },
    { nombre: 'Recoleta', deptoKey: 'Ciudad Autónoma de Buenos Aires-Comuna 2' },
    { nombre: 'Palermo', deptoKey: 'Ciudad Autónoma de Buenos Aires-Comuna 2' },
    { nombre: 'Balvanera', deptoKey: 'Ciudad Autónoma de Buenos Aires-Comuna 3' },
    // GBA
    { nombre: 'San Martín', deptoKey: 'Buenos Aires-General San Martín' },
    { nombre: 'Ramos Mejía', deptoKey: 'Buenos Aires-La Matanza' },
    { nombre: 'Banfield', deptoKey: 'Buenos Aires-Lomas de Zamora' },
    { nombre: 'Quilmes', deptoKey: 'Buenos Aires-Quilmes' },
    { nombre: 'Adrogué', deptoKey: 'Buenos Aires-Almirante Brown' },
    { nombre: 'Avellaneda', deptoKey: 'Buenos Aires-Avellaneda' },
    { nombre: 'Morón', deptoKey: 'Buenos Aires-Morón' },
    { nombre: 'Caseros', deptoKey: 'Buenos Aires-Tres de Febrero' },
    { nombre: 'San Isidro', deptoKey: 'Buenos Aires-San Isidro' },
    { nombre: 'Olivos', deptoKey: 'Buenos Aires-Vicente López' },
    // Córdoba Capital
    { nombre: 'Córdoba', deptoKey: 'Córdoba-Capital' },
    // Santa Fe
    { nombre: 'Santa Fe', deptoKey: 'Santa Fe-La Capital' },
    { nombre: 'Rosario', deptoKey: 'Santa Fe-Rosario' },
    // Mendoza
    { nombre: 'Mendoza', deptoKey: 'Mendoza-Capital' },
    { nombre: 'Godoy Cruz', deptoKey: 'Mendoza-Godoy Cruz' },
    // Tucumán
    { nombre: 'San Miguel de Tucumán', deptoKey: 'Tucumán-Capital' },
    // Salta
    { nombre: 'Salta', deptoKey: 'Salta-Capital' },
    // Entre Ríos
    { nombre: 'Paraná', deptoKey: 'Entre Ríos-Paraná' },
    { nombre: 'Concordia', deptoKey: 'Entre Ríos-Concordia' },
  ]

  const municipios: Record<string, number> = {}
  for (const muni of municipiosData) {
    const idDepto = departamentos[muni.deptoKey]
    if (!idDepto) continue
    const m = await prisma.municipio.upsert({
      where: { id_departamento_nombre: { id_departamento: idDepto, nombre: muni.nombre } },
      update: {},
      create: { id_departamento: idDepto, nombre: muni.nombre },
    })
    municipios[muni.nombre] = m.id
  }
  console.log(`✅ ${Object.keys(municipios).length} municipios creados`)

  // ============================================
  // 5. TIPOS DE DIRECCIÓN
  // ============================================
  const tiposDireccion = ['particular', 'comercial', 'entrega']
  for (const nombre of tiposDireccion) {
    await prisma.tipoDireccion.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    })
  }
  console.log('✅ Tipos de dirección: particular, comercial, entrega')

  // ============================================
  // 6. TIPOS DE CONTACTO
  // ============================================
  const tiposContacto = ['email', 'teléfono', 'WhatsApp']
  for (const nombre of tiposContacto) {
    await prisma.tipoContacto.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    })
  }
  console.log('✅ Tipos de contacto: email, teléfono, WhatsApp')

  // ============================================
  // 7. EMPRESAS TELEFÓNICAS
  // ============================================
  const empresasTelefonicas = [
    { nombre: 'Personal', codigo: 'PER' },
    { nombre: 'Claro', codigo: 'CLA' },
    { nombre: 'Movistar', codigo: 'MOV' },
    { nombre: 'Tuenti', codigo: 'TUE' },
  ]
  for (const et of empresasTelefonicas) {
    await prisma.empresaTelefonica.upsert({
      where: { nombre: et.nombre },
      update: {},
      create: et,
    })
  }
  console.log(`✅ ${empresasTelefonicas.length} empresas telefónicas creadas`)

  // ============================================
  // 8. SERVICIOS DE CORREO ELECTRÓNICO
  // ============================================
  const serviciosCorreo = [
    { nombre: 'Gmail', dominio: 'gmail.com' },
    { nombre: 'Outlook/Hotmail', dominio: 'outlook.com' },
    { nombre: 'Yahoo', dominio: 'yahoo.com' },
    { nombre: 'ICloud', dominio: 'icloud.com' },
  ]
  for (const sc of serviciosCorreo) {
    await prisma.servicioCorreoElectronico.upsert({
      where: { nombre: sc.nombre },
      update: {},
      create: sc,
    })
  }
  console.log(`✅ ${serviciosCorreo.length} servicios de correo electrónico creados`)

  // ============================================
  // 9. TIPOS DE PLATAFORMA
  // ============================================
  const tiposPlataforma = [
    { nombre: 'Web', descripcion: 'Aplicación web' },
    { nombre: 'Android', descripcion: 'Aplicación móvil Android' },
    { nombre: 'iOS', descripcion: 'Aplicación móvil iOS' },
    { nombre: 'API', descripcion: 'Servicio API REST' },
  ]
  for (const tp of tiposPlataforma) {
    await prisma.tipoPlataforma.upsert({
      where: { nombre: tp.nombre },
      update: {},
      create: tp,
    })
  }
  console.log(`✅ ${tiposPlataforma.length} tipos de plataforma creados`)

  // ============================================
  // 10. TIPOS DE ENTIDAD
  // ============================================
  const tiposEntidad = [
    { nombre: 'física', descripcion: 'Persona física' },
    { nombre: 'jurídica', descripcion: 'Persona jurídica / Empresa' },
  ]
  for (const te of tiposEntidad) {
    await prisma.tipoEntidad.upsert({
      where: { nombre: te.nombre },
      update: {},
      create: te,
    })
  }
  console.log(`✅ ${tiposEntidad.length} tipos de entidad creados`)

  // ============================================
  // 11. ESTADOS DE SESIÓN
  // ============================================
  const estadosSesion = [
    { nombre: 'activa', descripcion: 'Sesión activa del usuario' },
    { nombre: 'expirada', descripcion: 'Sesión expirada por inactividad' },
    { nombre: 'cerrada', descripcion: 'Sesión cerrada por el usuario' },
    { nombre: 'revocada', descripcion: 'Sesión revocada por seguridad' },
  ]
  for (const es of estadosSesion) {
    await prisma.estadoSesion.upsert({
      where: { nombre: es.nombre },
      update: {},
      create: es,
    })
  }
  console.log(`✅ ${estadosSesion.length} estados de sesión creados`)

  // ============================================
  // 12. TIPOS DE PERSONA
  // ============================================
  const tiposPersona = ['cliente', 'proveedor', 'empleado']
  for (const tipo of tiposPersona) {
    await prisma.tipoPersona.upsert({
      where: { nombre: tipo },
      update: {},
      create: { nombre: tipo },
    })
  }
  console.log('✅ Tipos de persona: cliente, proveedor, empleado')

  // ============================================
  // 13. CATEGORÍAS DE MATERIAS PRIMAS
  // ============================================
  const categoriasMP = [
    { nombre: 'Harinas', descripcion: 'Harinas de trigo, sémola y otros cereales' },
    { nombre: 'Huevos y derivados', descripcion: 'Huevos frescos, líquidos y derivados' },
    { nombre: 'Lácteos', descripcion: 'Quesos, cremas, manteca y leches' },
    { nombre: 'Aceites y grasas', descripcion: 'Aceites vegetales y grasas' },
    { nombre: 'Condimentos y especias', descripcion: 'Especias, sal, pimienta y hierbas' },
    { nombre: 'Carnes', descripcion: 'Carnes para rellenos (res, cerdo, pollo)' },
    { nombre: 'Verduras', descripcion: 'Verduras frescas para salsas y rellenos' },
    { nombre: 'Salsas y conservas', descripcion: 'Tomates, salsa de tomate, conservas' },
    { nombre: 'Aditivos y suplementos', descripcion: 'Colorantes, conservantes, mejoradores' },
  ]
  for (const cat of categoriasMP) {
    await prisma.categoriaMateriaPrima.upsert({
      where: { nombre: cat.nombre },
      update: {},
      create: cat,
    })
  }
  console.log(`✅ ${categoriasMP.length} categorías de materias primas creadas`)

  // ============================================
  // 14. TIPOS DE INSUMOS
  // ============================================
  const tiposInsumo = [
    { nombre: 'Envases primarios', descripcion: 'Bolsas, bandejas, film para contacto directo' },
    { nombre: 'Envases secundarios', descripcion: 'Cajas, cartones, etiquetas' },
    { nombre: 'Materiales de limpieza', descripcion: 'Productos de limpieza y sanitización' },
    { nombre: 'Combustibles', descripcion: 'Gas, leña, energía para producción' },
    { nombre: 'Utensilios descartables', descripcion: 'Guantes, cofias, delantales descartables' },
    { nombre: 'Insumos de oficina', descripcion: 'Papel, cartuchos, útiles' },
  ]
  for (const ti of tiposInsumo) {
    await prisma.tipoInsumo.upsert({
      where: { nombre: ti.nombre },
      update: {},
      create: ti,
    })
  }
  console.log(`✅ ${tiposInsumo.length} tipos de insumos creados`)

  // ============================================
  // 15. CATEGORÍAS DE PRODUCTOS TERMINADOS
  // ============================================
  const categoriasPT = [
    { nombre: 'Pastas frescas', descripcion: 'Pastas frescas rellenas y al huevo' },
    { nombre: 'Pastas secas', descripcion: 'Pastas secas tipo fideos' },
    { nombre: 'Salsas', descripcion: 'Salsas para acompañar pastas' },
    { nombre: 'Ñoquis', descripcion: 'Ñoquis de papa, espinaca, etc.' },
    { nombre: 'Lasagnas y canelones', descripcion: 'Platos armados listos para hornear' },
    { nombre: 'Postres', descripcion: 'Postres a base de pasta (ñocchi dulce, etc.)' },
  ]
  for (const cat of categoriasPT) {
    await prisma.categoriaProductoTerminado.upsert({
      where: { nombre: cat.nombre },
      update: {},
      create: cat,
    })
  }
  console.log(`✅ ${categoriasPT.length} categorías de productos terminados creadas`)

  // ============================================
  // 16. MARCAS
  // ============================================
  const marcas = [
    { nombre: 'Pastas Orlando', descripcion: 'Marca propia' },
    { nombre: 'Molinos Río de la Plata', descripcion: 'Harinas y cereales' },
    { nombre: 'Arcor', descripcion: 'Alimentos generales' },
    { nombre: 'Mastellone', descripcion: 'Lácteos' },
    { nombre: 'La Serenísima', descripcion: 'Lácteos' },
    { nombre: 'Molto', descripcion: 'Harinas especiales' },
    { nombre: 'Blancaflor', descripcion: 'Harinas' },
    { nombre: 'Canale', descripcion: 'Alimentos' },
    { nombre: 'Fargo', descripcion: 'Alimentos' },
    { nombre: 'Sin marca', descripcion: 'Genérico / sin marca' },
  ]
  for (const marca of marcas) {
    await prisma.marca.upsert({
      where: { nombre: marca.nombre },
      update: {},
      create: marca,
    })
  }
  console.log(`✅ ${marcas.length} marcas creadas`)

  // ============================================
  // 17. UNIDADES DE MEDIDA
  // ============================================
  const unidadesMedida = [
    { codigo: 'kg', nombre: 'Kilogramo', conversion_a_base: 1.0, tipo_medida: 'peso' },
    { codigo: 'g', nombre: 'Gramo', conversion_a_base: 0.001, tipo_medida: 'peso' },
    { codigo: 'mg', nombre: 'Miligramo', conversion_a_base: 0.000001, tipo_medida: 'peso' },
    { codigo: 'l', nombre: 'Litro', conversion_a_base: 1.0, tipo_medida: 'volumen' },
    { codigo: 'ml', nombre: 'Mililitro', conversion_a_base: 0.001, tipo_medida: 'volumen' },
    { codigo: 'cc', nombre: 'Centímetro cúbico', conversion_a_base: 0.001, tipo_medida: 'volumen' },
    { codigo: 'm', nombre: 'Metro', conversion_a_base: 1.0, tipo_medida: 'longitud' },
    { codigo: 'cm', nombre: 'Centímetro', conversion_a_base: 0.01, tipo_medida: 'longitud' },
    { codigo: 'mm', nombre: 'Milímetro', conversion_a_base: 0.001, tipo_medida: 'longitud' },
    { codigo: 'u', nombre: 'Unidad', conversion_a_base: 1.0, tipo_medida: 'unidad' },
    { codigo: 'doc', nombre: 'Docena', conversion_a_base: 12.0, tipo_medida: 'unidad' },
    { codigo: 'rollo', nombre: 'Rollo', conversion_a_base: 1.0, tipo_medida: 'unidad' },
    { codigo: 'paq', nombre: 'Paquete', conversion_a_base: 1.0, tipo_medida: 'unidad' },
    { codigo: 'bolsa', nombre: 'Bolsa', conversion_a_base: 1.0, tipo_medida: 'unidad' },
    { codigo: 'caja', nombre: 'Caja', conversion_a_base: 1.0, tipo_medida: 'unidad' },
  ]
  for (const um of unidadesMedida) {
    await prisma.unidadMedida.upsert({
      where: { codigo: um.codigo },
      update: {},
      create: um,
    })
  }
  console.log(`✅ ${unidadesMedida.length} unidades de medida creadas`)

  // ============================================
  // 18. FORMAS DE PAGO
  // ============================================
  const formasPago = [
    { nombre_forma: 'Efectivo', requiere_identificacion: false, requiere_cuenta: false },
    { nombre_forma: 'Mercado Pago', requiere_identificacion: false, requiere_cuenta: true },
    { nombre_forma: 'Transferencia bancaria', requiere_identificacion: true, requiere_cuenta: true },
    { nombre_forma: 'Débito', requiere_identificacion: true, requiere_cuenta: true },
    { nombre_forma: 'Crédito', requiere_identificacion: true, requiere_cuenta: true },
    { nombre_forma: 'Otros', requiere_identificacion: false, requiere_cuenta: false },
  ]
  for (const fp of formasPago) {
    await prisma.formaPago.upsert({
      where: { nombre_forma: fp.nombre_forma },
      update: {},
      create: fp,
    })
  }
  console.log(`✅ ${formasPago.length} formas de pago creadas`)

  // ============================================
  // 19. ESTADOS GENERALES
  // ============================================
  const estados = [
    { nombre_estado: 'pendiente', entidad_aplicable: 'general', es_final: false },
    { nombre_estado: 'en_proceso', entidad_aplicable: 'general', es_final: false },
    { nombre_estado: 'completado', entidad_aplicable: 'general', es_final: true },
    { nombre_estado: 'cancelado', entidad_aplicable: 'general', es_final: true },
    { nombre_estado: 'entregado', entidad_aplicable: 'pedidos', es_final: true },
    { nombre_estado: 'en_camino', entidad_aplicable: 'entregas', es_final: false },
    { nombre_estado: 'programado', entidad_aplicable: 'entregas', es_final: false },
    { nombre_estado: 'pagado', entidad_aplicable: 'ventas', es_final: true },
    { nombre_estado: 'activo', entidad_aplicable: 'produccion', es_final: false },
    { nombre_estado: 'aprobado', entidad_aplicable: 'presupuestos', es_final: false },
    { nombre_estado: 'rechazado', entidad_aplicable: 'presupuestos', es_final: true },
    { nombre_estado: 'expirado', entidad_aplicable: 'presupuestos', es_final: true },
    { nombre_estado: 'convertido', entidad_aplicable: 'presupuestos', es_final: true },
  ]
  for (const estado of estados) {
    await prisma.estadoGeneral.upsert({
      where: { nombre_estado: estado.nombre_estado },
      update: {},
      create: estado,
    })
  }
  console.log(`✅ ${estados.length} estados generales creados`)

  // ============================================
  // 20. PERSONA ADMIN
  // ============================================
  const personaAdmin = await prisma.persona.upsert({
    where: { numero_documento: '00000000' },
    update: {},
    create: {
      nombre: 'Orlando',
      apellido: 'Candia',
      numero_documento: '00000000',
      tipo_persona: 'empleado',
      observaciones: 'Administrador del sistema',
    },
  })
  console.log(`✅ Persona admin: ${personaAdmin.nombre} ${personaAdmin.apellido} (ID: ${personaAdmin.id})`)

  // ============================================
  // 21. USUARIO ADMIN
  // ============================================
  const hashedPassword = await bcrypt.hash('Pastas2026!', 10)
  const usuarioAdmin = await prisma.usuario.upsert({
    where: { email: 'orlando.candia@gmail.com' },
    update: {},
    create: {
      id_persona: personaAdmin.id,
      email: 'orlando.candia@gmail.com',
      password: hashedPassword,
      estado: true,
    },
  })
  console.log(`✅ Usuario admin: ${usuarioAdmin.email} (ID: ${usuarioAdmin.id})`)

  // Contacto email admin
  const tipoEmail = await prisma.tipoContacto.findUniqueOrThrow({ where: { nombre: 'email' } })
  await prisma.contacto.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id_persona: personaAdmin.id,
      id_tipo_contacto: tipoEmail.id,
      valor: 'orlando.candia@gmail.com',
      es_principal: true,
      verificado: true,
    },
  })
  console.log('✅ Contacto email del admin')

  // ============================================
  // 22. ROLES
  // ============================================
  const roles = [
    { nombre: 'admin', descripcion: 'Administrador total del sistema', es_default: false },
    { nombre: 'produccion', descripcion: 'Acceso a producción y stock', es_default: false },
    { nombre: 'ventas', descripcion: 'Acceso a ventas y pedidos', es_default: false },
    { nombre: 'lectura', descripcion: 'Solo lectura de datos', es_default: true },
  ]
  for (const rol of roles) {
    await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: {},
      create: rol,
    })
  }
  console.log('✅ Roles: admin, produccion, ventas, lectura')

  // Asignar rol admin
  const rolAdmin = await prisma.rol.findUniqueOrThrow({ where: { nombre: 'admin' } })
  await prisma.usuarioRol.upsert({
    where: { id_usuario_id_rol: { id_usuario: usuarioAdmin.id, id_rol: rolAdmin.id } },
    update: {},
    create: { id_usuario: usuarioAdmin.id, id_rol: rolAdmin.id },
  })
  console.log('✅ Rol admin asignado al usuario')

  // ============================================
  // 23. PERMISOS
  // ============================================
  const modulos = [
    'productos', 'compras', 'ventas', 'produccion', 'usuarios',
    'auditoria', 'reportes', 'seguridad', 'logistica', 'presupuestos',
  ]
  const acciones = ['ver', 'crear', 'editar', 'eliminar']

  let permisosCreados = 0
  for (const modulo of modulos) {
    for (const accion of acciones) {
      const nombre = `${modulo}.${accion}`
      await prisma.permiso.upsert({
        where: { nombre },
        update: {},
        create: { nombre, modulo, descripcion: `${accion} en ${modulo}` },
      })
      permisosCreados++
    }
  }
  const extraPermisos = [
    'dashboard.ver', 'configuracion.ver', 'configuracion.editar',
    'opiniones.ver', 'opiniones.editar',
  ]
  for (const nombre of extraPermisos) {
    const modulo = nombre.split('.')[0]
    await prisma.permiso.upsert({
      where: { nombre },
      update: {},
      create: { nombre, modulo, descripcion: nombre },
    })
    permisosCreados++
  }
  console.log(`✅ ${permisosCreados} permisos creados`)

  // Asignar TODOS los permisos al rol admin
  const allPermisos = await prisma.permiso.findMany()
  let asignados = 0
  for (const permiso of allPermisos) {
    await prisma.rolPermiso.upsert({
      where: { id_rol_id_permiso: { id_rol: rolAdmin.id, id_permiso: permiso.id } },
      update: {},
      create: { id_rol: rolAdmin.id, id_permiso: permiso.id },
    })
    asignados++
  }
  console.log(`✅ ${asignados} permisos asignados al rol admin`)

  // Permisos de solo lectura para rol lectura
  const rolLectura = await prisma.rol.findUniqueOrThrow({ where: { nombre: 'lectura' } })
  for (const modulo of modulos) {
    const permiso = await prisma.permiso.findUnique({ where: { nombre: `${modulo}.ver` } })
    if (permiso) {
      await prisma.rolPermiso.upsert({
        where: { id_rol_id_permiso: { id_rol: rolLectura.id, id_permiso: permiso.id } },
        update: {},
        create: { id_rol: rolLectura.id, id_permiso: permiso.id },
      })
    }
  }
  console.log('✅ Permisos de lectura asignados al rol lectura')

  // ============================================
  // 24. PRODUCTOS TERMINADOS (catálogo de pastas)
  // ============================================
  const catFrescas = await prisma.categoriaProductoTerminado.findUniqueOrThrow({ where: { nombre: 'Pastas frescas' } })
  const catSecas = await prisma.categoriaProductoTerminado.findUniqueOrThrow({ where: { nombre: 'Pastas secas' } })
  const catSalsas = await prisma.categoriaProductoTerminado.findUniqueOrThrow({ where: { nombre: 'Salsas' } })
  const catNoquis = await prisma.categoriaProductoTerminado.findUniqueOrThrow({ where: { nombre: 'Ñoquis' } })
  const catLasagnas = await prisma.categoriaProductoTerminado.findUniqueOrThrow({ where: { nombre: 'Lasagnas y canelones' } })

  const productosTerminados = [
    // Pastas frescas
    { codigo: 'PF-001', nombre: 'Sorrentinos de Jamón y Queso', id_categoria: catFrescas.id, peso_unitario_aprox: 0.5, precio_venta: 4500, stock_actual: 0, stock_minimo: 10, destacado: true, orden: 1 },
    { codigo: 'PF-002', nombre: 'Ravioles de Ricota y Espinaca', id_categoria: catFrescas.id, peso_unitario_aprox: 0.5, precio_venta: 4000, stock_actual: 0, stock_minimo: 10, destacado: true, orden: 2 },
    { codigo: 'PF-003', nombre: 'Ravioles de Carne', id_categoria: catFrescas.id, peso_unitario_aprox: 0.5, precio_venta: 4200, stock_actual: 0, stock_minimo: 10, destacado: true, orden: 3 },
    { codigo: 'PF-004', nombre: 'Cappelletti de Pollo', id_categoria: catFrescas.id, peso_unitario_aprox: 0.5, precio_venta: 4600, stock_actual: 0, stock_minimo: 10, destacado: false, orden: 4 },
    { codigo: 'PF-005', nombre: 'Tortellini de Queso', id_categoria: catFrescas.id, peso_unitario_aprox: 0.4, precio_venta: 4300, stock_actual: 0, stock_minimo: 8, destacado: false, orden: 5 },
    { codigo: 'PF-006', nombre: 'Agnolottis de Verdura', id_categoria: catFrescas.id, peso_unitario_aprox: 0.5, precio_venta: 3900, stock_actual: 0, stock_minimo: 8, destacado: false, orden: 6 },
    { codigo: 'PF-007', nombre: 'Fettuccine al Huevo', id_categoria: catFrescas.id, peso_unitario_aprox: 0.4, precio_venta: 3200, stock_actual: 0, stock_minimo: 15, destacado: true, orden: 7 },
    { codigo: 'PF-008', nombre: 'Tagliatelle al Huevo', id_categoria: catFrescas.id, peso_unitario_aprox: 0.4, precio_venta: 3200, stock_actual: 0, stock_minimo: 15, destacado: false, orden: 8 },
    { codigo: 'PF-009', nombre: 'Pappardelle', id_categoria: catFrescas.id, peso_unitario_aprox: 0.4, precio_venta: 3300, stock_actual: 0, stock_minimo: 10, destacado: false, orden: 9 },
    { codigo: 'PF-010', nombre: 'Masa para Empanadas', id_categoria: catFrescas.id, peso_unitario_aprox: 0.5, precio_venta: 2800, stock_actual: 0, stock_minimo: 20, destacado: false, orden: 10 },
    // Pastas secas
    { codigo: 'PS-001', nombre: 'Fideos Spaghetti', id_categoria: catSecas.id, peso_unitario_aprox: 0.5, precio_venta: 2500, stock_actual: 0, stock_minimo: 20, destacado: true, orden: 1 },
    { codigo: 'PS-002', nombre: 'Fideos Penne Rigate', id_categoria: catSecas.id, peso_unitario_aprox: 0.5, precio_venta: 2500, stock_actual: 0, stock_minimo: 20, destacado: false, orden: 2 },
    { codigo: 'PS-003', nombre: 'Fideos Tirabuzón', id_categoria: catSecas.id, peso_unitario_aprox: 0.5, precio_venta: 2500, stock_actual: 0, stock_minimo: 15, destacado: false, orden: 3 },
    { codigo: 'PS-004', nombre: 'Mostacholes', id_categoria: catSecas.id, peso_unitario_aprox: 0.5, precio_venta: 2500, stock_actual: 0, stock_minimo: 15, destacado: false, orden: 4 },
    { codigo: 'PS-005', nombre: 'Cintas', id_categoria: catSecas.id, peso_unitario_aprox: 0.5, precio_venta: 2600, stock_actual: 0, stock_minimo: 10, destacado: false, orden: 5 },
    // Salsas
    { codigo: 'SA-001', nombre: 'Salsa Filetto', id_categoria: catSalsas.id, peso_unitario_aprox: 0.5, precio_venta: 3000, stock_actual: 0, stock_minimo: 10, destacado: true, orden: 1 },
    { codigo: 'SA-002', nombre: 'Salsa Bolognesa', id_categoria: catSalsas.id, peso_unitario_aprox: 0.5, precio_venta: 3500, stock_actual: 0, stock_minimo: 10, destacado: true, orden: 2 },
    { codigo: 'SA-003', nombre: 'Salsa Crema', id_categoria: catSalsas.id, peso_unitario_aprox: 0.5, precio_venta: 3200, stock_actual: 0, stock_minimo: 8, destacado: false, orden: 3 },
    { codigo: 'SA-004', nombre: 'Salsa Pesto', id_categoria: catSalsas.id, peso_unitario_aprox: 0.3, precio_venta: 3800, stock_actual: 0, stock_minimo: 8, destacado: false, orden: 4 },
    // Ñoquis
    { codigo: 'NQ-001', nombre: 'Ñoquis de Papa', id_categoria: catNoquis.id, peso_unitario_aprox: 0.5, precio_venta: 3500, stock_actual: 0, stock_minimo: 15, destacado: true, orden: 1 },
    { codigo: 'NQ-002', nombre: 'Ñoquis de Espinaca', id_categoria: catNoquis.id, peso_unitario_aprox: 0.5, precio_venta: 3700, stock_actual: 0, stock_minimo: 10, destacado: false, orden: 2 },
    { codigo: 'NQ-003', nombre: 'Ñoquis de Calabaza', id_categoria: catNoquis.id, peso_unitario_aprox: 0.5, precio_venta: 3700, stock_actual: 0, stock_minimo: 10, destacado: false, orden: 3 },
    { codigo: 'NQ-004', nombre: 'Ñoquis de Ricota', id_categoria: catNoquis.id, peso_unitario_aprox: 0.5, precio_venta: 3800, stock_actual: 0, stock_minimo: 8, destacado: false, orden: 4 },
    // Lasagnas y canelones
    { codigo: 'LC-001', nombre: 'Lasagna de Carne', id_categoria: catLasagnas.id, peso_unitario_aprox: 1.0, precio_venta: 8000, stock_actual: 0, stock_minimo: 5, destacado: true, orden: 1 },
    { codigo: 'LC-002', nombre: 'Lasagna de Verdura', id_categoria: catLasagnas.id, peso_unitario_aprox: 1.0, precio_venta: 7500, stock_actual: 0, stock_minimo: 5, destacado: false, orden: 2 },
    { codigo: 'LC-003', nombre: 'Canelones de Jamón y Queso', id_categoria: catLasagnas.id, peso_unitario_aprox: 0.8, precio_venta: 6500, stock_actual: 0, stock_minimo: 5, destacado: true, orden: 3 },
    { codigo: 'LC-004', nombre: 'Canelones de Ricota', id_categoria: catLasagnas.id, peso_unitario_aprox: 0.8, precio_venta: 6000, stock_actual: 0, stock_minimo: 5, destacado: false, orden: 4 },
  ]

  for (const pt of productosTerminados) {
    await prisma.productoTerminado.upsert({
      where: { codigo: pt.codigo },
      update: {},
      create: {
        ...pt,
        descripcion: null,
        visible_en_landing: true,
        imagen: null,
        estado: true,
      },
    })
  }
  console.log(`✅ ${productosTerminados.length} productos terminados creados`)

  // ============================================
  // 25. MATERIAS PRIMAS
  // ============================================
  const catHarinas = await prisma.categoriaMateriaPrima.findUniqueOrThrow({ where: { nombre: 'Harinas' } })
  const catHuevos = await prisma.categoriaMateriaPrima.findUniqueOrThrow({ where: { nombre: 'Huevos y derivados' } })
  const catLacteos = await prisma.categoriaMateriaPrima.findUniqueOrThrow({ where: { nombre: 'Lácteos' } })
  const catAceites = await prisma.categoriaMateriaPrima.findUniqueOrThrow({ where: { nombre: 'Aceites y grasas' } })
  const catCondimentos = await prisma.categoriaMateriaPrima.findUniqueOrThrow({ where: { nombre: 'Condimentos y especias' } })
  const catCarnes = await prisma.categoriaMateriaPrima.findUniqueOrThrow({ where: { nombre: 'Carnes' } })
  const catVerduras = await prisma.categoriaMateriaPrima.findUniqueOrThrow({ where: { nombre: 'Verduras' } })
  const catSalsasCon = await prisma.categoriaMateriaPrima.findUniqueOrThrow({ where: { nombre: 'Salsas y conservas' } })
  const catAditivos = await prisma.categoriaMateriaPrima.findUniqueOrThrow({ where: { nombre: 'Aditivos y suplementos' } })

  const umKg = await prisma.unidadMedida.findUniqueOrThrow({ where: { codigo: 'kg' } })
  const umL = await prisma.unidadMedida.findUniqueOrThrow({ where: { codigo: 'l' } })
  const umU = await prisma.unidadMedida.findUniqueOrThrow({ where: { codigo: 'u' } })

  const materiasPrimas = [
    { codigo: 'MP-001', nombre: 'Harina 000', id_categoria: catHarinas.id, id_unidad_base: umKg.id, stock_actual: 50, stock_minimo: 20, precio_compra_referencia: 1200 },
    { codigo: 'MP-002', nombre: 'Harina 0000', id_categoria: catHarinas.id, id_unidad_base: umKg.id, stock_actual: 30, stock_minimo: 15, precio_compra_referencia: 1400 },
    { codigo: 'MP-003', nombre: 'Sémola de trigo', id_categoria: catHarinas.id, id_unidad_base: umKg.id, stock_actual: 20, stock_minimo: 10, precio_compra_referencia: 1600 },
    { codigo: 'MP-004', nombre: 'Huevos frescos', id_categoria: catHuevos.id, id_unidad_base: umU.id, stock_actual: 120, stock_minimo: 60, precio_compra_referencia: 250 },
    { codigo: 'MP-005', nombre: 'Queso Ricota', id_categoria: catLacteos.id, id_unidad_base: umKg.id, stock_actual: 10, stock_minimo: 5, precio_compra_referencia: 5000 },
    { codigo: 'MP-006', nombre: 'Queso Mozzarella', id_categoria: catLacteos.id, id_unidad_base: umKg.id, stock_actual: 8, stock_minimo: 4, precio_compra_referencia: 6000 },
    { codigo: 'MP-007', nombre: 'Queso Parmesano', id_categoria: catLacteos.id, id_unidad_base: umKg.id, stock_actual: 5, stock_minimo: 2, precio_compra_referencia: 12000 },
    { codigo: 'MP-008', nombre: 'Manteca', id_categoria: catLacteos.id, id_unidad_base: umKg.id, stock_actual: 5, stock_minimo: 3, precio_compra_referencia: 8000 },
    { codigo: 'MP-009', nombre: 'Crema de leche', id_categoria: catLacteos.id, id_unidad_base: umL.id, stock_actual: 10, stock_minimo: 5, precio_compra_referencia: 3000 },
    { codigo: 'MP-010', nombre: 'Aceite de girasol', id_categoria: catAceites.id, id_unidad_base: umL.id, stock_actual: 10, stock_minimo: 5, precio_compra_referencia: 2500 },
    { codigo: 'MP-011', nombre: 'Aceite de oliva', id_categoria: catAceites.id, id_unidad_base: umL.id, stock_actual: 3, stock_minimo: 2, precio_compra_referencia: 8000 },
    { codigo: 'MP-012', nombre: 'Sal fina', id_categoria: catCondimentos.id, id_unidad_base: umKg.id, stock_actual: 10, stock_minimo: 5, precio_compra_referencia: 800 },
    { codigo: 'MP-013', nombre: 'Pimienta negra', id_categoria: catCondimentos.id, id_unidad_base: umKg.id, stock_actual: 1, stock_minimo: 0.5, precio_compra_referencia: 15000 },
    { codigo: 'MP-014', nombre: 'Nuez moscada', id_categoria: catCondimentos.id, id_unidad_base: umKg.id, stock_actual: 0.5, stock_minimo: 0.2, precio_compra_referencia: 25000 },
    { codigo: 'MP-015', nombre: 'Carne picada de res', id_categoria: catCarnes.id, id_unidad_base: umKg.id, stock_actual: 15, stock_minimo: 8, precio_compra_referencia: 7000 },
    { codigo: 'MP-016', nombre: 'Jamón cocido', id_categoria: catCarnes.id, id_unidad_base: umKg.id, stock_actual: 8, stock_minimo: 4, precio_compra_referencia: 8000 },
    { codigo: 'MP-017', nombre: 'Pollo desmenuzado', id_categoria: catCarnes.id, id_unidad_base: umKg.id, stock_actual: 5, stock_minimo: 3, precio_compra_referencia: 6500 },
    { codigo: 'MP-018', nombre: 'Espinaca fresca', id_categoria: catVerduras.id, id_unidad_base: umKg.id, stock_actual: 5, stock_minimo: 3, precio_compra_referencia: 3500 },
    { codigo: 'MP-019', nombre: 'Cebolla', id_categoria: catVerduras.id, id_unidad_base: umKg.id, stock_actual: 10, stock_minimo: 5, precio_compra_referencia: 1500 },
    { codigo: 'MP-020', nombre: 'Ajo', id_categoria: catVerduras.id, id_unidad_base: umKg.id, stock_actual: 2, stock_minimo: 1, precio_compra_referencia: 5000 },
    { codigo: 'MP-021', nombre: 'Calabaza', id_categoria: catVerduras.id, id_unidad_base: umKg.id, stock_actual: 8, stock_minimo: 4, precio_compra_referencia: 2000 },
    { codigo: 'MP-022', nombre: 'Papa', id_categoria: catVerduras.id, id_unidad_base: umKg.id, stock_actual: 20, stock_minimo: 10, precio_compra_referencia: 1200 },
    { codigo: 'MP-023', nombre: 'Tomate perita en lata', id_categoria: catSalsasCon.id, id_unidad_base: umKg.id, stock_actual: 15, stock_minimo: 8, precio_compra_referencia: 2500 },
    { codigo: 'MP-024', nombre: 'Puré de tomate', id_categoria: catSalsasCon.id, id_unidad_base: umKg.id, stock_actual: 10, stock_minimo: 5, precio_compra_referencia: 2000 },
    { codigo: 'MP-025', nombre: 'Albahaca fresca', id_categoria: catVerduras.id, id_unidad_base: umKg.id, stock_actual: 1, stock_minimo: 0.5, precio_compra_referencia: 8000 },
    { codigo: 'MP-026', nombre: 'Colorante alimentario', id_categoria: catAditivos.id, id_unidad_base: umKg.id, stock_actual: 0.5, stock_minimo: 0.2, precio_compra_referencia: 12000 },
    { codigo: 'MP-027', nombre: 'Agua', id_categoria: catAditivos.id, id_unidad_base: umL.id, stock_actual: 100, stock_minimo: 50, precio_compra_referencia: 100 },
  ]

  for (const mp of materiasPrimas) {
    await prisma.materiaPrima.upsert({
      where: { codigo: mp.codigo },
      update: {},
      create: { ...mp, descripcion: null, imagen: null, estado: true },
    })
  }
  console.log(`✅ ${materiasPrimas.length} materias primas creadas`)

  // ============================================
  // 26. INSUMOS
  // ============================================
  const tiEnvPrim = await prisma.tipoInsumo.findUniqueOrThrow({ where: { nombre: 'Envases primarios' } })
  const tiEnvSec = await prisma.tipoInsumo.findUniqueOrThrow({ where: { nombre: 'Envases secundarios' } })
  const tiLimpieza = await prisma.tipoInsumo.findUniqueOrThrow({ where: { nombre: 'Materiales de limpieza' } })
  const tiCombust = await prisma.tipoInsumo.findUniqueOrThrow({ where: { nombre: 'Combustibles' } })
  const tiDescart = await prisma.tipoInsumo.findUniqueOrThrow({ where: { nombre: 'Utensilios descartables' } })

  const insumos = [
    { codigo: 'IN-001', nombre: 'Bolsa de polietileno 500g', id_tipo_insumo: tiEnvPrim.id, id_unidad_base: (await prisma.unidadMedida.findUniqueOrThrow({ where: { codigo: 'paq' } })).id, stock_actual: 200, stock_minimo: 100, precio_compra_referencia: 150 },
    { codigo: 'IN-002', nombre: 'Bandeja de poliestireno', id_tipo_insumo: tiEnvPrim.id, id_unidad_base: umU.id, stock_actual: 150, stock_minimo: 80, precio_compra_referencia: 200 },
    { codigo: 'IN-003', nombre: 'Film plástico', id_tipo_insumo: tiEnvPrim.id, id_unidad_base: (await prisma.unidadMedida.findUniqueOrThrow({ where: { codigo: 'rollo' } })).id, stock_actual: 10, stock_minimo: 5, precio_compra_referencia: 3500 },
    { codigo: 'IN-004', nombre: 'Caja de cartón para pastas', id_tipo_insumo: tiEnvSec.id, id_unidad_base: umU.id, stock_actual: 100, stock_minimo: 50, precio_compra_referencia: 500 },
    { codigo: 'IN-005', nombre: 'Etiqueta adhesiva', id_tipo_insumo: tiEnvSec.id, id_unidad_base: umU.id, stock_actual: 500, stock_minimo: 200, precio_compra_referencia: 50 },
    { codigo: 'IN-006', nombre: 'Lavandina', id_tipo_insumo: tiLimpieza.id, id_unidad_base: umL.id, stock_actual: 10, stock_minimo: 5, precio_compra_referencia: 800 },
    { codigo: 'IN-007', nombre: 'Detergente', id_tipo_insumo: tiLimpieza.id, id_unidad_base: umL.id, stock_actual: 5, stock_minimo: 3, precio_compra_referencia: 1500 },
    { codigo: 'IN-008', nombre: 'Desengrasante', id_tipo_insumo: tiLimpieza.id, id_unidad_base: umL.id, stock_actual: 3, stock_minimo: 2, precio_compra_referencia: 2500 },
    { codigo: 'IN-009', nombre: 'Gas envaso', id_tipo_insumo: tiCombust.id, id_unidad_base: umKg.id, stock_actual: 30, stock_minimo: 15, precio_compra_referencia: 3000 },
    { codigo: 'IN-010', nombre: 'Guantes de latex', id_tipo_insumo: tiDescart.id, id_unidad_base: (await prisma.unidadMedida.findUniqueOrThrow({ where: { codigo: 'paq' } })).id, stock_actual: 20, stock_minimo: 10, precio_compra_referencia: 2500 },
    { codigo: 'IN-011', nombre: 'Cofias descartables', id_tipo_insumo: tiDescart.id, id_unidad_base: (await prisma.unidadMedida.findUniqueOrThrow({ where: { codigo: 'paq' } })).id, stock_actual: 15, stock_minimo: 8, precio_compra_referencia: 1800 },
    { codigo: 'IN-012', nombre: 'Delantal descartable', id_tipo_insumo: tiDescart.id, id_unidad_base: umU.id, stock_actual: 50, stock_minimo: 25, precio_compra_referencia: 300 },
  ]

  for (const ins of insumos) {
    await prisma.insumo.upsert({
      where: { codigo: ins.codigo },
      update: {},
      create: { ...ins, descripcion: null, imagen: null, estado: true },
    })
  }
  console.log(`✅ ${insumos.length} insumos creados`)

  // ============================================
  // 27. PRODUCTOS LANDING (catálogo público)
  // ============================================
  const productosLanding = [
    { nombre: 'Sorrentinos de Jamón y Queso', descripcion: 'Clásicos sorrentinos rellenos de jamón cocido y queso mozzarella, hechos con masa al huevo.', categoria: 'Pastas rellenas', precio: 4500, peso: '500g', destacado: true, orden: 1 },
    { nombre: 'Ravioles de Ricota y Espinaca', descripcion: 'Ravioles suaves con relleno de ricota fresca y espinaca, ideal con salsa filetto.', categoria: 'Pastas rellenas', precio: 4000, peso: '500g', destacado: true, orden: 2 },
    { nombre: 'Ravioles de Carne', descripcion: 'Ravioles con relleno de carne especiada, tradición familiar en cada bocado.', categoria: 'Pastas rellenas', precio: 4200, peso: '500g', destacado: true, orden: 3 },
    { nombre: 'Ñoquis de Papa', descripcion: 'Ñoquis suaves y esponjosos, hechos con papas naturales. ¡Tradición del 29!', categoria: 'Ñoquis', precio: 3500, peso: '500g', destacado: true, orden: 4 },
    { nombre: 'Fettuccine al Huevo', descripcion: 'Fettuccine de masa al huevo, ideales para salsas cremosas.', categoria: 'Pastas largas', precio: 3200, peso: '400g', destacado: true, orden: 5 },
    { nombre: 'Spaghetti', descripcion: 'Spaghetti secos de sémola de trigo, cocción perfecta al dente.', categoria: 'Pastas secas', precio: 2500, peso: '500g', destacado: false, orden: 6 },
    { nombre: 'Salsa Filetto', descripcion: 'Salsa de tomates frescos con albahaca, el clásico acompañamiento.', categoria: 'Salsas', precio: 3000, peso: '500g', destacado: true, orden: 7 },
    { nombre: 'Salsa Bolognesa', descripcion: 'Salsa con carne picada, tomate y vegetales, receta casera.', categoria: 'Salsas', precio: 3500, peso: '500g', destacado: false, orden: 8 },
    { nombre: 'Lasagna de Carne', descripcion: 'Lasagna armada con capas de pasta, carne, salsa bechamel y queso.', categoria: 'Platos armados', precio: 8000, peso: '1kg', destacado: true, orden: 9 },
    { nombre: 'Canelones de Jamón y Queso', descripcion: 'Canelones rellenos de jamón y quuego, gratinados con salsa blanca.', categoria: 'Platos armados', precio: 6500, peso: '800g', destacado: false, orden: 10 },
  ]

  for (const prod of productosLanding) {
    await prisma.producto.upsert({
      where: { id: prod.orden },
      update: {},
      create: { ...prod, imagen: null, stock: true },
    })
  }
  console.log(`✅ ${productosLanding.length} productos landing creados`)

  // ============================================
  // 28. PUNTOS DE ENCUENTRO
  // ============================================
  const puntosEncuentro = [
    { nombre: 'Centro - Corrientes', direccion: 'Av. 9 de Julio 1200, Corrientes', latitud: -27.4756, longitud: -58.8314, horarios: '{"lunes_viernes": "8:00-18:00", "sabados": "8:00-13:00"}' },
    { nombre: 'Barrio Esperanza', direccion: 'Av. Sargento Cabral 500, Corrientes', latitud: -27.4600, longitud: -58.8100, horarios: '{"lunes_viernes": "9:00-17:00", "sabados": "9:00-12:00"}' },
    { nombre: 'Plaza Italia', direccion: 'Plaza Italia, Corrientes', latitud: -27.4690, longitud: -58.8350, horarios: '{"sabados": "8:00-12:00"}' },
  ]

  for (const pe of puntosEncuentro) {
    await prisma.puntoEncuentro.upsert({
      where: { id: puntosEncuentro.indexOf(pe) + 1 },
      update: {},
      create: { ...pe, activo: true },
    })
  }
  console.log(`✅ ${puntosEncuentro.length} puntos de encuentro creados`)

  // ============================================
  // VERIFICACIÓN FINAL
  // ============================================
  const tables = [
    'pais', 'provincia', 'departamento', 'municipio',
    'tipoDireccion', 'tipoContacto', 'tipoPersona',
    'empresaTelefonica', 'servicioCorreoElectronico',
    'tipoPlataforma', 'tipoEntidad', 'estadoSesion',
    'categoriaMateriaPrima', 'tipoInsumo', 'categoriaProductoTerminado',
    'marca', 'unidadMedida', 'formaPago', 'estadoGeneral',
    'rol', 'permiso', 'usuario', 'persona',
    'productoTerminado', 'materiaPrima', 'insumo',
    'producto', 'puntoEncuentro',
  ]

  console.log('\n========================================')
  console.log('📋 VERIFICACIÓN FINAL')
  console.log('========================================')
  let allOk = true
  for (const table of tables) {
    try {
      const count = await (prisma as any)[table].count()
      const status = count > 0 ? '✅' : '❌'
      console.log(`${status} ${table}: ${count} registros`)
      if (count === 0) allOk = false
    } catch (e: any) {
      console.log(`❌ ${table}: ERROR - ${e.message.split('\n')[0]}`)
      allOk = false
    }
  }

  // Verify admin login
  const verify = await prisma.usuario.findUnique({
    where: { email: 'orlando.candia@gmail.com' },
    include: { persona: true, roles: { include: { rol: true } } },
  })

  console.log('\n========================================')
  console.log('🔐 CREDENCIALES ADMIN')
  console.log('========================================')
  console.log(`Email:    ${verify!.email}`)
  console.log(`Password: Pastas2026!`)
  console.log(`Estado:   ${verify!.estado ? 'Activo' : 'Inactivo'}`)
  console.log(`Persona:  ${verify!.persona.nombre} ${verify!.persona.apellido}`)
  console.log(`Roles:    ${verify!.roles.map(r => r.rol.nombre).join(', ')}`)
  console.log('========================================\n')

  if (allOk) {
    console.log('🎉 Seed COMPLETO exitoso - Todas las tablas tienen datos!')
  } else {
    console.log('⚠️ Seed completado con advertencias - Algunas tablas están vacías')
  }

  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
