"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Button,
  Download,
  EmptyState,
  LoadingState,
  Pause,
  Play,
  StudioLatencyHistogram,
  StudioPageHeader,
  StudioPanel,
  StudioSelectField,
  StudioStatusPill,
  StudioStatusTone,
  Trash2,
  toast,
  type StudioHistogramBucket,
} from "@devlab-ai-studio/ui";
import { StudioQueryKey, StudioWebDefaults } from "@/constants/routes.constants";
import { STUDIO_WEB_COPY } from "@/constants/ui-copy";
import { useActiveApp } from "@/lib/active-app";
import { fetchApps, fetchRecentRuns, type StudioAgentRun } from "@/lib/studio-api";

function resolveStatusTone(status: string): StudioStatusTone {
  const upper = status.toUpperCase();
  if (upper === "SUCCESS" || upper === "RECOVERED") return StudioStatusTone.SUCCESS;
  if (upper === "RUNNING" || upper === "STREAMING") return StudioStatusTone.STREAMING;
  return StudioStatusTone.ERROR;
}

function getRunLatency(run: StudioAgentRun): number {
  return run.durationMs ?? run.latencyMs ?? 0;
}

function buildHistogram(runs: StudioAgentRun[]): {
  buckets: StudioHistogramBucket[];
  p50: number;
  p95: number;
} {
  const stepMs = 200;
  const bucketCount = 12;
  const counts = new Array<number>(bucketCount).fill(0);
  const latencies = runs.map(getRunLatency).sort((a, b) => a - b);

  for (const ms of latencies) {
    const idx = Math.min(bucketCount - 1, Math.floor(ms / stepMs));
    counts[idx] = (counts[idx] ?? 0) + 1;
  }

  const maxCount = Math.max(1, ...counts);
  const buckets = counts.map((count, index) => ({
    label: String(index * stepMs),
    count,
    heightPercent: (count / maxCount) * 100,
  }));

  const p50 = latencies.length > 0 ? (latencies[Math.floor(latencies.length * 0.5)] ?? 0) : 0;
  const p95 = latencies.length > 0 ? (latencies[Math.floor(latencies.length * 0.95)] ?? 0) : 0;

  return { buckets, p50, p95 };
}

