import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PrismaModule } from "./common/prisma/prisma.module";
import { ProvidersModule } from "./modules/providers/providers.module";
import { ProfilesModule } from "./modules/profiles/profiles.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";

@Module({
  imports: [PrismaModule, ProvidersModule, ProfilesModule, AnalyticsModule],
  controllers: [AppController],
})
export class AppModule {}
