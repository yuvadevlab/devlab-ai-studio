import { STUDIO_CONFIG } from "@devlab-ai-studio/shared-types";
import { apiEnvSchema } from "@devlab-ai-studio/validation";
import type { LogLevel } from "@yuva-devlab/logger";

/** Validated runtime configuration for `apps/api`. */
export interface ApiConfig {
  port: number;
  databaseUrl: string;
  corsOrigins: string[];
  logEnabled: boolean;
  logLevel: LogLevel;
  logRequests: boolean;
  masterKeyHex: string;
  portalApiUrl: string;
  appId: string;
}

/** Parses and validates process environment variables using {@link apiEnvSchema}. */
export function loadApiConfig(): ApiConfig {
  const env = apiEnvSchema.parse(process.env);
  const corsOrigins = env.CORS_ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    port: env.PORT,
    databaseUrl: env.DATABASE_URL,
    corsOrigins,
    logEnabled: env.LOG_ENABLED,
    logLevel: env.LOG_LEVEL,
    logRequests: env.LOG_REQUESTS,
    masterKeyHex: env.MASTER_KEY_HEX,
    portalApiUrl: env.DEVLAB_PORTAL_API_URL,
    appId: env.DEVLAB_APP_ID,
  };
}

export { STUDIO_CONFIG };
