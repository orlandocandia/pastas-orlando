import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || ''
  const tursoUrl = process.env.TURSO_DATABASE_URL || ''
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN || ''

  // Detect if we need to use the Turso/libSQL adapter
  const isTurso =
    tursoUrl.startsWith('libsql://') ||
    tursoUrl.startsWith('http://') ||
    tursoUrl.startsWith('https://') ||
    databaseUrl.startsWith('libsql://') ||
    databaseUrl.startsWith('http://') ||
    databaseUrl.startsWith('https://')

  if (isTurso) {
    const connectionUrl = tursoUrl || databaseUrl
    console.log(`[DB] Using Turso/libSQL adapter`)

    const libsql = createClient({
      url: connectionUrl,
      authToken: tursoAuthToken || undefined,
    })
    const adapter = new PrismaLibSql(libsql)

    return new PrismaClient({
      adapter,
    })
  }

  // Local SQLite (file: protocol) - no adapter needed
  console.log(`[DB] Using local SQLite`)
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
