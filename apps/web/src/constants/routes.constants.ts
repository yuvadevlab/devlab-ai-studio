/**
 * @file apps/web/src/constants/routes.constants.ts
 * @description Canonical web routes, query keys, storage keys, and defaults for Studio Web.
 * @module @devlab-ai-studio/web/constants/routes
 */

import { SERVER_DEFAULTS } from "@devlab-ai-studio/shared-types";
import { AuthQueryParamKey } from "./auth.constants";

/** Canonical Next.js App Router paths in Studio Web. */
export const StudioWebRoute = {
  HOME: "/",
  OVERVIEW: "/overview",
  PROVIDERS: "/providers",
  MODELS: "/models",
  APPS: "/apps",
  PROFILES: "/profiles",
  TELEMETRY: "/telemetry",
  PLAYGROUND: "/playground",
} as const;

export type StudioWebRoute = (typeof StudioWebRoute)[keyof typeof StudioWebRoute];

/** Canonical TanStack Query cache keys for Studio Web. */
export const StudioQueryKey = {
  PROVIDERS: "studio-providers",
  MODELS: "studio-models",
  APPS: "studio-apps",
  PROFILES: "studio-profiles",
  ANALYTICS_SUMMARY: "studio-analytics-summary",
  RECENT_RUNS: "studio-recent-runs",
} as const;

/** Browser storage keys for Studio Web operator preferences. */
export const StudioStorageKey = {
  ACTIVE_APP_SLUG: "devlab.studio.active_app_slug",
  PLAYGROUND_APP_KEY: "devlab.studio.playground_app_key",
} as const;

/** Default client-side endpoints, polling intervals, and form defaults. */
export const StudioWebDefaults = {
  API_URL: SERVER_DEFAULTS.STUDIO_API_URL,
  GATEWAY_URL: `http://localhost:${SERVER_DEFAULTS.GATEWAY_PORT}`,
  QUERY_STALE_TIME_MS: 15_000,
  TELEMETRY_REFETCH_MS: 10_000,
  DEFAULT_BASE_URL: "https://api.openai.com/v1",
  DEFAULT_PROVIDER_SLUG: "openai",
  DEFAULT_MODEL_CONTEXT: 128_000,
  DEFAULT_PROFILE_SLUG: "default-agent",
  DEFAULT_MONTHLY_BUDGET_USD: 500,
  PORTAL_APP_ID: "ai-studio",
  PORTAL_WEB_URL: process.env.NEXT_PUBLIC_DEVLAB_PORTAL_URL || "http://localhost:3000",
  PORTAL_API_URL: process.env.NEXT_PUBLIC_DEVLAB_PORTAL_API_URL || "http://localhost:4000",
} as const;

/** Builds a DevLab Portal SSO login URL using centralized query parameter enums. */
export function buildPortalLoginUrl(params: {
  redirectUrl: string;
  error?: string;
  prompt?: string;
}): string {
  const base = StudioWebDefaults.PORTAL_WEB_URL.replace(/\/+$/, "");
  const url = new URL(`${base}/login`);
  url.searchParams.set(AuthQueryParamKey.APP, StudioWebDefaults.PORTAL_APP_ID);
  url.searchParams.set(AuthQueryParamKey.REDIRECT, params.redirectUrl);
  if (params.error) url.searchParams.set("error", params.error);
  if (params.prompt) url.searchParams.set("prompt", params.prompt);
  return url.toString();
}
