import { STUDIO_CONFIG } from "@devlab-ai-studio/shared-types";
import { LogLevel } from "@yuva-devlab/logger";

export interface ApiConfig {
  port: number;
  databaseUrl: string;
  corsOrigins: string[];
  logEnabled: boolean;
  logLevel: LogLevel;
  logRequests: boolean;
}

export function loadApiConfig(): ApiConfig {
  const port = Number(process.env.PORT ?? 3100);
  const databaseUrl =
    process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/devlab_ai_studio";
  const corsOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:3101")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  return {
    port: Number.isFinite(port) && port > 0 ? port : 3100,
    databaseUrl,
    corsOrigins,
    logEnabled: process.env.LOG_ENABLED !== "false",
    logLevel: (process.env.LOG_LEVEL as LogLevel) ?? "info",
    logRequests: process.env.LOG_REQUESTS !== "false",
  };
}

export { STUDIO_CONFIG };
