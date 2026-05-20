import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // At build time, DATABASE_URL is set to file:./dev.db (see package.json build script)
  // At runtime on Vercel, DATABASE_URL is the real Turso URL (libsql://...)
  // We also support TURSO_DATABASE_URL as a separate env var
  const databaseUrl = process.env.DATABASE_URL || ''
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
    
    const libsql = createClient({
      url: connectionUrl,
      authToken: tursoAuthToken || undefined,
    })
    const adapter = new PrismaLibSQL(libsql)

    // Use a dummy file: URL for Prisma schema validation
    // The adapter handles the actual connection
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
