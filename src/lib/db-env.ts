// This module MUST be imported before @prisma/client
// It ensures DATABASE_URL is set to a file: protocol URL that Prisma can validate,
// while preserving the real Turso URL in TURSO_DATABASE_URL for the adapter.

const databaseUrl = process.env.DATABASE_URL || ''
const tursoUrl = process.env.TURSO_DATABASE_URL || ''

// If DATABASE_URL is a Turso/libsql URL, save it and override with dummy
if (databaseUrl.startsWith('libsql://') || databaseUrl.startsWith('http://') || databaseUrl.startsWith('https://')) {
  // Save the real URL if TURSO_DATABASE_URL isn't already set
  if (!tursoUrl) {
    process.env.TURSO_DATABASE_URL = databaseUrl
  }
  // Save auth token
  if (!process.env.TURSO_AUTH_TOKEN && !process.env.DATABASE_AUTH_TOKEN) {
    // Extract authToken from URL query params if present
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
  // Override DATABASE_URL for Prisma validation
  process.env.DATABASE_URL = 'file:./dev.db'
}

// Also check TURSO_DATABASE_URL (might be set by next.config.ts or Vercel)
// In this case DATABASE_URL might already be file: but we need to ensure it
if (tursoUrl.startsWith('libsql://') || tursoUrl.startsWith('http://') || tursoUrl.startsWith('https://')) {
  process.env.DATABASE_URL = 'file:./dev.db'
}
