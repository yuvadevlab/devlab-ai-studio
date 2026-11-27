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
  APPS_ROTATE_KEY: "rotate-key",
  APPS_VERIFY_KEY: "verify-key",
  PROFILES: "profiles",
  PROFILE_PUBLISH: "publish",
  PROFILE_RESOLVE: "resolve",
  ANALYTICS: "analytics",
  ANALYTICS_SUMMARY: "summary",
  ANALYTICS_RUNS: "runs",
  TELEMETRY: "telemetry",
  TELEMETRY_INGEST: "ingest",
  GATEWAY: "gateway",
  GATEWAY_RUNS_STREAM: "runs/stream",
  GATEWAY_RUNS: "runs",
  STREAM: "stream",
  FEEDBACK: "feedback",
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
  const encodedPath = [...STUDIO_CONFIG.API_PREFIX.split("/"), ...segments]
    .flatMap((segment) => segment.split("/"))
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return new URL(encodedPath, normalizedBase).toString();
}
