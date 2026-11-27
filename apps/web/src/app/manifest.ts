/**
 * @file apps/web/src/app/manifest.ts
 * @description Web App Manifest for DevLab AI Studio.
 * @module @devlab-ai-studio/web/app
 */

import type { MetadataRoute } from "next";
import { STUDIO_SITE_CONFIG } from "@/constants/seo.constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: STUDIO_SITE_CONFIG.NAME,
    short_name: "AI Studio",
    description: STUDIO_SITE_CONFIG.DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: STUDIO_SITE_CONFIG.BG_COLOR,
    theme_color: STUDIO_SITE_CONFIG.THEME_COLOR,
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
