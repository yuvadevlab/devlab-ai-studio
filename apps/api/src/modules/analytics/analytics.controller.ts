import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";

@ApiTags("analytics")
@Controller("apps/:appSlug/analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("summary")
  @ApiOperation({ summary: "Get tenant performance, cost, success ratio, and feedback summary" })
  getSummary(@Param("appSlug") appSlug: string) {
    return this.analyticsService.getSummary(appSlug);
  }
}
