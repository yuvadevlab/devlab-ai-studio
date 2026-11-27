"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  Clock3,
  Cpu,
  EmptyState,
  LoadingState,
  StudioKpiCard,
  StudioModelBars,
  StudioPageHeader,
  StudioPanel,
  StudioStatusPill,
  StudioStatusTone,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Workflow,
  type StudioModelBarItem,
} from "@devlab-ai-studio/ui";
import { StudioQueryKey, StudioWebRoute } from "@/constants/routes.constants";
import { STUDIO_WEB_COPY } from "@/constants/ui-copy";
import { useActiveApp } from "@/lib/active-app";
import {
  fetchAnalyticsSummary,
  fetchApps,
  fetchProviders,
  fetchRecentRuns,
  type StudioAgentRun,
} from "@/lib/studio-api";

function resolveRunTone(status: string): StudioStatusTone {
  const upper = status.toUpperCase();
  if (upper === "SUCCESS" || upper === "RECOVERED") return StudioStatusTone.SUCCESS;
  if (upper === "RUNNING" || upper === "STREAMING") return StudioStatusTone.STREAMING;
  return StudioStatusTone.ERROR;
}

function resolveRunModel(run: StudioAgentRun): string {
  const lastAttempt = run.attempts?.[run.attempts.length - 1];
  return lastAttempt?.model?.modelId ?? run.finalModelId ?? "—";
}

