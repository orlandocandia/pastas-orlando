/**
 * Next.js Instrumentation - Runs BEFORE any other module
 *
 * This file handles the DATABASE_URL override for Turso/libSQL compatibility.
 * Prisma's SQLite provider validates that DATABASE_URL starts with "file:",
 * but Turso uses "libsql://" protocol. We save the real URL and replace
 * DATABASE_URL with a dummy before Prisma loads.
 */
export async function register() {
  const databaseUrl = process.env.DATABASE_URL || ''

  // If DATABASE_URL is a libsql:// URL (Turso), save it and replace with dummy
  if (databaseUrl.startsWith('libsql://') || databaseUrl.startsWith('http')) {
    process.env.TURSO_DATABASE_URL = databaseUrl
    process.env.TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN || ''
    process.env.DATABASE_URL = 'file:./dev.db'
    console.log('[Instrumentation] DATABASE_URL overridden for Turso/libSQL adapter')
  }
}
