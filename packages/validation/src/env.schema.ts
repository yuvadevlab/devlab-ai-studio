/**
 * @file packages/validation/src/env.schema.ts
 * @description Zod environment validation schemas for `apps/api` and `apps/gateway`.
 * @module @devlab-ai-studio/validation/env-schema
 */

import { z } from "zod";

const DEFAULT_API_PORT = 3100;
const DEFAULT_GATEWAY_PORT = 3102;
const DEFAULT_CACHE_TTL_MS = 30000;
const DEFAULT_TELEMETRY_STREAM_KEY = "devlab:ai:telemetry";

/** Validated environment schema for Control Plane (`apps/api`). */
export const apiEnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(DEFAULT_API_PORT),
  DATABASE_URL: z
    .string()
    .url()
    .default("postgresql://postgres:postgres@localhost:5432/devlab_ai_studio"),
  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:3101"),
  LOG_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v !== "false"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  LOG_REQUESTS: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v !== "false"),
});

export type ApiEnvConfig = z.infer<typeof apiEnvSchema>;

/** Validated environment schema for Data Plane (`apps/gateway`). */
export const gatewayEnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(DEFAULT_GATEWAY_PORT),
  STUDIO_API_URL: z.string().url().default("http://localhost:3100"),
  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:3001,http://localhost:3101"),
  UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal("")),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  TELEMETRY_STREAM_KEY: z.string().min(1).default(DEFAULT_TELEMETRY_STREAM_KEY),
  PROFILE_CACHE_TTL_MS: z.coerce.number().int().positive().default(DEFAULT_CACHE_TTL_MS),
  LOG_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v !== "false"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

export type GatewayEnvConfig = z.infer<typeof gatewayEnvSchema>;
