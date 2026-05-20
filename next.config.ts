import type { NextConfig } from "next";

// CRITICAL: Turso/Prisma compatibility
// On Vercel, DATABASE_URL is set to "libsql://..." (Turso URL).
// Prisma SQLite validates that DATABASE_URL starts with "file:" protocol.
// We need to:
// 1. Save the real Turso URL to TURSO_DATABASE_URL (for the libsql adapter)
// 2. Override DATABASE_URL to "file:./dev.db" (for Prisma validation)
const originalDatabaseUrl = process.env.DATABASE_URL || 'file:./db/custom.db'
const isTursoUrl = originalDatabaseUrl.startsWith('libsql://') || originalDatabaseUrl.startsWith('http://')

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    ".space-z.ai",
    "localhost",
  ],
  env: {
    // If DATABASE_URL is a Turso URL, override it for Prisma and save to TURSO_DATABASE_URL
    DATABASE_URL: isTursoUrl ? 'file:./dev.db' : originalDatabaseUrl,
    ...(isTursoUrl ? { TURSO_DATABASE_URL: originalDatabaseUrl } : {}),
  },
};

export default nextConfig;
