import type { ReactNode } from "react";
import { Badge, type BadgeProps } from "@yuva-devlab/ui";

export interface StudioEntityRowProps {
  title: string;
  subtitle: string;
  badgeLabel?: string;
  badgeVariant?: BadgeProps["variant"];
  action?: ReactNode;
}

/** Atomic row card for displaying a provider, model, consumer app, or AI profile. */
export function StudioEntityRow({
  title,
  subtitle,
  badgeLabel,
  badgeVariant = "default",
  action,
}: StudioEntityRowProps) {
  return (
    <div className="studio-entity-row">
      <div className="studio-entity-row__meta">
        <span className="studio-entity-row__title">{title}</span>
        <span className="studio-entity-row__sub">{subtitle}</span>
      </div>
      {action ? action : badgeLabel ? <Badge variant={badgeVariant}>{badgeLabel}</Badge> : null}
    </div>
  );
}
