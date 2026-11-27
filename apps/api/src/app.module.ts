import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AppController } from "./app.controller";
import { PortalAuthGuard } from "./common/auth/portal-auth.guard";
import { CryptoModule } from "./common/crypto/crypto.module";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { AppsModule } from "./modules/apps/apps.module";
import { ProfilesModule } from "./modules/profiles/profiles.module";
import { ProvidersModule } from "./modules/providers/providers.module";
import { TelemetryModule } from "./modules/telemetry/telemetry.module";

@Module({
  imports: [
    CryptoModule,
    PrismaModule,
    ProvidersModule,
    AppsModule,
    ProfilesModule,
    AnalyticsModule,
    TelemetryModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: PortalAuthGuard }],
})
export class AppModule {}
