import { gatewayEnvSchema } from "@devlab-ai-studio/validation";
import type { LogLevel } from "@yuva-devlab/logger";

/** Validated runtime configuration for `apps/gateway`. */
export interface GatewayConfig {
  port: number;
  studioApiUrl: string;
  corsOrigins: string[];
  upstashRedisRestUrl?: string;
  upstashRedisRestToken?: string;
  telemetryStreamKey: string;
  profileCacheTtlMs: number;
  logEnabled: boolean;
  logLevel: LogLevel;
}

/** Parses and validates process environment variables using {@link gatewayEnvSchema}. */
export function loadGatewayConfig(): GatewayConfig {
  const env = gatewayEnvSchema.parse(process.env);
  const corsOrigins = env.CORS_ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    port: env.PORT,
    studioApiUrl: env.STUDIO_API_URL.replace(/\/+$/, ""),
    corsOrigins,
    upstashRedisRestUrl: env.UPSTASH_REDIS_REST_URL || undefined,
    upstashRedisRestToken: env.UPSTASH_REDIS_REST_TOKEN || undefined,
    telemetryStreamKey: env.TELEMETRY_STREAM_KEY,
    profileCacheTtlMs: env.PROFILE_CACHE_TTL_MS,
    logEnabled: env.LOG_ENABLED,
    logLevel: env.LOG_LEVEL,
  };
}
