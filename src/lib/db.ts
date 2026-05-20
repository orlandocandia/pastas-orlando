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

  // Determine the actual libSQL/Turso URL
  const actualLibsqlUrl =
    tursoUrl.startsWith('libsql://') || tursoUrl.startsWith('http')
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

    // Use datasourceUrl to override the URL validation
    // The adapter handles the actual connection, but Prisma still validates the URL
    // Passing a dummy file: URL satisfies the SQLite provider validation
    return new PrismaClient({
      adapter,
      datasourceUrl: 'file:./dev.db',
    })
  }

  // Local SQLite (file: protocol) - no adapter needed
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
