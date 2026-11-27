/**
 * @file packages/ui/src/components/studio-drawer.tsx
 * @description Slide-over right drawer with backdrop and accessible header.
 * @module @devlab-ai-studio/ui/studio-drawer
 */

import type { ReactNode } from "react";
import { Button } from "@yuva-devlab/ui";
import { X } from "lucide-react";

export interface StudioDrawerProps {
  /** Whether the drawer is mounted/open. */
  open: boolean;
  /** Eyebrow text above the drawer title. */
  eyebrow: string;
  /** Main drawer title. */
  title: string;
  /** Accessible label for close buttons. */
  closeAriaLabel: string;
  /** Close callback. */
  onClose: () => void;
  /** Drawer body contents. */
  children: ReactNode;
}

/** Renders a slide-over right drawer dialog for workspace configuration. */
export function StudioDrawer({
  open,
  eyebrow,
  title,
  closeAriaLabel,
  onClose,
  children,
}: StudioDrawerProps) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="studio-drawer-backdrop"
        aria-label={closeAriaLabel}
        onClick={onClose}
      />
      <aside
        className="studio-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="studio-drawer-title"
      >
        <div className="studio-drawer-header">
          <div>
            <p className="studio-eyebrow">{eyebrow}</p>
            <h2 id="studio-drawer-title">{title}</h2>
          </div>
          <Button variant="ghost" size="icon" aria-label={closeAriaLabel} onClick={onClose}>
            <X size={17} />
          </Button>
        </div>
        <div className="studio-drawer-body">{children}</div>
      </aside>
    </>
  );
}
