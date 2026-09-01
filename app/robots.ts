// app/robots.ts — crawl rules.

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/cart", "/checkout"] },
    sitemap: "https://justrsa.co.za/sitemap.xml",
  };
}
