/**
 * @file apps/web/src/app/sitemap.ts
 * @description Dynamic sitemap.xml indexing all public marketing and capability pages.
 * @module @devlab-ai-studio/web/app
 */

import type { MetadataRoute } from "next";
import { STUDIO_SITE_CONFIG } from "@/constants/seo.constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = STUDIO_SITE_CONFIG.BASE_URL;
  const now = new Date();

  const priorities: Record<string, { priority: number; freq: "daily" | "weekly" | "monthly" }> = {
    "/": { priority: 1.0, freq: "daily" },
    "/features": { priority: 0.9, freq: "weekly" },
    "/ai-gateway": { priority: 0.9, freq: "weekly" },
    "/agent-profiles": { priority: 0.9, freq: "weekly" },
    "/cost-telemetry": { priority: 0.9, freq: "weekly" },
    "/about": { priority: 0.6, freq: "monthly" },
    "/privacy-policy": { priority: 0.4, freq: "monthly" },
    "/terms-of-service": { priority: 0.4, freq: "monthly" },
  };

  return STUDIO_SITE_CONFIG.PUBLIC_ROUTES.map((route) => {
    const meta = priorities[route] ?? { priority: 0.7, freq: "weekly" as const };
    return {
      url: `${baseUrl}${route}`,
      lastModified: now,
      changeFrequency: meta.freq,
      priority: meta.priority,
    };
  });
}
