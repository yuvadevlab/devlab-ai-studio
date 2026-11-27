import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger, loggerWithConfig, type LoggerConfig } from "@yuva-devlab/logger";
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
