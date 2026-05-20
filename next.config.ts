import type { NextConfig } from "next";

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
  // CRITICAL: Override DATABASE_URL for Prisma compatibility with Turso
  // Prisma SQLite validates that DATABASE_URL starts with "file:" protocol.
  // On Vercel, DATABASE_URL is set to "libsql://..." (Turso URL).
  // We save the real URL to TURSO_DATABASE_URL in instrumentation.ts,
  // and override DATABASE_URL here so Prisma doesn't crash at runtime.
  env: {
    DATABASE_URL: process.env.TURSO_DATABASE_URL
      ? 'file:./dev.db'
      : (process.env.DATABASE_URL || 'file:./db/custom.db'),
  },
};

export default nextConfig;
