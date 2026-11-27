/**
 * @file packages/validation/src/env.schema.ts
 * @description Zod environment validation schemas with production fail-fast guards.
 * @module @devlab-ai-studio/validation/env-schema
 */

import { z } from "zod";
import { HEX_64_REGEX } from "@yuva-devlab/regex";
import { CRYPTO_CONSTANTS, SERVER_DEFAULTS } from "@devlab-ai-studio/shared-types";

const booleanFlagSchema = z
  .enum(["true", "false"])
  .default("true")
  .transform((v) => v !== "false");

const nodeEnvSchema = z.enum(["development", "test", "production"]).default("development");

/** Validated environment schema for Control Plane (`apps/api`). */
export const apiEnvSchema = z
  .object({
    NODE_ENV: nodeEnvSchema,
    PORT: z.coerce.number().int().positive().default(SERVER_DEFAULTS.API_PORT),
    DATABASE_URL: z.string().url().optional(),
    CORS_ALLOWED_ORIGINS: z.string().optional(),
    LOG_ENABLED: booleanFlagSchema,
    LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
    LOG_REQUESTS: booleanFlagSchema,
    MASTER_KEY_HEX: z.string().regex(HEX_64_REGEX).optional(),
    DEVLAB_PORTAL_API_URL: z.string().url().default("http://localhost:4000"),
    DEVLAB_APP_ID: z.string().min(1).default("ai-studio"),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== "production") return;

    if (!env.DATABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DATABASE_URL"],
        message: "DATABASE_URL is required in production",
      });
    }
    if (!env.CORS_ALLOWED_ORIGINS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["CORS_ALLOWED_ORIGINS"],
        message: "CORS_ALLOWED_ORIGINS is required in production",
      });
    }
    if (!env.MASTER_KEY_HEX || env.MASTER_KEY_HEX === CRYPTO_CONSTANTS.DEV_MASTER_KEY_HEX) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["MASTER_KEY_HEX"],
        message: "A non-default MASTER_KEY_HEX is required in production",
      });
    }
  })
  .transform((env) => ({
    ...env,
    DATABASE_URL: env.DATABASE_URL ?? SERVER_DEFAULTS.DATABASE_URL,
    CORS_ALLOWED_ORIGINS: env.CORS_ALLOWED_ORIGINS ?? SERVER_DEFAULTS.API_CORS_ORIGINS,
    MASTER_KEY_HEX: env.MASTER_KEY_HEX ?? CRYPTO_CONSTANTS.DEV_MASTER_KEY_HEX,
  }));

export type ApiEnvConfig = z.infer<typeof apiEnvSchema>;

/** Validated environment schema for Data Plane (`apps/gateway`). */
export const gatewayEnvSchema = z
  .object({
    NODE_ENV: nodeEnvSchema,
    PORT: z.coerce.number().int().positive().default(SERVER_DEFAULTS.GATEWAY_PORT),
    STUDIO_API_URL: z.string().url().optional(),
    CORS_ALLOWED_ORIGINS: z.string().optional(),
    UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal("")),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    TELEMETRY_STREAM_KEY: z.string().min(1).default(SERVER_DEFAULTS.TELEMETRY_STREAM_KEY),
    PROFILE_CACHE_TTL_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(SERVER_DEFAULTS.PROFILE_CACHE_TTL_MS),
    LOG_ENABLED: booleanFlagSchema,
    LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== "production") return;

    if (!env.STUDIO_API_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["STUDIO_API_URL"],
        message: "STUDIO_API_URL is required in production",
      });
    }
    if (!env.CORS_ALLOWED_ORIGINS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["CORS_ALLOWED_ORIGINS"],
        message: "CORS_ALLOWED_ORIGINS is required in production",
      });
    }
  })
  .transform((env) => ({
    ...env,
    STUDIO_API_URL: env.STUDIO_API_URL ?? SERVER_DEFAULTS.STUDIO_API_URL,
    CORS_ALLOWED_ORIGINS: env.CORS_ALLOWED_ORIGINS ?? SERVER_DEFAULTS.GATEWAY_CORS_ORIGINS,
  }));

export type GatewayEnvConfig = z.infer<typeof gatewayEnvSchema>;
