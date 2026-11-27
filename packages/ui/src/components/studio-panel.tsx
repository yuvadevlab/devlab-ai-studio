/**
 * @file packages/ui/src/components/studio-panel.tsx
 * @description Reusable Studio panel built on @yuva-devlab/ui Card primitives.
 * @module @devlab-ai-studio/ui/studio-panel
 */

import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@yuva-devlab/ui";

export interface StudioPanelProps {
  /** Optional panel header title. */
  title?: ReactNode;
  /** Optional panel header subtitle/description. */
  description?: ReactNode;
  /** Optional right-aligned header action or icon. */
  headerAction?: ReactNode;
  /** Optional footer content. */
  footer?: ReactNode;
  /** Optional extra class name for layout composition. */
  className?: string;
  /** Panel body content. */
  children: ReactNode;
}

/** Reusable Studio section panel backed by @yuva-devlab/ui Card. */
export function StudioPanel({
  title,
  description,
  headerAction,
  footer,
  className,
  children,
}: StudioPanelProps) {
  return (
    <Card className={className ? `studio-panel ${className}` : "studio-panel"}>
      {title || description || headerAction ? (
        <CardHeader className="studio-panel-heading">
          <div>
            {title ? <CardTitle>{title}</CardTitle> : null}
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {headerAction}
        </CardHeader>
      ) : null}
      <CardContent style={{ padding: 0 }}>{children}</CardContent>
      {footer ? <CardFooter className="studio-panel-footnote">{footer}</CardFooter> : null}
    </Card>
  );
}
