import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { STUDIO_CONFIG, StudioApiRoute } from "@devlab-ai-studio/shared-types";
import { Public } from "./common/auth/public.decorator";

@ApiTags(StudioApiRoute.HEALTH)
@Controller()
export class AppController {
  @Public()
  @Get([StudioApiRoute.HEALTH, `${STUDIO_CONFIG.API_PREFIX}/${StudioApiRoute.HEALTH}`])
  @ApiOperation({ summary: "Service health probe (dual /health and /api/v1/health support)" })
  getHealth() {
    return {
      status: "ok",
      service: "devlab-ai-studio-api",
      timestamp: new Date().toISOString(),
    };
  }
}
