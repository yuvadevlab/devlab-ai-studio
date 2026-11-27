import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { StudioApiRoute, buildStudioApiUrl } from "@devlab-ai-studio/shared-types";
import type { AppAiPolicyOverrides, ResolvedProfileResponse } from "@devlab-ai-studio/validation";
import { loadGatewayConfig } from "../../config/gateway-config";
import { GATEWAY_LIMITS } from "../../config/gateway.constants";
import { StudioHttpClient } from "../http/studio-http.client";

interface CacheEntry {
  value: ResolvedProfileResponse;
  expiresAt: number;
}

/**
 * Bounded TTL cache with singleflight request coalescing for resolved AI profiles.
 * Prevents Control Plane Postgres queries on the live SSE hot path and collapses
 * concurrent cache misses for the same profile into a single upstream request.
 */
@Injectable()
export class ProfileCacheService {
  private readonly logger = new Logger(ProfileCacheService.name);
  private readonly config = loadGatewayConfig();
  private readonly cache = new Map<string, CacheEntry>();
  private readonly inFlight = new Map<string, Promise<ResolvedProfileResponse>>();

  constructor(private readonly httpClient: StudioHttpClient) {}

  async resolve(
    appSlug: string,
    profileSlug: string,
    overrides?: AppAiPolicyOverrides,
  ): Promise<ResolvedProfileResponse> {
    const cacheKey = this.buildCacheKey(appSlug, profileSlug, overrides);
    const now = Date.now();
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    const pending = this.inFlight.get(cacheKey);
    if (pending) {
      return pending;
    }

    const request = this.fetchAndStore(cacheKey, appSlug, profileSlug, overrides).finally(() => {
      this.inFlight.delete(cacheKey);
    });
    this.inFlight.set(cacheKey, request);
    return request;
  }

  private async fetchAndStore(
    cacheKey: string,
    appSlug: string,
    profileSlug: string,
    overrides?: AppAiPolicyOverrides,
  ): Promise<ResolvedProfileResponse> {
    const url = buildStudioApiUrl(
      this.config.studioApiUrl,
      StudioApiRoute.APPS,
      appSlug,
      StudioApiRoute.PROFILES,
      profileSlug,
      StudioApiRoute.PROFILE_RESOLVE,
    );

    const payload = await this.httpClient.postJson<AppAiPolicyOverrides, ResolvedProfileResponse>(
      url,
      overrides ?? {},
    );

    if (this.cache.size >= GATEWAY_LIMITS.MAX_CACHE_ENTRIES) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(cacheKey, {
      value: payload,
      expiresAt: Date.now() + this.config.profileCacheTtlMs,
    });
    this.logger.info(`[fetchAndStore] Cached profile ${appSlug}/${profileSlug}`);
    return payload;
  }

  private buildCacheKey(
    appSlug: string,
    profileSlug: string,
    overrides?: AppAiPolicyOverrides,
  ): string {
    if (!overrides) return `${appSlug}:${profileSlug}:default`;
    const sortedEntries = Object.entries(overrides).sort(([a], [b]) => a.localeCompare(b));
    return `${appSlug}:${profileSlug}:${JSON.stringify(sortedEntries)}`;
  }
}
