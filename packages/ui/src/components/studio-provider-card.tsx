/**
 * @file packages/ui/src/components/studio-provider-card.tsx
 * @description Provider card with color-coded glyph, action menu, metrics, and status pill.
 * @module @devlab-ai-studio/ui/studio-provider-card
 */

import type { ReactNode } from "react";
import { Button } from "@yuva-devlab/ui";
import { Cpu, Ellipsis, ExternalLink, Pencil, ToggleLeft, Trash2 } from "lucide-react";
import { StudioStatusPill } from "./studio-status-pill";
import { StudioProviderAccent, StudioStatusTone } from "./studio-ui.enums";

export interface StudioProviderCardProps {
  /** Provider display name. */
  name: string;
  /** Provider kebab-case slug. */
  slug: string;
  /** Active state flag. */
  isActive: boolean;
  /** Registered model count. */
  modelCount: number;
  /** Masked API key preview or endpoint label. */
  keyPreview: string;
  /** Accent color variant for the provider glyph. */
  accent?: StudioProviderAccent;
  /** Localized labels passed from consumer app. */
  labels: {
    modelsLabel: string;
    keyLabel: string;
    activeLabel: string;
    inactiveLabel: string;
    editLabel: string;
    toggleLabel: string;
    deleteLabel: string;
    manageModelsLabel: string;
    actionsAriaLabel: string;
  };
  /** Optional custom icon override. */
  icon?: ReactNode;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onManageModels: () => void;
}

/** Renders a provider connection card in the Studio Providers grid. */
export function StudioProviderCard({
  name,
  slug,
  isActive,
  modelCount,
  keyPreview,
  accent = StudioProviderAccent.INDIGO,
  labels,
  icon,
  onEdit,
  onToggle,
  onDelete,
  onManageModels,
}: StudioProviderCardProps) {
  return (
    <article className="studio-provider-card">
      <div className="studio-provider-top">
        <span className={`studio-provider-logo is-${accent}`}>{icon ?? <Cpu size={18} />}</span>
        <details className="studio-provider-menu">
          <summary aria-label={labels.actionsAriaLabel}>
            <Ellipsis size={17} />
          </summary>
          <div className="studio-provider-menu-content">
            <Button variant="ghost" className="studio-menu-action" onClick={onEdit}>
              <Pencil size={13} /> {labels.editLabel}
            </Button>
            <Button variant="ghost" className="studio-menu-action" onClick={onToggle}>
              <ToggleLeft size={13} /> {labels.toggleLabel}
            </Button>
            <Button variant="ghost" className="studio-menu-action" onClick={onDelete}>
              <Trash2 size={13} /> {labels.deleteLabel}
            </Button>
          </div>
        </details>
      </div>
      <div className="studio-provider-name">{name}</div>
      <div className="studio-provider-slug">{slug}</div>
      <div className="studio-provider-metrics">
        <div className="studio-provider-metric">
          <span>{labels.modelsLabel}</span>
          <strong>{modelCount}</strong>
        </div>
        <div className="studio-provider-metric">
          <span>{labels.keyLabel}</span>
          <strong>{keyPreview}</strong>
        </div>
      </div>
      <div className="studio-provider-bottom">
        <StudioStatusPill
          tone={isActive ? StudioStatusTone.SUCCESS : StudioStatusTone.ERROR}
          label={isActive ? labels.activeLabel : labels.inactiveLabel}
        />
        <Button variant="ghost" size="sm" onClick={onManageModels}>
          {labels.manageModelsLabel} <ExternalLink size={12} />
        </Button>
      </div>
    </article>
  );
}
