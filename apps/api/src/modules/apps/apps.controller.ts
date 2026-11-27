import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { StudioApiRoute } from "@devlab-ai-studio/shared-types";
import {
  createConsumerAppSchema,
  updateConsumerAppSchema,
  verifyAppKeySchema,
  type CreateConsumerAppInput,
  type UpdateConsumerAppInput,
  type VerifyAppKeyInput,
} from "@devlab-ai-studio/validation";
import { Public } from "../../common/auth/public.decorator";
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

  @Patch(":slug")
  @ApiOperation({ summary: "Update consumer app settings, budget, or active status" })
  updateApp(
    @Param("slug") slug: string,
    @Body(new ZodValidationPipe(updateConsumerAppSchema)) body: UpdateConsumerAppInput,
  ) {
    return this.appsService.updateApp(slug, body);
  }

  @Delete(":slug")
  @ApiOperation({ summary: "Delete a registered consumer app" })
  deleteApp(@Param("slug") slug: string) {
    return this.appsService.deleteApp(slug);
  }

  @Post(`:slug/${StudioApiRoute.APPS_ROTATE_KEY}`)
  @ApiOperation({ summary: "Rotate gateway API key for a consumer app" })
  rotateAppKey(@Param("slug") slug: string) {
    return this.appsService.rotateAppKey(slug);
  }

  @Public()
  @Post(StudioApiRoute.APPS_VERIFY_KEY)
  @ApiOperation({ summary: "Verify a consumer app gateway key and return app metadata" })
  verifyAppKey(@Body(new ZodValidationPipe(verifyAppKeySchema)) body: VerifyAppKeyInput) {
    return this.appsService.verifyAppKey(body.appKey);
  }
}
