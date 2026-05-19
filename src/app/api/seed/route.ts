import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// POST /api/seed - Initialize database with admin user, roles, and permissions
// This endpoint should be called once to set up the initial data
export async function POST(request: NextRequest) {
  try {
    // Security: require a secret key to prevent unauthorized seeding
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    if (secret !== process.env.SEED_SECRET && secret !== 'pastas-orlando-seed-2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results: string[] = []

    // 1. Tipos de Persona
    const tiposPersona = ['cliente', 'proveedor', 'empleado']
    for (const nombre of tiposPersona) {
      await db.tipoPersona.upsert({
        where: { nombre },
        update: {},
        create: { nombre },
      })
    }
    results.push('Tipos de persona creados')

    // 2. Tipos de Contacto
    const tiposContacto = ['email', 'teléfono', 'WhatsApp']
    for (const nombre of tiposContacto) {
      await db.tipoContacto.upsert({
        where: { nombre },
        update: {},
        create: { nombre },
      })
    }
    results.push('Tipos de contacto creados')

    // 3. Tipos de Dirección
    const tiposDireccion = ['particular', 'comercial', 'entrega']
    for (const nombre of tiposDireccion) {
      await db.tipoDireccion.upsert({
        where: { nombre },
        update: {},
        create: { nombre },
      })
    }
    results.push('Tipos de dirección creados')

    // 4. Persona Admin
    const personaAdmin = await db.persona.upsert({
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
    results.push(`Persona admin: ${personaAdmin.nombre} ${personaAdmin.apellido}`)

    // 5. Usuario Admin
    const hashedPassword = await bcrypt.hash('Pastas2026!', 10)
    const usuarioAdmin = await db.usuario.upsert({
      where: { email: 'orlando.candia@gmail.com' },
      update: {},
      create: {
        id_persona: personaAdmin.id,
        email: 'orlando.candia@gmail.com',
        password: hashedPassword,
        estado: true,
      },
    })
    results.push(`Usuario admin: ${usuarioAdmin.email}`)

    // 6. Roles
    const rolesData = [
      { nombre: 'admin', descripcion: 'Administrador total del sistema', es_default: false },
      { nombre: 'produccion', descripcion: 'Acceso a producción y stock', es_default: false },
      { nombre: 'ventas', descripcion: 'Acceso a ventas y pedidos', es_default: false },
      { nombre: 'lectura', descripcion: 'Solo lectura de datos', es_default: true },
    ]

    for (const rol of rolesData) {
      await db.rol.upsert({
        where: { nombre: rol.nombre },
        update: {},
        create: rol,
      })
    }
    results.push('Roles creados: admin, produccion, ventas, lectura')

    // Assign admin role
    const rolAdmin = await db.rol.findUniqueOrThrow({ where: { nombre: 'admin' } })
    await db.usuarioRol.upsert({
      where: { id_usuario_id_rol: { id_usuario: usuarioAdmin.id, id_rol: rolAdmin.id } },
      update: {},
      create: { id_usuario: usuarioAdmin.id, id_rol: rolAdmin.id },
    })
    results.push('Rol admin asignado')

    // 7. Permisos
    const modulos = [
      'productos', 'compras', 'ventas', 'produccion', 'usuarios',
      'auditoria', 'reportes', 'seguridad', 'logistica', 'presupuestos',
    ]
    const acciones = ['ver', 'crear', 'editar', 'eliminar']
    let permisosCount = 0

    for (const modulo of modulos) {
      for (const accion of acciones) {
        const nombre = `${modulo}.${accion}`
        await db.permiso.upsert({
          where: { nombre },
          update: {},
          create: { nombre, modulo, descripcion: `${accion} en ${modulo}` },
        })
        permisosCount++
      }
    }

    const extraPermisos = ['dashboard.ver', 'configuracion.ver', 'configuracion.editar', 'opiniones.ver', 'opiniones.editar']
    for (const nombre of extraPermisos) {
      const modulo = nombre.split('.')[0]
      await db.permiso.upsert({
        where: { nombre },
        update: {},
        create: { nombre, modulo, descripcion: nombre },
      })
      permisosCount++
    }
    results.push(`${permisosCount} permisos creados`)

    // Assign all permissions to admin role
    const allPermisos = await db.permiso.findMany()
    for (const permiso of allPermisos) {
      await db.rolPermiso.upsert({
        where: { id_rol_id_permiso: { id_rol: rolAdmin.id, id_permiso: permiso.id } },
        update: {},
        create: { id_rol: rolAdmin.id, id_permiso: permiso.id },
      })
    }
    results.push(`${allPermisos.length} permisos asignados al rol admin`)

    // 8. Estados Generales
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
    ]
    for (const estado of estados) {
      await db.estadoGeneral.upsert({
        where: { nombre_estado: estado.nombre_estado },
        update: {},
        create: estado,
      })
    }
    results.push(`${estados.length} estados generales creados`)

    // 9. Formas de Pago
    const formasPago = [
      { nombre_forma: 'Efectivo', requiere_identificacion: false, requiere_cuenta: false },
      { nombre_forma: 'Mercado Pago', requiere_identificacion: false, requiere_cuenta: true },
      { nombre_forma: 'Transferencia bancaria', requiere_identificacion: true, requiere_cuenta: true },
    ]
    for (const fp of formasPago) {
      await db.formaPago.upsert({
        where: { nombre_forma: fp.nombre_forma },
        update: {},
        create: fp,
      })
    }
    results.push(`${formasPago.length} formas de pago creadas`)

    return NextResponse.json({
      success: true,
      message: 'Seed completado exitosamente',
      results,
      credentials: {
        email: 'orlando.candia@gmail.com',
        password: 'Pastas2026!',
        login_url: '/admin/login',
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Error al ejecutar seed', details: String(error) },
      { status: 500 }
    )
  }
}
