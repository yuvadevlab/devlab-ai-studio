/**
 * @file apps/web/src/constants/seo.constants.ts
 * @description Canonical SEO, Open Graph, and route indexation constants for DevLab AI Studio.
 * @module @devlab-ai-studio/web/constants/seo
 */

export const STUDIO_SITE_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_APP_URL || "https://ai-studio-yuvadevlab.vercel.app",
  NAME: "DevLab AI Studio",
  SITE_NAME: "DevLab AI Studio",
  TITLE: "DevLab AI Studio — Central AI Gateway, Agent Control Plane & Cost Ledger",
  TITLE_TEMPLATE: "%s | DevLab AI Studio",
  DESCRIPTION:
    "Unified AI Gateway and Agent Control Plane for multi-provider LLM routing, versioned agent policies, real-time SSE telemetry, and per-app cost governance.",
  OG_TITLE: "DevLab AI Studio — AI Gateway & Agent Control Plane",
  OG_DESCRIPTION:
    "Route LLM traffic across OpenAI, Anthropic, Google, Groq, and Ollama with versioned agent profiles, automatic fallbacks, and live cost telemetry.",
  AUTHOR: "Yuva DevLab",
  AUTHOR_URL: "https://github.com/yuvadevlab",
  TWITTER_HANDLE: "@yuvadevlab",
  THEME_COLOR: "#6366f1",
  BG_COLOR: "#12121a",
  KEYWORDS: [
    "AI Gateway",
    "LLM Gateway",
    "Agent Control Plane",
    "Multi-Provider LLM Routing",
    "OpenAI Gateway",
    "Anthropic Claude Routing",
    "LLM Cost Ledger",
    "AI Telemetry",
    "SSE Streaming Gateway",
    "DevLab AI Studio",
  ],
  PUBLIC_ROUTES: [
    "/",
    "/features",
    "/ai-gateway",
    "/agent-profiles",
    "/cost-telemetry",
    "/about",
    "/privacy-policy",
    "/terms-of-service",
  ],
  CONSOLE_ROUTES: [
    "/overview",
    "/providers",
    "/models",
    "/apps",
    "/profiles",
    "/telemetry",
    "/playground",
  ],
} as const;
