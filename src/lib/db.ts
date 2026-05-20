import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

// CRITICAL: Ensure DATABASE_URL_FILE is set before PrismaClient is used
// Prisma schema reads env("DATABASE_URL_FILE") for the datasource URL
// On Vercel, this env var may not be set at runtime
if (!process.env.DATABASE_URL_FILE) {
  process.env.DATABASE_URL_FILE = 'file:./dev.db'
}

// Also save Turso URL if DATABASE_URL is a libsql URL
const _dbUrl = process.env.DATABASE_URL || ''
if (_dbUrl.startsWith('libsql://') || _dbUrl.startsWith('http://') || _dbUrl.startsWith('https://')) {
  if (!process.env.TURSO_DATABASE_URL) {
    process.env.TURSO_DATABASE_URL = _dbUrl
  }
  // Extract authToken from URL if present
  if (!process.env.TURSO_AUTH_TOKEN && !process.env.DATABASE_AUTH_TOKEN) {
    try {
      const _u = new URL(_dbUrl)
      const _t = _u.searchParams.get('authToken')
      if (_t) process.env.TURSO_AUTH_TOKEN = _t
    } catch { /* skip */ }
  }
}

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
    console.log(`[DB] Using Turso/libSQL adapter`)

    const libsql = createClient({
      url: tursoUrl,
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
