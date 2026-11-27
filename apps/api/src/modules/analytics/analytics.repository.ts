import { Injectable } from "@nestjs/common";
import { CATALOG_BOUNDS } from "@devlab-ai-studio/shared-types";
import type { SubmitRunFeedbackInput } from "@devlab-ai-studio/validation";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAppBySlug(slug: string) {
    return this.prisma.client.consumerApp.findUnique({ where: { slug } });
  }

  aggregateRunsByStatus(appId: string) {
    return this.prisma.client.agentRun.groupBy({
      by: ["status"],
      where: { appId },
      _count: { _all: true },
      _sum: { totalCostUsd: true, tokensIn: true, tokensOut: true },
      _avg: { durationMs: true },
    });
  }

  aggregateFeedbackByRating(appId: string) {
    return this.prisma.client.runFeedback.groupBy({
      by: ["rating"],
      where: { run: { appId } },
      _count: { _all: true },
    });
  }

  findRecentRuns(appId: string, limit = CATALOG_BOUNDS.DEFAULT_RECENT_RUNS_LIMIT) {
    return this.prisma.client.agentRun.findMany({
      where: { appId },
      include: {
        profile: { select: { slug: true, name: true } },
        attempts: {
          orderBy: { attemptIndex: "asc" },
          include: {
            model: { select: { modelId: true, displayName: true } },
            provider: { select: { slug: true, name: true } },
          },
        },
        feedbacks: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  findRunForApp(runId: string, appId: string) {
    return this.prisma.client.agentRun.findFirst({
      where: { id: runId, appId },
      select: { id: true },
    });
  }

  createFeedback(input: SubmitRunFeedbackInput) {
    return this.prisma.client.runFeedback.create({
      data: {
        runId: input.runId,
        userId: input.userId,
        rating: input.rating,
        comment: input.comment,
      },
    });
  }
}
