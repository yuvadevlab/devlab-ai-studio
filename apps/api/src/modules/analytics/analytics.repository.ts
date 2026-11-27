import { Injectable } from "@nestjs/common";
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
}
