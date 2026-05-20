// This file sets up environment variables BEFORE @prisma/client is loaded.
// It MUST be the first side-effect import in db.ts.
// We use require() instead of import to ensure synchronous execution
// before @prisma/client's module evaluation reads process.env.DATABASE_URL_FILE.

// Ensure DATABASE_URL_FILE is set for Prisma schema validation
if (!process.env.DATABASE_URL_FILE) {
  process.env.DATABASE_URL_FILE = 'file:./dev.db'
}

// Save Turso URL from DATABASE_URL if it's a libsql:// URL
const _dbUrl = process.env.DATABASE_URL || ''
if (_dbUrl.startsWith('libsql://') || _dbUrl.startsWith('http://') || _dbUrl.startsWith('https://')) {
  if (!process.env.TURSO_DATABASE_URL) {
    process.env.TURSO_DATABASE_URL = _dbUrl
  }
  if (!process.env.TURSO_AUTH_TOKEN && !process.env.DATABASE_AUTH_TOKEN) {
    try {
      const _u = new URL(_dbUrl)
      const _t = _u.searchParams.get('authToken')
      if (_t) process.env.TURSO_AUTH_TOKEN = _t
    } catch { /* skip */ }
  }
}
