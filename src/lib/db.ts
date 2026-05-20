import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Read env vars
  let databaseUrl = process.env.DATABASE_URL || ''
  const tursoUrl = process.env.TURSO_DATABASE_URL || ''
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN || ''

  // Determine if we need to use the libSQL adapter
  const isTurso =
    tursoUrl.startsWith('libsql://') ||
    tursoUrl.startsWith('http://') ||
    tursoUrl.startsWith('https://') ||
    databaseUrl.startsWith('libsql://') ||
    databaseUrl.startsWith('http://')

  if (isTurso) {
    const connectionUrl = tursoUrl || databaseUrl

    console.log(`[DB] Using Turso/libSQL adapter`)

    // Save real URL to TURSO_DATABASE_URL in case instrumentation hasn't run
    if (!tursoUrl && databaseUrl.startsWith('libsql://')) {
      process.env.TURSO_DATABASE_URL = databaseUrl
    }

    const libsql = createClient({
      url: connectionUrl,
      authToken: tursoAuthToken || undefined,
    })
    const adapter = new PrismaLibSql(libsql)

    // CRITICAL: Set DATABASE_URL to file: protocol BEFORE creating PrismaClient
    // Prisma validates this env var even when using an adapter
    process.env.DATABASE_URL = 'file:./dev.db'

    return new PrismaClient({
      adapter,
      datasourceUrl: 'file:./dev.db',
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
