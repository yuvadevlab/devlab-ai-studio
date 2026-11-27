import { Injectable, NotFoundException } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import {
  AppAiPolicySchema,
  resolveEffectivePolicy,
  type AppAiPolicyOverrides,
} from "@devlab-ai-studio/validation";
import { ProfilesRepository } from "./profiles.repository";

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(private readonly repository: ProfilesRepository) {}

  async listProfiles(appSlug: string) {
    this.logger.info(`[listProfiles] Listing profiles for app "${appSlug}"`);
    const app = await this.repository.findAppBySlug(appSlug);
    if (!app) throw new NotFoundException(`Consumer app "${appSlug}" not found`);
    return this.repository.findProfilesByAppId(app.id);
  }

  async resolveProfile(appSlug: string, profileSlug: string, overrides?: AppAiPolicyOverrides) {
    this.logger.info(`[resolveProfile] Resolving "${appSlug}/${profileSlug}"`);
    const app = await this.repository.findAppBySlug(appSlug);
    if (!app) throw new NotFoundException(`Consumer app "${appSlug}" not found`);

    const profile = await this.repository.findProfileWithVersions(app.id, profileSlug);
    if (!profile || profile.versions.length === 0) {
      throw new NotFoundException(`Profile "${profileSlug}" not found for app "${appSlug}"`);
    }

    const activeVersion =
      profile.versions.find((v) => v.id === profile.publishedVersionId) ?? profile.versions[0];

    const basePolicy = AppAiPolicySchema.parse({
      appId: app.slug,
      profileSlug: profile.slug,
      profileVersion: activeVersion.version,
      creativityPreset: activeVersion.creativityPreset,
      temperature: activeVersion.temperature,
      maxTurns: activeVersion.maxTurns,
      maxTokens: activeVersion.maxTokens,
      enabledToolNamespaces: activeVersion.enabledToolNamespaces,
      features: activeVersion.featureFlags,
    });

    return {
      policy: resolveEffectivePolicy(basePolicy, overrides),
      primaryModel: {
        provider: activeVersion.primaryModel.provider.slug,
        modelId: activeVersion.primaryModel.modelId,
        baseUrl: activeVersion.primaryModel.provider.baseUrl,
      },
      fallbackModelIds: activeVersion.fallbackModelIds,
    };
  }
}
