import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Read env vars - may have been set by instrumentation.ts or may be raw
  let databaseUrl = process.env.DATABASE_URL || ''
  const tursoUrl = process.env.TURSO_DATABASE_URL || ''
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN || ''

  // Determine if we need to use the libSQL adapter
  // Check both DATABASE_URL and TURSO_DATABASE_URL for libsql protocol
  const isTurso =
    tursoUrl.startsWith('libsql://') ||
    tursoUrl.startsWith('http://') ||
    tursoUrl.startsWith('https://') ||
    databaseUrl.startsWith('libsql://') ||
    databaseUrl.startsWith('http://')

  if (isTurso) {
    // Use Turso URL from env var, or fall back to DATABASE_URL if it's a libsql URL
    const connectionUrl = tursoUrl || databaseUrl

    console.log(`[DB] Using Turso/libSQL adapter with URL: ${connectionUrl.substring(0, 30)}...`)

    const libsql = createClient({
      url: connectionUrl,
      authToken: tursoAuthToken || undefined,
    })
    const adapter = new PrismaLibSQL(libsql)

    // CRITICAL: Override DATABASE_URL to file: protocol BEFORE creating PrismaClient
    // Prisma validates DATABASE_URL at client construction time even with adapter
    // The adapter handles the actual connection, so the URL just needs to pass validation
    process.env.DATABASE_URL = 'file:./dev.db'

    return new PrismaClient({
      adapter,
    })
  }

  // Local SQLite (file: protocol) - no adapter needed
  console.log(`[DB] Using local SQLite with URL: ${databaseUrl.substring(0, 30)}...`)
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
