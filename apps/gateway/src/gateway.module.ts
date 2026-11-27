import { Controller, Get, Module } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { STUDIO_CONFIG, StudioApiRoute } from "@devlab-ai-studio/shared-types";
import { ProfileCacheService } from "./common/cache/profile-cache.service";
import { StudioHttpClient } from "./common/http/studio-http.client";
import { TelemetryPublisherService } from "./common/telemetry/telemetry-publisher.service";
import { GatewayController } from "./modules/gateway/gateway.controller";
import { GatewayService } from "./modules/gateway/gateway.service";

@ApiTags(StudioApiRoute.HEALTH)
@Controller()
class GatewayHealthController {
  @Get([StudioApiRoute.HEALTH, `${STUDIO_CONFIG.API_PREFIX}/${StudioApiRoute.HEALTH}`])
  @ApiOperation({ summary: "Gateway health probe (dual /health and /api/v1/health support)" })
  getHealth() {
    return {
      status: "ok",
      service: "devlab-ai-studio-gateway",
      timestamp: new Date().toISOString(),
    };
  }
}

@Module({
  controllers: [GatewayHealthController, GatewayController],
  providers: [StudioHttpClient, ProfileCacheService, TelemetryPublisherService, GatewayService],
})
export class GatewayAppModule {}
