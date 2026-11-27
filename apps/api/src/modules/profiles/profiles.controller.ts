import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  resolveProfileOverridesSchema,
  type AppAiPolicyOverrides,
} from "@devlab-ai-studio/validation";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { ProfilesService } from "./profiles.service";

@ApiTags("profiles")
@Controller("apps/:appSlug/profiles")
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  @ApiOperation({ summary: "List AI profiles configured for a consumer app" })
  listProfiles(@Param("appSlug") appSlug: string) {
    return this.profilesService.listProfiles(appSlug);
  }

  @Post(":profileSlug/resolve")
  @ApiOperation({
    summary: "Resolve effective model, fallback chain, and clamped policy for a profile",
  })
  resolveProfile(
    @Param("appSlug") appSlug: string,
    @Param("profileSlug") profileSlug: string,
    @Body(new ZodValidationPipe(resolveProfileOverridesSchema)) overrides?: AppAiPolicyOverrides,
  ) {
    return this.profilesService.resolveProfile(appSlug, profileSlug, overrides);
  }
}
