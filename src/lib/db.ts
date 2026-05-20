// IMPORTANT: db-env.ts MUST be imported BEFORE @prisma/client
// It sets DATABASE_URL_FILE env var that Prisma reads from the schema
import './db-env'

import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL || ''
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN || ''

  // Detect if we need to use the Turso/libSQL adapter
  const isTurso =
    tursoUrl.startsWith('libsql://') ||
    tursoUrl.startsWith('http://') ||
    tursoUrl.startsWith('https://')

  if (isTurso) {
    console.log(`[DB] Using Turso/libSQL adapter (url: ${tursoUrl.substring(0, 30)}...)`)

    // CRITICAL: In Prisma v6, PrismaLibSQL expects a CONFIG OBJECT, not a client instance.
    // The adapter internally calls createClient(config) during connect().
    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: tursoAuthToken || undefined,
    })

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