/** Gateway overview feature: 4 KPI cards, recent runs table, and top models by cost. */
export function OverviewFeature() {
  const { activeAppSlug } = useActiveApp();
  const { data: apps = [] } = useQuery({ queryKey: [StudioQueryKey.APPS], queryFn: fetchApps });
  const { data: providers = [] } = useQuery({
    queryKey: [StudioQueryKey.PROVIDERS],
    queryFn: fetchProviders,
  });

  const targetSlug = activeAppSlug || apps[0]?.slug || "";

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: [StudioQueryKey.ANALYTICS_SUMMARY, targetSlug],
    queryFn: () => fetchAnalyticsSummary(targetSlug),
    enabled: Boolean(targetSlug),
  });

  const { data: runs = [], isLoading: runsLoading } = useQuery({
    queryKey: [StudioQueryKey.RECENT_RUNS, targetSlug],
    queryFn: () => fetchRecentRuns(targetSlug),
    enabled: Boolean(targetSlug),
  });

  const topModels = useMemo<StudioModelBarItem[]>(() => {
    const byModel = new Map<string, { provider: string; cost: number; requests: number }>();
    for (const run of runs) {
      const lastAttempt = run.attempts?.[run.attempts.length - 1];
      const modelId = lastAttempt?.model?.modelId ?? run.finalModelId;
      if (!modelId) continue;
      const providerName = lastAttempt?.provider?.name ?? "gateway";
      const prev = byModel.get(modelId) ?? { provider: providerName, cost: 0, requests: 0 };
      prev.cost += Number(run.totalCostUsd ?? 0);
      prev.requests += 1;
      byModel.set(modelId, prev);
    }

    const sorted = Array.from(byModel.entries()).sort((a, b) => b[1].cost - a[1].cost);
    const maxCost = sorted[0]?.[1].cost || 1;
    return sorted.slice(0, 5).map(([name, entry]) => ({
      name,
      provider: entry.provider,
      costLabel: `$${entry.cost.toFixed(4)}`,
      requestsLabel: `${entry.requests} req`,
      sharePercent: (entry.cost / maxCost) * 100,
    }));
  }, [runs]);

  const activeAppsCount = apps.filter((app) => app.isActive).length;
  const totalTokens = (summary?.totalTokensIn ?? 0) + (summary?.totalTokensOut ?? 0);

  return (
    <div className="studio-page">
      <StudioPageHeader
        eyebrow={STUDIO_WEB_COPY.OVERVIEW.EYEBROW}
        title={STUDIO_WEB_COPY.OVERVIEW.TITLE}
        subtitle={STUDIO_WEB_COPY.OVERVIEW.SUBTITLE}
        action={
          <StudioStatusPill
            tone={StudioStatusTone.SUCCESS}
            label={STUDIO_WEB_COPY.OVERVIEW.STATUS_OPERATIONAL}
          />
        }
      />

      {!targetSlug ? (
        <EmptyState
          title={STUDIO_WEB_COPY.COMMON.NO_DATA}
          description={STUDIO_WEB_COPY.COMMON.SELECT_APP_PROMPT}
        />
      ) : summaryLoading || runsLoading ? (
        <LoadingState message={STUDIO_WEB_COPY.COMMON.LOADING} />
      ) : (
        <>
          <section className="studio-kpi-grid" aria-label={STUDIO_WEB_COPY.OVERVIEW.TITLE}>
            <StudioKpiCard
              label={STUDIO_WEB_COPY.OVERVIEW.KPI_TOTAL_RUNS}
              windowLabel={STUDIO_WEB_COPY.OVERVIEW.KPI_WINDOW}
              value={(summary?.totalRuns ?? 0).toLocaleString()}
              icon={<Activity size={14} />}
              footer={
                <>
                  <span className="studio-kpi-delta">
                    {((summary?.successRate ?? 1) * 100).toFixed(1)}%
                  </span>
                  <span>{STUDIO_WEB_COPY.OVERVIEW.KPI_SUCCESS_RATE}</span>
                </>
              }
            />
            <StudioKpiCard
              label={STUDIO_WEB_COPY.OVERVIEW.KPI_TOTAL_COST}
              windowLabel={STUDIO_WEB_COPY.OVERVIEW.KPI_WINDOW}
              value={`$${(summary?.totalCostUsd ?? 0).toFixed(4)}`}
              icon={<CircleDollarSign size={14} />}
              sparklinePoints="1,20 10,17 17,19 24,11 31,14 39,6 47,10 55,4 64,8 73,2"
              footer={
                <>
                  <span className="studio-kpi-delta">{totalTokens.toLocaleString()}</span>
                  <span>{STUDIO_WEB_COPY.OVERVIEW.KPI_TOKENS_NOTE}</span>
                </>
              }
            />
            <StudioKpiCard
              label={STUDIO_WEB_COPY.OVERVIEW.KPI_ACTIVE_APPS}
              value={activeAppsCount}
              unit={`/ ${apps.length} ${STUDIO_WEB_COPY.OVERVIEW.KPI_REGISTERED_UNIT}`}
              icon={<Boxes size={14} />}
              footer={<span>{targetSlug}</span>}
            />
            <StudioKpiCard
              label={STUDIO_WEB_COPY.OVERVIEW.KPI_AVG_LATENCY}
              value={summary?.avgLatencyMs ?? 0}
              unit="ms"
              icon={<Clock3 size={14} />}
              footer={
                <StudioStatusPill
                  tone={StudioStatusTone.SUCCESS}
                  label={STUDIO_WEB_COPY.OVERVIEW.KPI_LATENCY_HEALTHY}
                />
              }
            />
          </section>

          <section className="studio-overview-grid">
            <StudioPanel
              title={STUDIO_WEB_COPY.OVERVIEW.RECENT_RUNS_TITLE}
              description={STUDIO_WEB_COPY.OVERVIEW.RECENT_RUNS_SUBTITLE}
              headerAction={
                <Link href={StudioWebRoute.TELEMETRY} className="studio-small-link">
                  {STUDIO_WEB_COPY.OVERVIEW.VIEW_TELEMETRY} <ArrowUpRight size={13} />
                </Link>
              }
            >
              {runs.length === 0 ? (
                <EmptyState
                  title={STUDIO_WEB_COPY.COMMON.NO_DATA}
                  description={STUDIO_WEB_COPY.TELEMETRY.EMPTY_DESC}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{STUDIO_WEB_COPY.OVERVIEW.COL_PROFILE}</TableHead>
                      <TableHead>{STUDIO_WEB_COPY.OVERVIEW.COL_MODEL}</TableHead>
                      <TableHead>{STUDIO_WEB_COPY.OVERVIEW.COL_TOKENS}</TableHead>
                      <TableHead>{STUDIO_WEB_COPY.OVERVIEW.COL_COST}</TableHead>
                      <TableHead>{STUDIO_WEB_COPY.OVERVIEW.COL_STATUS}</TableHead>
                      <TableHead>{STUDIO_WEB_COPY.OVERVIEW.COL_LATENCY}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runs.slice(0, 10).map((run) => (
                      <TableRow key={run.id}>
                        <TableCell className="studio-mono">
                          {run.profile?.slug ?? run.profileSlug ?? "—"}
                        </TableCell>
                        <TableCell className="studio-mono">{resolveRunModel(run)}</TableCell>
                        <TableCell>{(run.tokensIn + run.tokensOut).toLocaleString()}</TableCell>
                        <TableCell className="studio-mono">
                          ${Number(run.totalCostUsd).toFixed(4)}
                        </TableCell>
                        <TableCell>
                          <StudioStatusPill tone={resolveRunTone(run.status)} label={run.status} />
                        </TableCell>
                        <TableCell className="studio-mono">
                          {run.durationMs ?? run.latencyMs ?? 0} ms
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </StudioPanel>

            <StudioPanel
              title={STUDIO_WEB_COPY.OVERVIEW.TOP_MODELS_TITLE}
              description={STUDIO_WEB_COPY.OVERVIEW.TOP_MODELS_SUBTITLE}
              headerAction={
                <span className="studio-kpi-icon">
                  <Cpu size={14} />
                </span>
              }
              footer={
                <>
                  <Workflow size={13} />
                  <span>
                    {STUDIO_WEB_COPY.OVERVIEW.TOP_MODELS_FOOTNOTE} ({providers.length})
                  </span>
                </>
              }
            >
              {topModels.length === 0 ? (
                <EmptyState
                  title={STUDIO_WEB_COPY.COMMON.NO_DATA}
                  description={STUDIO_WEB_COPY.TELEMETRY.EMPTY_DESC}
                />
              ) : (
                <StudioModelBars items={topModels} />
              )}
            </StudioPanel>
          </section>
        </>
      )}
    </div>
  );
}
