import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { Logger } from "@yuva-devlab/logger";
import {
  GatewayLogLevel,
  GatewayStreamEventType,
  StudioRunStatus,
  TelemetryEventType,
  type GatewayStreamEvent,
} from "@devlab-ai-studio/shared-types";
import type { GatewayRunRequest } from "@devlab-ai-studio/validation";
import { ProfileCacheService } from "../../common/cache/profile-cache.service";
import { TelemetryPublisherService } from "../../common/telemetry/telemetry-publisher.service";

/** Executes AI runs via cached app profiles and emits non-blocking telemetry. */
@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(
    private readonly profileCache: ProfileCacheService,
    private readonly telemetry: TelemetryPublisherService,
  ) {}

  async streamRun(
    input: GatewayRunRequest,
    emitFrame: (event: GatewayStreamEvent) => void,
    signal: AbortSignal,
  ): Promise<void> {
    const startedAt = Date.now();
    const runId = randomUUID();
    this.logger.info(`[streamRun] Starting run ${runId.slice(0, 8)} for ${input.appSlug}`);

    const resolved = await this.profileCache.resolve(
      input.appSlug,
      input.profileSlug,
      input.overrides,
    );

    if (signal.aborted) return;

    emitFrame({ type: GatewayStreamEventType.RUN, runId });
    emitFrame({
      type: GatewayStreamEventType.LOG,
      level: GatewayLogLevel.SYS,
      message: `Initialized ${resolved.primaryModel.provider} (${resolved.primaryModel.modelId})`,
      detail: `profile=${resolved.policy.profileSlug}@v${resolved.policy.profileVersion}`,
    });

    emitFrame({
      type: GatewayStreamEventType.TOKEN,
      content: `Gateway ready for ${input.appSlug} (${resolved.primaryModel.modelId}).`,
    });
    emitFrame({ type: GatewayStreamEventType.DONE });

    this.telemetry.publish({
      type: TelemetryEventType.RUN_RECORDED,
      runId,
      appId: resolved.appId,
      profileId: resolved.profileId,
      profileVersion: resolved.policy.profileVersion,
      userId: input.userId,
      status: StudioRunStatus.SUCCESS,
      durationMs: Date.now() - startedAt,
      tokensIn: 0,
      tokensOut: 0,
      reasoningTokens: 0,
      totalCostUsd: 0,
    });
  }
}
