import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import "reflect-metadata";

const candidateEnvPaths = [
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), "apps/gateway/.env.local"),
  path.resolve(__dirname, "../.env.local"),
  path.resolve(__dirname, "../../.env.local"),
  path.resolve(__dirname, "../../../apps/gateway/.env.local"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "apps/gateway/.env"),
  path.resolve(__dirname, "../.env"),
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../../../apps/gateway/.env"),
];

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { STUDIO_CONFIG } from "@devlab-ai-studio/shared-types";
import { Logger, loggerWithConfig, type LoggerConfig } from "@yuva-devlab/logger";
import { loadGatewayConfig } from "./config/gateway-config";
import { GatewayAppModule } from "./gateway.module";

async function bootstrap(): Promise<void> {
  const config = loadGatewayConfig();
  const logConfig: LoggerConfig = {
    enabled: config.logEnabled,
    level: config.logLevel,
  };
  const appLogger = loggerWithConfig(new Logger("GATEWAY"), logConfig);

  const app = await NestFactory.create<NestFastifyApplication>(
    GatewayAppModule,
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
    methods: ["GET", "POST", "OPTIONS"],
  });

  await app.listen(config.port, "0.0.0.0");
  appLogger.info(`[bootstrap] DevLab AI Gateway running on http://0.0.0.0:${config.port}`);
}

void bootstrap();
