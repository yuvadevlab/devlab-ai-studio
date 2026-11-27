import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import "reflect-metadata";

const candidateEnvPaths = [
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), "apps/api/.env.local"),
  path.resolve(__dirname, "../.env.local"),
  path.resolve(__dirname, "../../.env.local"),
  path.resolve(__dirname, "../../../apps/api/.env.local"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "apps/api/.env"),
  path.resolve(__dirname, "../.env"),
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../../../apps/api/.env"),
];

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger, loggerWithConfig, type LoggerConfig } from "@yuva-devlab/logger";
import { AppStatus, createAppKillSwitchMiddleware } from "@yuva-devlab/auth-server";
import type { IncomingMessage, ServerResponse } from "node:http";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { loadApiConfig, STUDIO_CONFIG } from "./config/api-config";

async function bootstrap(): Promise<void> {
  const config = loadApiConfig();
  const logConfig: LoggerConfig = {
    enabled: config.logEnabled,
    level: config.logLevel,
  };
  const appLogger = loggerWithConfig(new Logger("API"), logConfig);

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { logger: appLogger },
  );

  app.setGlobalPrefix(STUDIO_CONFIG.API_PREFIX, {
    exclude: [
      STUDIO_CONFIG.HEALTH_ROUTE,
      `${STUDIO_CONFIG.API_PREFIX}/${STUDIO_CONFIG.HEALTH_ROUTE}`,
    ],
  });

  app.enableCors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  let lastStatus = AppStatus.ACTIVE;
  let lastCheckTime = 0;
  const STATUS_CACHE_TTL_MS = 3000;
  const killSwitch = createAppKillSwitchMiddleware(async () => {
    const now = Date.now();
    if (now - lastCheckTime < STATUS_CACHE_TTL_MS) return lastStatus;
    try {
      const portalBase = config.portalApiUrl.replace(/\/+$/, "");
      const res = await fetch(
        `${portalBase}/api/v1/platform/apps/${encodeURIComponent(config.appId)}/status`,
        { signal: AbortSignal.timeout(1500), headers: { Accept: "application/json" } },
      );
      if (res.ok) {
        const data = (await res.json()) as { status?: string; isActive?: boolean };
        lastStatus =
          data.status === "INACTIVE" || data.isActive === false
            ? AppStatus.INACTIVE
            : data.status === "MAINTENANCE"
              ? AppStatus.MAINTENANCE
              : AppStatus.ACTIVE;
        lastCheckTime = now;
      }
    } catch {
      // Fail open in standalone/offline development scenarios
    }
    return lastStatus;
  });

  app.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const rawUrl = req.url || "/";
    if (rawUrl.includes("/health") || rawUrl.includes("/api/docs")) {
      return next();
    }
    const allowed = await killSwitch(req, res);
    if (allowed) next();
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("DevLab AI Studio API")
    .setDescription("Central AI Gateway, Agent Control Plane, Cost Ledger, and App Analytics")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(STUDIO_CONFIG.DOCS_ROUTE, app, document);

  await app.listen(config.port, "0.0.0.0");
  appLogger.info(`[bootstrap] DevLab AI Studio API running on http://0.0.0.0:${config.port}`);
}

void bootstrap();
