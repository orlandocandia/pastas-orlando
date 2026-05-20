/**
 * Next.js Instrumentation - Runs BEFORE any other module
 *
 * This file handles environment variable setup for Turso/Prisma compatibility.
 * Prisma's SQLite provider validates that the datasource URL starts with "file:",
 * but on Vercel the DATABASE_URL is "libsql://..." (Turso URL).
 *
 * We use DATABASE_URL_FILE in the Prisma schema (instead of DATABASE_URL)
 * to separate the Prisma validation URL from the actual Turso connection URL.
 */
export async function register() {
  // Always ensure DATABASE_URL_FILE is set for Prisma validation
  if (!process.env.DATABASE_URL_FILE) {
    process.env.DATABASE_URL_FILE = 'file:./dev.db'
  }

  const databaseUrl = process.env.DATABASE_URL || ''

  // If DATABASE_URL is a Turso/libsql URL, save it to TURSO_DATABASE_URL
  // and extract the auth token if embedded in the URL
  if (databaseUrl.startsWith('libsql://') || databaseUrl.startsWith('http://') || databaseUrl.startsWith('https://')) {
    process.env.TURSO_DATABASE_URL = databaseUrl

    // Extract authToken from URL query params if present
    if (!process.env.TURSO_AUTH_TOKEN && !process.env.DATABASE_AUTH_TOKEN) {
      try {
        const url = new URL(databaseUrl)
        const token = url.searchParams.get('authToken')
        if (token) {
          process.env.TURSO_AUTH_TOKEN = token
        }
      } catch {
        // URL parsing failed, skip
      }
    }

    console.log('[Instrumentation] Turso URL detected, saved to TURSO_DATABASE_URL')
  }
}
