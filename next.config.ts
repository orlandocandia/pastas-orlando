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
  env: {
    // Prisma reads DATABASE_URL_FILE from the schema (instead of DATABASE_URL)
    // This separates the Prisma validation URL (must be file:) from the actual
    // Turso connection URL (libsql://) which is used by the adapter in db.ts
    DATABASE_URL_FILE: process.env.DATABASE_URL?.startsWith('libsql://') || process.env.DATABASE_URL?.startsWith('http')
      ? 'file:./dev.db'
      : (process.env.DATABASE_URL || 'file:./db/custom.db'),
  },
};

export default nextConfig;
