/**
 * @file apps/web/src/app/robots.ts
 * @description Dynamic robots.txt allowing public SEO routes and disallowing private console routes.
 * @module @devlab-ai-studio/web/app
 */

import type { MetadataRoute } from "next";
import { STUDIO_SITE_CONFIG } from "@/constants/seo.constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          ...STUDIO_SITE_CONFIG.PUBLIC_ROUTES,
          "/icon.svg",
          "/apple-icon",
          "/opengraph-image",
        ],
        disallow: [
          ...STUDIO_SITE_CONFIG.CONSOLE_ROUTES,
          ...STUDIO_SITE_CONFIG.CONSOLE_ROUTES.map((route) => `${route}/*`),
          "/api/*",
        ],
      },
    ],
    sitemap: `${STUDIO_SITE_CONFIG.BASE_URL}/sitemap.xml`,
    host: STUDIO_SITE_CONFIG.BASE_URL,
  };
}
