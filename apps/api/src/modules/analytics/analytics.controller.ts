import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { StudioApiRoute } from "@devlab-ai-studio/shared-types";
import { submitRunFeedbackSchema, type SubmitRunFeedbackInput } from "@devlab-ai-studio/validation";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { AnalyticsService } from "./analytics.service";

@ApiTags(StudioApiRoute.ANALYTICS)
@Controller(`${StudioApiRoute.APPS}/:appSlug/${StudioApiRoute.ANALYTICS}`)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get(StudioApiRoute.ANALYTICS_SUMMARY)
  @ApiOperation({ summary: "Get tenant performance, cost, success ratio, and feedback summary" })
  getSummary(@Param("appSlug") appSlug: string) {
    return this.analyticsService.getSummary(appSlug);
  }

  @Get(StudioApiRoute.ANALYTICS_RUNS)
  @ApiOperation({ summary: "List recent runs, attempts, and user feedback for a consumer app" })
  listRuns(@Param("appSlug") appSlug: string) {
    return this.analyticsService.listRecentRuns(appSlug);
  }

  @Post(StudioApiRoute.FEEDBACK)
  @ApiOperation({ summary: "Submit UP/DOWN quality feedback for a completed run" })
  submitFeedback(
    @Param("appSlug") appSlug: string,
    @Body(new ZodValidationPipe(submitRunFeedbackSchema)) body: SubmitRunFeedbackInput,
  ) {
    return this.analyticsService.submitFeedback(appSlug, body);
  }
}
