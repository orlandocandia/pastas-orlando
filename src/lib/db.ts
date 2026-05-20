import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || ''
  const tursoUrl = process.env.TURSO_DATABASE_URL || ''
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || ''

  // Check if we're connecting to Turso/libSQL
  const actualLibsqlUrl = tursoUrl.startsWith('libsql://') || tursoUrl.startsWith('http')
    ? tursoUrl
    : databaseUrl.startsWith('libsql://') || databaseUrl.startsWith('http')
      ? databaseUrl
      : ''

  if (actualLibsqlUrl) {
    // Create the libSQL client for Turso
    const libsql = createClient({
      url: actualLibsqlUrl,
      authToken: tursoAuthToken || undefined,
    })
    const adapter = new PrismaLibSQL(libsql)

    // Prisma validates DATABASE_URL against the schema's datasource.
    // Since the schema uses provider="sqlite" which expects "file:" protocol,
    // we need to temporarily override DATABASE_URL before creating the client.
    const originalUrl = process.env.DATABASE_URL
    process.env.DATABASE_URL = 'file:./dev.db'

    const client = new PrismaClient({ adapter })

    // Restore original URL after client creation
    if (originalUrl) process.env.DATABASE_URL = originalUrl

    return client
  }

  // Local SQLite (file: protocol) - no adapter needed
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
