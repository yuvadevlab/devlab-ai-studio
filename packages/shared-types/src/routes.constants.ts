/**
 * @file packages/shared-types/src/routes.constants.ts
 * @description Canonical API route paths and safe URL builder utilities.
 * @module @devlab-ai-studio/shared-types/routes-constants
 */

import { STUDIO_CONFIG } from "./enums";

/** Canonical controller route segments for `apps/api` and `apps/gateway`. */
export const StudioApiRoute = {
  HEALTH: "health",
  PROVIDERS: "providers",
  PROVIDERS_MODELS: "models",
  APPS: "apps",
  PROFILES: "profiles",
  PROFILE_RESOLVE: "resolve",
  ANALYTICS: "analytics",
  ANALYTICS_SUMMARY: "summary",
  TELEMETRY: "telemetry",
  TELEMETRY_INGEST: "ingest",
  GATEWAY: "gateway",
  GATEWAY_RUNS_STREAM: "runs/stream",
} as const;

/**
 * Safely constructs an absolute URL by joining base URL and path segments via `URL`,
 * preventing double slashes or unescaped path parameters.
 *
 * @param baseUrl - Origin/base URL (e.g. `http://localhost:3100`).
 * @param segments - Path segments to join under the global API prefix.
 * @returns Normalized absolute URL string.
 */
export function buildStudioApiUrl(baseUrl: string, ...segments: string[]): string {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const encodedPath = [STUDIO_CONFIG.API_PREFIX, ...segments]
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return new URL(encodedPath, normalizedBase).toString();
}
