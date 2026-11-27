import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { StudioApiRoute } from "@devlab-ai-studio/shared-types";
import {
  createProfileVersionSchema,
  publishProfileVersionSchema,
  resolveProfileOverridesSchema,
  type AppAiPolicyOverrides,
  type CreateProfileVersionInput,
  type PublishProfileVersionInput,
} from "@devlab-ai-studio/validation";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { ProfilesService } from "./profiles.service";

@ApiTags(StudioApiRoute.PROFILES)
@Controller(`${StudioApiRoute.APPS}/:appSlug/${StudioApiRoute.PROFILES}`)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  @ApiOperation({ summary: "List AI profiles and recent versions for a consumer app" })
  listProfiles(@Param("appSlug") appSlug: string) {
    return this.profilesService.listProfiles(appSlug);
  }

  @Post()
  @ApiOperation({ summary: "Create a new immutable AI profile version (and optionally publish)" })
  createProfileVersion(
    @Param("appSlug") appSlug: string,
    @Body(new ZodValidationPipe(createProfileVersionSchema)) body: CreateProfileVersionInput,
  ) {
    return this.profilesService.createProfileVersion(appSlug, body);
  }

  @Patch(":profileSlug/publish")
  @ApiOperation({ summary: "Publish or roll back a profile to a specific immutable version" })
  publishVersion(
    @Param("appSlug") appSlug: string,
    @Param("profileSlug") profileSlug: string,
    @Body(new ZodValidationPipe(publishProfileVersionSchema)) body: PublishProfileVersionInput,
  ) {
    return this.profilesService.publishVersion(appSlug, profileSlug, body);
  }

  @Post(`:profileSlug/${StudioApiRoute.PROFILE_RESOLVE}`)
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
