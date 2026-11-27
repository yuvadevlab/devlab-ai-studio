/**
 * @file packages/ui/src/components/studio-form-field.tsx
 * @description Reusable labeled form field wrapper built on @yuva-devlab/ui Label.
 * @module @devlab-ai-studio/ui/studio-form-field
 */

import type { ReactNode } from "react";
import { Label } from "@yuva-devlab/ui";

export interface StudioFormFieldProps {
  /** Field label text. */
  label: string;
  /** Optional muted hint beside the label. */
  hint?: string;
  /** Optional htmlFor target ID. */
  htmlFor?: string;
  /** Form control element (Input, Textarea, Select, etc.). */
  children: ReactNode;
}

/** Renders a consistent labeled form field using @yuva-devlab/ui Label. */
export function StudioFormField({ label, hint, htmlFor, children }: StudioFormFieldProps) {
  return (
    <div className="studio-field">
      <Label htmlFor={htmlFor}>
        {label}
        {hint ? <small className="studio-muted-label"> — {hint}</small> : null}
      </Label>
      {children}
    </div>
  );
}
