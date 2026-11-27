/**
 * @file packages/ui/src/components/studio-model-bars.tsx
 * @description Horizontal bar breakdown list for top models by spend or requests.
 * @module @devlab-ai-studio/ui/studio-model-bars
 */

export interface StudioModelBarItem {
  /** Model identifier. */
  name: string;
  /** Provider name or slug. */
  provider: string;
  /** Formatted cost string (e.g. "$14.20"). */
  costLabel: string;
  /** Formatted request count label (e.g. "420 req"). */
  requestsLabel: string;
  /** Percentage width 0-100. */
  sharePercent: number;
}

export interface StudioModelBarsProps {
  /** Ordered list of model bars. */
  items: StudioModelBarItem[];
}

/** Renders a pure-CSS horizontal bar breakdown for top models. */
export function StudioModelBars({ items }: StudioModelBarsProps) {
  return (
    <div className="studio-model-list">
      {items.map((item) => (
        <div className="studio-model-item" key={item.name}>
          <div>
            <div className="studio-model-name">{item.name}</div>
            <div className="studio-model-provider">{item.provider}</div>
          </div>
          <div>
            <div className="studio-model-cost">{item.costLabel}</div>
            <div className="studio-model-requests">{item.requestsLabel}</div>
          </div>
          <div className="studio-model-track">
            <span style={{ width: `${Math.max(4, Math.min(100, item.sharePercent))}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
