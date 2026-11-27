import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import {
  AppAiPolicySchema,
  resolveEffectivePolicy,
  type AppAiPolicyOverrides,
  type CreateProfileVersionInput,
  type PublishProfileVersionInput,
  type ResolvedModelTarget,
  type ResolvedProfileResponse,
} from "@devlab-ai-studio/validation";
import { CryptoService } from "../../common/crypto/crypto.service";
import { ProfilesRepository } from "./profiles.repository";

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(
    private readonly repository: ProfilesRepository,
    private readonly crypto: CryptoService,
  ) {}

  async listProfiles(appSlug: string) {
    this.logger.info(`[listProfiles] Listing profiles for app "${appSlug}"`);
    const app = await this.repository.findAppBySlug(appSlug);
    if (!app) throw new NotFoundException(`Consumer app "${appSlug}" not found`);
    return this.repository.findProfilesByAppId(app.id);
  }

  async createProfileVersion(appSlug: string, input: CreateProfileVersionInput) {
    this.logger.info(`[createProfileVersion] Creating version for "${appSlug}/${input.slug}"`);
    const app = await this.repository.findAppBySlug(appSlug);
    if (!app) throw new NotFoundException(`Consumer app "${appSlug}" not found`);
    return this.repository.createProfileVersion(app.id, input);
  }

  async publishVersion(appSlug: string, profileSlug: string, input: PublishProfileVersionInput) {
    this.logger.info(
      `[publishVersion] Publishing "${appSlug}/${profileSlug}" -> ${input.versionId}`,
    );
    const app = await this.repository.findAppBySlug(appSlug);
    if (!app) throw new NotFoundException(`Consumer app "${appSlug}" not found`);

    const profile = await this.repository.findProfileWithVersions(app.id, profileSlug);
    if (!profile) {
      throw new NotFoundException(`Profile "${profileSlug}" not found for app "${appSlug}"`);
    }

    const exists = profile.versions.some((v) => v.id === input.versionId);
    if (!exists) {
      throw new BadRequestException(
        `Version "${input.versionId}" does not belong to "${profileSlug}"`,
      );
    }

    return this.repository.publishVersion(profile.id, input.versionId);
  }

  async resolveProfile(
    appSlug: string,
    profileSlug: string,
    overrides?: AppAiPolicyOverrides,
  ): Promise<ResolvedProfileResponse> {
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

    const fallbackRecords = await this.repository.findModelsByIds(activeVersion.fallbackModelIds);
    const fallbackById = new Map(fallbackRecords.map((model) => [model.id, model]));
    const orderedFallbacks = activeVersion.fallbackModelIds
      .map((id) => fallbackById.get(id))
      .filter((model): model is NonNullable<typeof model> => Boolean(model));

    const toModelTarget = (model: typeof activeVersion.primaryModel): ResolvedModelTarget => ({
      id: model.id,
      providerId: model.provider.id,
      provider: model.provider.slug,
      modelId: model.modelId,
      baseUrl: model.provider.baseUrl,
      apiKey: this.decryptProviderKey(model.provider.encryptedApiKey),
      inputCostPer1M: Number(model.inputCostPer1M),
      outputCostPer1M: Number(model.outputCostPer1M),
    });

    return {
      appId: app.id,
      profileId: profile.id,
      systemPrompt: activeVersion.systemPrompt,
      policy: resolveEffectivePolicy(basePolicy, overrides),
      primaryModel: toModelTarget(activeVersion.primaryModel),
      fallbackModels: orderedFallbacks.map(toModelTarget),
      fallbackModelIds: activeVersion.fallbackModelIds,
    };
  }

  private decryptProviderKey(encryptedApiKey: string | null): string | undefined {
    if (!encryptedApiKey) return undefined;
    try {
      return this.crypto.decryptSecret(encryptedApiKey);
    } catch (error) {
      this.logger.warn(
        `[decryptProviderKey] Failed to decrypt provider key: ${(error as Error).message}`,
      );
      return undefined;
    }
  }
}
