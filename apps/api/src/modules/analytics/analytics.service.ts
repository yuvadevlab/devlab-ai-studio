import { Injectable, NotFoundException } from "@nestjs/common";
import { FeedbackRating, RunOutcomeStatus } from "@devlab-ai-studio/database";
import { Logger } from "@yuva-devlab/logger";
import { AnalyticsRepository } from "./analytics.repository";

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly repository: AnalyticsRepository) {}

  async getSummary(appSlug: string) {
    this.logger.info(`[getSummary] Computing analytics summary for "${appSlug}"`);
    const app = await this.repository.findAppBySlug(appSlug);
    if (!app) throw new NotFoundException(`Consumer app "${appSlug}" not found`);

    const [runs, feedbackCounts] = await Promise.all([
      this.repository.aggregateRunsByStatus(app.id),
      this.repository.aggregateFeedbackByRating(app.id),
    ]);

    const totalRuns = runs.reduce((acc, r) => acc + r._count._all, 0);
    const successRuns = runs
      .filter(
        (r) => r.status === RunOutcomeStatus.SUCCESS || r.status === RunOutcomeStatus.RECOVERED,
      )
      .reduce((acc, r) => acc + r._count._all, 0);
    const failedRuns = runs.find((r) => r.status === RunOutcomeStatus.FAILED)?._count._all ?? 0;

    return {
      appSlug: app.slug,
      totalRuns,
      successRate: totalRuns > 0 ? Number((successRuns / totalRuns).toFixed(4)) : 1,
      failedRuns,
      totalCostUsd: runs.reduce((acc, r) => acc + Number(r._sum.totalCostUsd ?? 0), 0),
      totalTokensIn: runs.reduce((acc, r) => acc + (r._sum.tokensIn ?? 0), 0),
      totalTokensOut: runs.reduce((acc, r) => acc + (r._sum.tokensOut ?? 0), 0),
      feedback: {
        up: feedbackCounts.find((f) => f.rating === FeedbackRating.UP)?._count._all ?? 0,
        down: feedbackCounts.find((f) => f.rating === FeedbackRating.DOWN)?._count._all ?? 0,
      },
    };
  }
}
