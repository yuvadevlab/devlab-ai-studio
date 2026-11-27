/**
 * @file packages/ui/src/components/studio-kpi-card.tsx
 * @description Compact KPI metric card with optional delta, unit, and sparkline.
 * @module @devlab-ai-studio/ui/studio-kpi-card
 */

import type { ReactNode } from "react";

export interface StudioKpiCardProps {
  /** Metric label shown at top-left. */
  label: string;
  /** Optional muted window suffix (e.g. "24h"). */
  windowLabel?: string;
  /** Formatted primary metric value. */
  value: ReactNode;
  /** Optional unit or denominator beside value. */
  unit?: ReactNode;
  /** Icon rendered in the top-right badge. */
  icon?: ReactNode;
  /** Footer delta or status node. */
  footer?: ReactNode;
  /** Optional SVG polyline points for inline sparkline. */
  sparklinePoints?: string;
}

/** Renders a single Studio KPI metric card. */
export function StudioKpiCard({
  label,
  windowLabel,
  value,
  unit,
  icon,
  footer,
  sparklinePoints,
}: StudioKpiCardProps) {
  return (
    <article className="studio-kpi-card">
      <div className="studio-kpi-label">
        <span>
          {label}
          {windowLabel ? <span className="studio-muted-label"> · {windowLabel}</span> : null}
        </span>
        {icon ? <span className="studio-kpi-icon">{icon}</span> : null}
      </div>
      <div className="studio-kpi-value">
        <span>{value}</span>
        {unit ? <small>{unit}</small> : null}
      </div>
      {footer || sparklinePoints ? (
        <div className="studio-kpi-foot">
          {footer}
          {sparklinePoints ? (
            <svg className="studio-kpi-chart" viewBox="0 0 74 25" aria-hidden="true">
              <polyline points={sparklinePoints} />
            </svg>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
