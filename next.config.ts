import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    // Sandbox preview panel origins
    ".space-z.ai",
    "localhost",
  ],
};

export default nextConfig;
