/**
 * @file packages/ui/src/components/studio-status-pill.tsx
 * @description Semantic status badge pill with animated streaming pulse.
 * @module @devlab-ai-studio/ui/studio-status-pill
 */

import type { ReactNode } from "react";
import type { StudioStatusTone } from "./studio-ui.enums";

export interface StudioStatusPillProps {
  /** Semantic color tone. */
  tone: StudioStatusTone;
  /** Visible status label. */
  label: ReactNode;
}

/** Renders a rounded status pill with a leading indicator dot. */
export function StudioStatusPill({ tone, label }: StudioStatusPillProps) {
  return <span className={`studio-status-pill studio-status-pill--${tone}`}>{label}</span>;
}
