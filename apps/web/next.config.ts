import type { NextConfig } from "next";

/**
 * Next.js 15 configuration for DevLab AI Studio Web Console.
 */
const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : "standalone",
  reactStrictMode: true,
  transpilePackages: [
    "@devlab-ai-studio/shared-types",
    "@devlab-ai-studio/ui",
    "@devlab-ai-studio/validation",
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
