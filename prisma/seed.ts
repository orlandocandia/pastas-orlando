import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n')

  // ============================================
  // 1. TIPOS DE PERSONA
  // ============================================
  const tiposPersona = [
    { nombre: 'cliente' },
    { nombre: 'proveedor' },
    { nombre: 'empleado' },
  ]

  for (const tipo of tiposPersona) {
    await prisma.tipoPersona.upsert({
      where: { nombre: tipo.nombre },
      update: {},
      create: tipo,
    })
  }
  console.log('✅ Tipos de persona: cliente, proveedor, empleado')

  // ============================================
  // 2. TIPOS DE CONTACTO
  // ============================================
  const tiposContacto = [
    { nombre: 'email' },
    { nombre: 'teléfono' },
    { nombre: 'WhatsApp' },
  ]

  for (const tipo of tiposContacto) {
    await prisma.tipoContacto.upsert({
      where: { nombre: tipo.nombre },
      update: {},
      create: tipo,
    })
  }
  console.log('✅ Tipos de contacto: email, teléfono, WhatsApp')

  // ============================================
  // 3. TIPOS DE DIRECCIÓN
  // ============================================
  const tiposDireccion = [
    { nombre: 'particular' },
    { nombre: 'comercial' },
    { nombre: 'entrega' },
  ]

  for (const tipo of tiposDireccion) {
    await prisma.tipoDireccion.upsert({
      where: { nombre: tipo.nombre },
      update: {},
      create: tipo,
    })
  }
  console.log('✅ Tipos de dirección: particular, comercial, entrega')

  // ============================================
  // 4. PERSONA ADMIN
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
  // 5. USUARIO ADMIN
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

  // Contacto email
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
  // 6. ROLES
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

  // Asignar rol admin al usuario
  const rolAdmin = await prisma.rol.findUniqueOrThrow({ where: { nombre: 'admin' } })
  await prisma.usuarioRol.upsert({
    where: { id_usuario_id_rol: { id_usuario: usuarioAdmin.id, id_rol: rolAdmin.id } },
    update: {},
    create: { id_usuario: usuarioAdmin.id, id_rol: rolAdmin.id },
  })
  console.log('✅ Rol admin asignado al usuario')

  // ============================================
  // 7. PERMISOS
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

  // Permisos extra
  const extraPermisos = [
    'dashboard.ver',
    'configuracion.ver',
    'configuracion.editar',
    'opiniones.ver',
    'opiniones.editar',
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
  // 8. ESTADOS GENERALES
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
  // 9. FORMAS DE PAGO
  // ============================================
  const formasPago = [
    { nombre_forma: 'Efectivo', requiere_identificacion: false, requiere_cuenta: false },
    { nombre_forma: 'Mercado Pago', requiere_identificacion: false, requiere_cuenta: true },
    { nombre_forma: 'Transferencia bancaria', requiere_identificacion: true, requiere_cuenta: true },
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
  // 10. CATEGORÍAS DE PRODUCTOS TERMINADOS
  // ============================================
  const categoriasPT = [
    { nombre: 'Sorrentinos', descripcion: 'Sorrentinos rellenos de jamón, queso, pollo y más' },
    { nombre: 'Ñoquis', descripcion: 'Ñoquis de papa, calabaza, espinaca y más' },
    { nombre: 'Tallarines', descripcion: 'Tallarines al huevo, al morrón, a la espinaca y más' },
    { nombre: 'Ravioles', descripcion: 'Ravioles de ricotta, carne, jamón y más' },
    { nombre: 'Tapas', descripcion: 'Tapas para empanadas, pascualinas y pastelitos' },
    { nombre: 'Empanadas', descripcion: 'Empanadas crudas y al horno, variedad de rellenos' },
    { nombre: 'Tartas', descripcion: 'Tartas de verduras, jamón, pollo y choclo' },
  ]

  // Eliminar productos existentes y categorías viejas
  await prisma.productoTerminado.deleteMany({})
  await prisma.categoriaProductoTerminado.deleteMany({})
  console.log('🗑️ Productos y categorías anteriores eliminados')

  const catMap: Record<string, number> = {}
  for (const cat of categoriasPT) {
    const created = await prisma.categoriaProductoTerminado.create({ data: cat })
    catMap[cat.nombre] = created.id
  }
  console.log(`✅ ${categoriasPT.length} categorías de productos terminados creadas`)

  // ============================================
  // 11. PRODUCTOS TERMINADOS (catálogo real)
  // ============================================
  const productosData = [
    // SORRENTINOS
    { codigo: 'SOR-001', nombre: 'Sorrentinos de Jamón y Queso', descripcion: 'Rellenos de jamón cocido y queso muzzarella', id_categoria: catMap['Sorrentinos'], tipo_harina: 'con_gluten', precio_venta: 4800, stock_actual: 28, destacado: true, orden: 1 },
    { codigo: 'SOR-002', nombre: 'Sorrentinos de Pollo y Roquefort', descripcion: 'Rellenos de pollo desmenuzado y queso roquefort', id_categoria: catMap['Sorrentinos'], tipo_harina: 'con_gluten', precio_venta: 5000, stock_actual: 20, destacado: false, orden: 2 },
    { codigo: 'SOR-003', nombre: 'Sorrentinos de Calabaza y Queso', descripcion: 'Rellenos de calabaza asada y queso crema', id_categoria: catMap['Sorrentinos'], tipo_harina: 'con_gluten', precio_venta: 4600, stock_actual: 22, destacado: false, orden: 3 },
    { codigo: 'SOR-004', nombre: 'Sorrentinos de Caprese', descripcion: 'Rellenos de tomate, mozzarella y albahaca', id_categoria: catMap['Sorrentinos'], tipo_harina: 'con_gluten', precio_venta: 4700, stock_actual: 15, destacado: false, orden: 4 },
    { codigo: 'SOR-005', nombre: 'Sorrentinos de Ricotta y Nueces', descripcion: 'Rellenos de ricotta fresca con nueces', id_categoria: catMap['Sorrentinos'], tipo_harina: 'con_gluten', precio_venta: 4500, stock_actual: 18, destacado: false, orden: 5 },
    { codigo: 'SOR-006', nombre: 'Sorrentinos sin Gluten', descripcion: 'Sorrentinos de jamón y queso con masa sin gluten', id_categoria: catMap['Sorrentinos'], tipo_harina: 'sin_gluten', precio_venta: 5500, stock_actual: 10, destacado: true, orden: 6 },

    // ÑOQUIS
    { codigo: 'NQ-001', nombre: 'Ñoquis de Papa', descripcion: 'Ñoquis de papa clásicos, suaves y esponjosos', id_categoria: catMap['Ñoquis'], tipo_harina: 'con_gluten', precio_venta: 3800, stock_actual: 40, destacado: true, orden: 10 },
    { codigo: 'NQ-002', nombre: 'Ñoquis de Calabaza', descripcion: 'Ñoquis de calabaza con un toque de nuez moscada', id_categoria: catMap['Ñoquis'], tipo_harina: 'con_gluten', precio_venta: 4000, stock_actual: 25, destacado: false, orden: 11 },
    { codigo: 'NQ-003', nombre: 'Ñoquis de Espinaca', descripcion: 'Ñoquis verdes de espinaca fresca, livianos y nutritivos', id_categoria: catMap['Ñoquis'], tipo_harina: 'con_gluten', precio_venta: 4000, stock_actual: 20, destacado: false, orden: 12 },
    { codigo: 'NQ-004', nombre: 'Ñoquis de Ricotta', descripcion: 'Ñoquis de ricotta suaves y cremosos', id_categoria: catMap['Ñoquis'], tipo_harina: 'con_gluten', precio_venta: 4200, stock_actual: 18, destacado: false, orden: 13 },
    { codigo: 'NQ-005', nombre: 'Ñoquis de Remolacha', descripcion: 'Ñoquis coloridos de remolacha con sabor suave', id_categoria: catMap['Ñoquis'], tipo_harina: 'con_gluten', precio_venta: 4100, stock_actual: 12, destacado: false, orden: 14 },
    { codigo: 'NQ-006', nombre: 'Ñoquis Integrales', descripcion: 'Ñoquis elaborados con harina integral', id_categoria: catMap['Ñoquis'], tipo_harina: 'integral', precio_venta: 4300, stock_actual: 15, destacado: false, orden: 15 },
    { codigo: 'NQ-007', nombre: 'Ñoquis sin Gluten', descripcion: 'Ñoquis de papa sin gluten', id_categoria: catMap['Ñoquis'], tipo_harina: 'sin_gluten', precio_venta: 4600, stock_actual: 8, destacado: false, orden: 16 },

    // TALLARINES
    { codigo: 'TAL-001', nombre: 'Tallarines al Huevo', descripcion: 'Tallarines frescos al huevo, clásicos y versátiles', id_categoria: catMap['Tallarines'], tipo_harina: 'con_gluten', precio_venta: 3500, stock_actual: 50, destacado: true, orden: 20 },
    { codigo: 'TAL-002', nombre: 'Tallarines al Morrón', descripcion: 'Tallarines rojos al morrón asado', id_categoria: catMap['Tallarines'], tipo_harina: 'con_gluten', precio_venta: 3700, stock_actual: 35, destacado: false, orden: 21 },
    { codigo: 'TAL-003', nombre: 'Tallarines a la Espinaca', descripcion: 'Tallarines verdes a la espinaca fresca', id_categoria: catMap['Tallarines'], tipo_harina: 'con_gluten', precio_venta: 3700, stock_actual: 30, destacado: false, orden: 22 },
    { codigo: 'TAL-004', nombre: 'Tallarines al Puerro', descripcion: 'Tallarines aromatizados con puerro', id_categoria: catMap['Tallarines'], tipo_harina: 'con_gluten', precio_venta: 3800, stock_actual: 20, destacado: false, orden: 23 },
    { codigo: 'TAL-005', nombre: 'Tallarines Integrales', descripcion: 'Tallarines elaborados con harina integral', id_categoria: catMap['Tallarines'], tipo_harina: 'integral', precio_venta: 4000, stock_actual: 18, destacado: false, orden: 24 },
    { codigo: 'TAL-006', nombre: 'Tallarines sin Gluten', descripcion: 'Tallarines de arroz sin gluten', id_categoria: catMap['Tallarines'], tipo_harina: 'sin_gluten', precio_venta: 4500, stock_actual: 12, destacado: false, orden: 25 },

    // RAVIOLES
    { codigo: 'RAV-001', nombre: 'Ravioles de Ricotta y Espinaca', descripcion: 'Ravioles artesanales rellenos de ricotta y espinaca fresca', id_categoria: catMap['Ravioles'], tipo_harina: 'con_gluten', precio_venta: 4500, stock_actual: 35, destacado: true, orden: 30 },
    { codigo: 'RAV-002', nombre: 'Ravioles de Carne', descripcion: 'Ravioles rellenos de carne condimentada con especias', id_categoria: catMap['Ravioles'], tipo_harina: 'con_gluten', precio_venta: 4500, stock_actual: 30, destacado: false, orden: 31 },
    { codigo: 'RAV-003', nombre: 'Ravioles de Jamón y Queso', descripcion: 'Ravioles rellenos de jamón cocido y queso', id_categoria: catMap['Ravioles'], tipo_harina: 'con_gluten', precio_venta: 4400, stock_actual: 25, destacado: false, orden: 32 },
    { codigo: 'RAV-004', nombre: 'Ravioles de Pollo', descripcion: 'Ravioles rellenos de pollo desmenuzado con hierbas', id_categoria: catMap['Ravioles'], tipo_harina: 'con_gluten', precio_venta: 4600, stock_actual: 0, destacado: false, orden: 33 },
    { codigo: 'RAV-005', nombre: 'Ravioles de Verdura', descripcion: 'Ravioles rellenos de acelga, espinaca y queso', id_categoria: catMap['Ravioles'], tipo_harina: 'con_gluten', precio_venta: 4300, stock_actual: 22, destacado: false, orden: 34 },
    { codigo: 'RAV-006', nombre: 'Ravioles sin Gluten', descripcion: 'Ravioles de ricotta y espinaca con masa sin gluten', id_categoria: catMap['Ravioles'], tipo_harina: 'sin_gluten', precio_venta: 5200, stock_actual: 8, destacado: false, orden: 35 },

    // TAPAS
    { codigo: 'TAP-001', nombre: 'Tapas para Empanadas', descripcion: 'Tapas de masa casera para empanadas al horno o fritas', id_categoria: catMap['Tapas'], tipo_harina: 'con_gluten', precio_venta: 2800, stock_actual: 60, destacado: true, orden: 40 },
    { codigo: 'TAP-002', nombre: 'Tapas para Pascualinas', descripcion: 'Tapas finas para tarta pascualina', id_categoria: catMap['Tapas'], tipo_harina: 'con_gluten', precio_venta: 2600, stock_actual: 45, destacado: false, orden: 41 },
    { codigo: 'TAP-003', nombre: 'Tapas para Pastelitos', descripcion: 'Tapas crujientes para pastelitos de membrillo o batata', id_categoria: catMap['Tapas'], tipo_harina: 'con_gluten', precio_venta: 2500, stock_actual: 35, destacado: false, orden: 42 },
    { codigo: 'TAP-004', nombre: 'Tapas para Tartas', descripcion: 'Tapas para tarta dulce o salada', id_categoria: catMap['Tapas'], tipo_harina: 'con_gluten', precio_venta: 2700, stock_actual: 40, destacado: false, orden: 43 },
    { codigo: 'TAP-005', nombre: 'Tapas Integrales', descripcion: 'Tapas integrales para empanadas y tartas', id_categoria: catMap['Tapas'], tipo_harina: 'integral', precio_venta: 3200, stock_actual: 20, destacado: false, orden: 44 },
    { codigo: 'TAP-006', nombre: 'Tapas sin Gluten', descripcion: 'Tapas sin gluten para empanadas y tartas', id_categoria: catMap['Tapas'], tipo_harina: 'sin_gluten', precio_venta: 3500, stock_actual: 10, destacado: false, orden: 45 },

    // EMPANADAS
    { codigo: 'EMP-001', nombre: 'Empanadas de Carne', descripcion: 'Empanadas de carne cortada a cuchillo con cebolla y especias', id_categoria: catMap['Empanadas'], tipo_harina: 'con_gluten', precio_venta: 1500, stock_actual: 80, destacado: true, orden: 50, peso_unitario_aprox: 0.15 },
    { codigo: 'EMP-002', nombre: 'Empanadas de Pollo', descripcion: 'Empanadas de pollo con puerro y queso', id_categoria: catMap['Empanadas'], tipo_harina: 'con_gluten', precio_venta: 1400, stock_actual: 60, destacado: false, orden: 51, peso_unitario_aprox: 0.15 },
    { codigo: 'EMP-003', nombre: 'Empanadas de Jamón y Queso', descripcion: 'Empanadas de jamón cocido y queso muzzarella', id_categoria: catMap['Empanadas'], tipo_harina: 'con_gluten', precio_venta: 1400, stock_actual: 50, destacado: false, orden: 52, peso_unitario_aprox: 0.15 },
    { codigo: 'EMP-004', nombre: 'Empanadas de Verdura', descripcion: 'Empanadas de acelga y queso', id_categoria: catMap['Empanadas'], tipo_harina: 'con_gluten', precio_venta: 1300, stock_actual: 45, destacado: false, orden: 53, peso_unitario_aprox: 0.15 },
    { codigo: 'EMP-005', nombre: 'Empanadas de Caprese', descripcion: 'Empanadas de tomate cherry, mozzarella y albahaca', id_categoria: catMap['Empanadas'], tipo_harina: 'con_gluten', precio_venta: 1500, stock_actual: 30, destacado: false, orden: 54, peso_unitario_aprox: 0.15 },
    { codigo: 'EMP-006', nombre: 'Empanadas de Humita', descripcion: 'Empanadas de choclo y salsa blanca', id_categoria: catMap['Empanadas'], tipo_harina: 'con_gluten', precio_venta: 1400, stock_actual: 35, destacado: false, orden: 55, peso_unitario_aprox: 0.15 },
    { codigo: 'EMP-007', nombre: 'Empanadas Arabes', descripcion: 'Empanadas árabes de carne con limón y especias', id_categoria: catMap['Empanadas'], tipo_harina: 'con_gluten', precio_venta: 1600, stock_actual: 25, destacado: false, orden: 56, peso_unitario_aprox: 0.15 },
    { codigo: 'EMP-008', nombre: 'Empanadas sin Gluten', descripcion: 'Empanadas de carne con masa sin gluten', id_categoria: catMap['Empanadas'], tipo_harina: 'sin_gluten', precio_venta: 1800, stock_actual: 12, destacado: false, orden: 57, peso_unitario_aprox: 0.15 },

    // TARTAS
    { codigo: 'TRT-001', nombre: 'Tarta de Jamón y Queso', descripcion: 'Tarta de jamón cocido y queso gratinado', id_categoria: catMap['Tartas'], tipo_harina: 'con_gluten', precio_venta: 5500, stock_actual: 15, destacado: true, orden: 60 },
    { codigo: 'TRT-002', nombre: 'Tarta de Pollo', descripcion: 'Tarta de pollo con verduras y salsa blanca', id_categoria: catMap['Tartas'], tipo_harina: 'con_gluten', precio_venta: 5200, stock_actual: 12, destacado: false, orden: 61 },
    { codigo: 'TRT-003', nombre: 'Tarta de Verdura', descripcion: 'Tarta de acelga y espinaca con queso', id_categoria: catMap['Tartas'], tipo_harina: 'con_gluten', precio_venta: 4800, stock_actual: 18, destacado: false, orden: 62 },
    { codigo: 'TRT-004', nombre: 'Tarta de Choclo', descripcion: 'Tarta de choclo con queso cremoso', id_categoria: catMap['Tartas'], tipo_harina: 'con_gluten', precio_venta: 5000, stock_actual: 10, destacado: false, orden: 63 },
  ]

  let productosCreados = 0
  for (const prod of productosData) {
    await prisma.productoTerminado.create({
      data: {
        codigo: prod.codigo,
        nombre: prod.nombre,
        descripcion: prod.descripcion,
        id_categoria: prod.id_categoria,
        tipo_harina: prod.tipo_harina,
        peso_unitario_aprox: prod.peso_unitario_aprox ?? 0.5,
        precio_venta: prod.precio_venta,
        stock_actual: prod.stock_actual,
        stock_minimo: 5,
        destacado: prod.destacado,
        orden: prod.orden,
        visible_en_landing: true,
        estado: true,
      },
    })
    productosCreados++
  }
  console.log(`✅ ${productosCreados} productos terminados creados`)

  // ============================================
  // VERIFICACIÓN FINAL
  // ============================================
  const verify = await prisma.usuario.findUnique({
    where: { email: 'orlando.candia@gmail.com' },
    include: { persona: true, roles: { include: { rol: true } } },
  })

  console.log('\n========================================')
  console.log('📋 VERIFICACIÓN FINAL')
  console.log('========================================')
  console.log(`Email:    ${verify!.email}`)
  console.log(`Password: Pastas2026!`)
  console.log(`Estado:   ${verify!.estado ? 'Activo' : 'Inactivo'}`)
  console.log(`Persona:  ${verify!.persona.nombre} ${verify!.persona.apellido}`)
  console.log(`Roles:    ${verify!.roles.map(r => r.rol.nombre).join(', ')}`)
  console.log('========================================\n')

  console.log('✅ Seed completado exitosamente')

  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
