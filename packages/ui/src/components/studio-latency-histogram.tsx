/**
 * @file packages/ui/src/components/studio-latency-histogram.tsx
 * @description Pure CSS latency distribution histogram for telemetry runs.
 * @module @devlab-ai-studio/ui/studio-latency-histogram
 */

export interface StudioHistogramBucket {
  /** Bucket axis label (e.g. "0", "200", "400"). */
  label: string;
  /** Normalized bar height percentage (0-100). */
  heightPercent: number;
  /** Raw count in this bucket. */
  count: number;
}

export interface StudioLatencyHistogramProps {
  /** Accessible label for the histogram. */
  ariaLabel: string;
  /** Ordered latency buckets. */
  buckets: StudioHistogramBucket[];
  /** Left-most axis bound label. */
  minLabel: string;
  /** Right-most axis bound label. */
  maxLabel: string;
  /** Median latency display string. */
  p50Label: string;
  /** 95th percentile latency display string. */
  p95Label: string;
}

/** Renders a pure-CSS latency distribution histogram with p50/p95 legend. */
export function StudioLatencyHistogram({
  ariaLabel,
  buckets,
  minLabel,
  maxLabel,
  p50Label,
  p95Label,
}: StudioLatencyHistogramProps) {
  return (
    <>
      <div className="studio-histogram" aria-label={ariaLabel}>
        {buckets.map((bucket) => (
          <div
            className="studio-histogram-column"
            key={bucket.label}
            title={`${bucket.label}ms: ${bucket.count}`}
          >
            <span style={{ height: `${Math.max(3, Math.min(100, bucket.heightPercent))}%` }} />
            <small>{bucket.label}</small>
          </div>
        ))}
      </div>
      <div className="studio-histogram-legend">
        <span>{minLabel}</span>
        <span>
          p50 <strong>{p50Label}</strong>
        </span>
        <span>
          p95 <strong>{p95Label}</strong>
        </span>
        <span>{maxLabel}</span>
      </div>
    </>
  );
}