/** Live run telemetry stream and latency distribution histogram feature. */
export function TelemetryFeature() {
  const { activeAppSlug } = useActiveApp();
  const [statusFilter, setStatusFilter] = useState("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const [clearedAt, setClearedAt] = useState<number>(0);

  const { data: apps = [] } = useQuery({ queryKey: [StudioQueryKey.APPS], queryFn: fetchApps });
  const targetSlug = activeAppSlug || apps[0]?.slug || "";

  const { data: runs = [], isLoading } = useQuery({
    queryKey: [StudioQueryKey.RECENT_RUNS, targetSlug],
    queryFn: () => fetchRecentRuns(targetSlug),
    enabled: Boolean(targetSlug),
    refetchInterval: autoScroll ? StudioWebDefaults.TELEMETRY_REFETCH_MS : false,
  });

  const visibleRuns = useMemo(() => {
    return runs.filter((run) => {
      if (clearedAt && new Date(run.createdAt).getTime() <= clearedAt) return false;
      if (statusFilter === "all") return true;
      return run.status.toUpperCase() === statusFilter.toUpperCase();
    });
  }, [runs, statusFilter, clearedAt]);

  const histogram = useMemo(() => buildHistogram(visibleRuns), [visibleRuns]);

  const exportCsv = () => {
    const rows = [
      ["timestamp", "profile", "model", "tokens_in", "tokens_out", "latency_ms", "status", "cost"],
      ...visibleRuns.map((run) => [
        run.createdAt,
        run.profile?.slug ?? run.profileSlug ?? "",
        run.attempts?.[run.attempts.length - 1]?.model?.modelId ?? run.finalModelId ?? "",
        String(run.tokensIn),
        String(run.tokensOut),
        String(getRunLatency(run)),
        run.status,
        String(run.totalCostUsd),
      ]),
    ];
    const csv = rows
      .map((row) => row.map((field) => `"${field.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `devlab-telemetry-${targetSlug || "studio"}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success(STUDIO_WEB_COPY.TELEMETRY.EXPORTED);
  };

  return (
    <div className="studio-page">
      <StudioPageHeader
        eyebrow={STUDIO_WEB_COPY.TELEMETRY.EYEBROW}
        title={STUDIO_WEB_COPY.TELEMETRY.TITLE}
        subtitle={STUDIO_WEB_COPY.TELEMETRY.SUBTITLE}
        action={
          <StudioStatusPill
            tone={StudioStatusTone.STREAMING}
            label={STUDIO_WEB_COPY.TELEMETRY.LIVE_BADGE}
          />
        }
      />

      {!targetSlug ? (
        <EmptyState
          title={STUDIO_WEB_COPY.COMMON.NO_DATA}
          description={STUDIO_WEB_COPY.COMMON.SELECT_APP_PROMPT}
        />
      ) : isLoading ? (
        <LoadingState message={STUDIO_WEB_COPY.COMMON.LOADING} />
      ) : (
        <>
          <section className="studio-terminal">
            <div className="studio-telemetry-toolbar">
              <div className="studio-filter-box">
                <StudioSelectField
                  ariaLabel={STUDIO_WEB_COPY.OVERVIEW.COL_STATUS}
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  options={[
                    { value: "all", label: STUDIO_WEB_COPY.COMMON.ALL_STATUSES },
                    { value: "SUCCESS", label: STUDIO_WEB_COPY.OVERVIEW.STATUS_SUCCESS },
                    { value: "RUNNING", label: STUDIO_WEB_COPY.OVERVIEW.STATUS_STREAMING },
                    { value: "FAILED", label: STUDIO_WEB_COPY.OVERVIEW.STATUS_ERROR },
                  ]}
                />
              </div>
              <div className="studio-telemetry-actions">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setClearedAt(Date.now());
                    toast.success(STUDIO_WEB_COPY.TELEMETRY.STREAM_CLEARED);
                  }}
                >
                  <Trash2 size={13} /> {STUDIO_WEB_COPY.TELEMETRY.CLEAR}
                </Button>
                <Button variant="ghost" size="sm" onClick={exportCsv}>
                  <Download size={13} /> {STUDIO_WEB_COPY.TELEMETRY.EXPORT_CSV}
                </Button>
              </div>
            </div>

            <div className="studio-log-window" role="log" aria-live="polite">
              {visibleRuns.length === 0 ? (
                <EmptyState
                  icon={<Activity size={18} />}
                  title={STUDIO_WEB_COPY.TELEMETRY.EMPTY_TITLE}
                  description={STUDIO_WEB_COPY.TELEMETRY.EMPTY_DESC}
                />
              ) : (
                visibleRuns.map((run) => {
                  const model =
                    run.attempts?.[run.attempts.length - 1]?.model?.modelId ??
                    run.finalModelId ??
                    "—";
                  return (
                    <div className="studio-log-row" key={run.id}>
                      <span className="studio-muted-label">
                        {new Date(run.createdAt).toLocaleTimeString()}
                      </span>
                      <span className="studio-mono">
                        {run.profile?.slug ?? run.profileSlug ?? "—"}
                      </span>
                      <span className="studio-mono">{model}</span>
                      <span className="studio-muted-label">
                        {(run.tokensIn + run.tokensOut).toLocaleString()} tk
                      </span>
                      <span className="studio-muted-label">{getRunLatency(run)} ms</span>
                      <StudioStatusPill tone={resolveStatusTone(run.status)} label={run.status} />
                    </div>
                  );
                })
              )}
            </div>

            <div className="studio-telemetry-toolbar">
              <span className="studio-mono">
                {visibleRuns.length} {STUDIO_WEB_COPY.TELEMETRY.EVENTS_LABEL}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setAutoScroll((prev) => !prev)}>
                {autoScroll ? <Pause size={13} /> : <Play size={13} />}{" "}
                {autoScroll
                  ? STUDIO_WEB_COPY.TELEMETRY.AUTO_SCROLL_ON
                  : STUDIO_WEB_COPY.TELEMETRY.AUTO_SCROLL_PAUSED}
              </Button>
            </div>
          </section>

          <StudioPanel
            title={STUDIO_WEB_COPY.TELEMETRY.HISTOGRAM_TITLE}
            description={STUDIO_WEB_COPY.TELEMETRY.HISTOGRAM_SUBTITLE}
            headerAction={
              <span className="studio-kpi-icon">
                <Activity size={14} />
              </span>
            }
          >
            <StudioLatencyHistogram
              ariaLabel={STUDIO_WEB_COPY.TELEMETRY.HISTOGRAM_ARIA}
              buckets={histogram.buckets}
              minLabel="0 ms"
              maxLabel="2,200+ ms"
              p50Label={`${histogram.p50} ms`}
              p95Label={`${histogram.p95} ms`}
            />
          </StudioPanel>
        </>
      )}
    </div>
  );
}
