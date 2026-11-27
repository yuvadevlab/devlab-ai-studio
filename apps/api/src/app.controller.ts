import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("health")
@Controller("health")
export class AppController {
  @Get()
  @ApiOperation({ summary: "Service health probe" })
  getHealth() {
    return {
      status: "ok",
      service: "devlab-ai-studio-api",
      timestamp: new Date().toISOString(),
    };
  }
}
