import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { Logger } from "@yuva-devlab/logger";
import { LlmRole } from "@yuva-devlab/agent-protocol";
import {
  GatewayLogLevel,
  GatewayStreamEventType,
  StudioAttemptStatus,
  StudioRunStatus,
  TelemetryEventType,
  type GatewayStreamEvent,
} from "@devlab-ai-studio/shared-types";
import type { GatewayRunRequest } from "@devlab-ai-studio/validation";
import { ProfileCacheService } from "../../common/cache/profile-cache.service";
import { TelemetryPublisherService } from "../../common/telemetry/telemetry-publisher.service";
import { executeModelStream } from "./llm-stream.executor";

/** Executes AI runs via cached app profiles, streams real LLM responses, and emits telemetry. */
@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(
    private readonly profileCache: ProfileCacheService,
    private readonly telemetry: TelemetryPublisherService,
  ) {}

  async streamRun(
    input: GatewayRunRequest & { appSlug: string },
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

    const messages = input.messages?.length
      ? input.messages
      : [{ role: LlmRole.USER, content: input.prompt ?? "" }];

    const candidates = [resolved.primaryModel, ...resolved.fallbackModels];
    let succeeded = false;
    let totalTokensIn = 0;
    let totalTokensOut = 0;
    let totalCostUsd = 0;
    let lastErrorMessage = "All configured models failed";

    for (let index = 0; index < candidates.length; index++) {
      if (signal.aborted) break;
      const target = candidates[index];
      const attemptStart = Date.now();

      try {
        const result = await executeModelStream({
          target,
          systemPrompt: resolved.systemPrompt,
          messages,
          temperature: resolved.policy.temperature,
          maxTokens: resolved.policy.maxTokens,
          signal,
          onToken: (content) => emitFrame({ type: GatewayStreamEventType.TOKEN, content }),
          onReasoning: resolved.policy.features.showReasoning
            ? (content) => emitFrame({ type: GatewayStreamEventType.REASONING, content })
            : undefined,
        });

        totalTokensIn += result.tokensIn;
        totalTokensOut += result.tokensOut;
        totalCostUsd += result.costUsd;
        succeeded = true;

        this.telemetry.publish({
          type: TelemetryEventType.ATTEMPT_RECORDED,
          runId,
          providerId: target.providerId,
          modelId: target.id,
          attemptIndex: index,
          isFallback: index > 0,
          ttftMs: result.ttftMs,
          latencyMs: result.latencyMs,
          status: StudioAttemptStatus.SUCCESS,
          tokensIn: result.tokensIn,
          tokensOut: result.tokensOut,
          costUsd: result.costUsd,
        });
        break;
      } catch (error) {
        const err = error as Error & { status?: number };
        lastErrorMessage = err.message || "Model execution failed";
        const attemptStatus =
          err.status === 429 ? StudioAttemptStatus.RATE_LIMITED : StudioAttemptStatus.ERROR;

        emitFrame({
          type: GatewayStreamEventType.LOG,
          level: GatewayLogLevel.ERR,
          message: `Attempt ${index + 1} (${target.modelId}) failed: ${lastErrorMessage}`,
        });

        this.telemetry.publish({
          type: TelemetryEventType.ATTEMPT_RECORDED,
          runId,
          providerId: target.providerId,
          modelId: target.id,
          attemptIndex: index,
          isFallback: index > 0,
          latencyMs: Date.now() - attemptStart,
          status: attemptStatus,
          errorCode: err.status ? String(err.status) : undefined,
          tokensIn: 0,
          tokensOut: 0,
          costUsd: 0,
        });
      }
    }

    if (!succeeded && !signal.aborted) {
      emitFrame({ type: GatewayStreamEventType.ERROR, error: lastErrorMessage });
    }
    emitFrame({ type: GatewayStreamEventType.DONE });

    const finalStatus = signal.aborted
      ? StudioRunStatus.CANCELLED
      : succeeded
        ? candidates.length > 1 && totalCostUsd >= 0
          ? StudioRunStatus.SUCCESS
          : StudioRunStatus.SUCCESS
        : StudioRunStatus.FAILED;

    this.telemetry.publish({
      type: TelemetryEventType.RUN_RECORDED,
      runId,
      appId: resolved.appId,
      profileId: resolved.profileId,
      profileVersion: resolved.policy.profileVersion,
      userId: input.userId ?? "studio-user",
      status: finalStatus,
      durationMs: Date.now() - startedAt,
      tokensIn: totalTokensIn,
      tokensOut: totalTokensOut,
      reasoningTokens: 0,
      totalCostUsd,
      errorCode: succeeded ? undefined : "GATEWAY_EXECUTION_FAILED",
    });
  }
}
