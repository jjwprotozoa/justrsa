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
  // Hostinger's CDN caches prerendered HTML for up to a year. After each deploy
  // chunk hashes change, so stale HTML references missing CSS/JS and the site
  // renders unstyled. Short s-maxage on pages lets the edge pick up new builds.
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
