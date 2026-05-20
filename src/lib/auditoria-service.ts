import { db } from '@/lib/db'

export enum ModuloAuditoria {
  PRODUCTOS = 'productos',
  COMPRAS = 'compras',
  VENTAS = 'ventas',
  PRODUCCION = 'produccion',
  USUARIOS = 'usuarios',
  REPORTES = 'reportes',
  LOGIN = 'login',
  STOCK = 'stock',
  RECETAS = 'recetas',
}

export enum AccionAuditoria {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN_OK = 'LOGIN_OK',
  LOGIN_FAIL = 'LOGIN_FAIL',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  VIEW = 'VIEW',
}

export async function registrarAuditoria(data: {
  id_usuario?: number | null
  accion: AccionAuditoria
  modulo: ModuloAuditoria | string
  entidad_id?: number | null
  entidad_nombre?: string | null
  detalles?: any | null
  ip?: string | null
  user_agent?: string | null
}) {
  try {
    await db.auditoria.create({
      data: {
        id_usuario: data.id_usuario || null,
        accion: data.accion,
        modulo: typeof data.modulo === 'string' ? data.modulo : data.modulo,
        entidad_id: data.entidad_id || null,
        entidad_nombre: data.entidad_nombre || null,
        detalles: data.detalles ? JSON.stringify(data.detalles) : null,
        ip: data.ip || null,
        user_agent: data.user_agent || null,
      },
    })
  } catch (error) {
    console.error('Error al registrar auditoría:', error)
  }
}
