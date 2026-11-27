/**
 * @file packages/ui/src/components/studio-page-header.tsx
 * @description Reusable Studio page header with eyebrow, title, optional count badge, subtitle, and right action.
 * @module @devlab-ai-studio/ui/studio-page-header
 */

import type { ReactNode } from "react";

export interface StudioPageHeaderProps {
  /** Uppercase monospace section eyebrow above title. */
  eyebrow?: string;
  /** Page heading title. */
  title: string;
  /** Optional count pill rendered beside title. */
  count?: number;
  /** Descriptive subtitle below title. */
  subtitle: string;
  /** Optional right-aligned action button or status pill. */
  action?: ReactNode;
}

/** Semantic page header used across all Studio Web pages. */
export function StudioPageHeader({
  eyebrow,
  title,
  count,
  subtitle,
  action,
}: StudioPageHeaderProps) {
  return (
    <div className="studio-page-heading">
      <div>
        {eyebrow ? <p className="studio-eyebrow">{eyebrow}</p> : null}
        <h1>
          {title}
          {count !== undefined ? <span className="studio-count">{count}</span> : null}
        </h1>
        <p>{subtitle}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
