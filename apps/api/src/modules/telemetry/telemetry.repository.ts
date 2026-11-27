import { Injectable } from "@nestjs/common";
import { TelemetryEventType } from "@devlab-ai-studio/shared-types";
import type { TelemetryEvent } from "@devlab-ai-studio/validation";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class TelemetryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async ingestBatch(events: TelemetryEvent[]) {
    const runs = events.filter((e) => e.type === TelemetryEventType.RUN_RECORDED);
    const attempts = events.filter((e) => e.type === TelemetryEventType.ATTEMPT_RECORDED);
    const tools = events.filter((e) => e.type === TelemetryEventType.TOOL_RECORDED);

    await this.prisma.client.$transaction(async (tx) => {
      if (runs.length > 0) {
        await tx.agentRun.createMany({
          data: runs.map((r) => ({
            id: r.runId,
            appId: r.appId,
            profileId: r.profileId,
            profileVersion: r.profileVersion,
            userId: r.userId,
            conversationId: r.conversationId,
            status: r.status,
            durationMs: r.durationMs,
            tokensIn: r.tokensIn,
            tokensOut: r.tokensOut,
            reasoningTokens: r.reasoningTokens,
            totalCostUsd: r.totalCostUsd,
            errorCode: r.errorCode,
            completedAt: new Date(),
          })),
          skipDuplicates: true,
        });
      }

      if (attempts.length > 0) {
        await tx.llmAttempt.createMany({
          data: attempts.map((a) => ({
            runId: a.runId,
            providerId: a.providerId,
            modelId: a.modelId,
            attemptIndex: a.attemptIndex,
            isFallback: a.isFallback,
            ttftMs: a.ttftMs,
            latencyMs: a.latencyMs,
            status: a.status,
            errorCode: a.errorCode,
            tokensIn: a.tokensIn,
            tokensOut: a.tokensOut,
            costUsd: a.costUsd,
          })),
        });
      }

      if (tools.length > 0) {
        await tx.toolExecution.createMany({
          data: tools.map((t) => ({
            runId: t.runId,
            toolName: t.toolName,
            durationMs: t.durationMs,
            ok: t.ok,
            errorCode: t.errorCode,
          })),
        });
      }
    });

    return {
      ingested: events.length,
      runs: runs.length,
      attempts: attempts.length,
      tools: tools.length,
    };
  }
}
