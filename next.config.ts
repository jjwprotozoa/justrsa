// next.config.ts — Next.js configuration for the JUST RSA storefront.
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin the workspace root; an unrelated lockfile sits above this directory.
  outputFileTracingRoot: import.meta.dirname,
  images: {
    // Product art is served from /public; no remote image hosts are required.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
