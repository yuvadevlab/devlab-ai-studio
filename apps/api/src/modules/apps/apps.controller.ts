import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { StudioApiRoute } from "@devlab-ai-studio/shared-types";
import { createConsumerAppSchema, type CreateConsumerAppInput } from "@devlab-ai-studio/validation";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { AppsService } from "./apps.service";

@ApiTags(StudioApiRoute.APPS)
@Controller(StudioApiRoute.APPS)
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Get()
  @ApiOperation({ summary: "List registered consumer apps" })
  listApps() {
    return this.appsService.listApps();
  }

  @Post()
  @ApiOperation({ summary: "Register a new consumer app and issue a one-time API key" })
  createApp(@Body(new ZodValidationPipe(createConsumerAppSchema)) body: CreateConsumerAppInput) {
    return this.appsService.createApp(body);
  }
}
