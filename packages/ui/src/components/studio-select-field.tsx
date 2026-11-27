/**
 * @file packages/ui/src/components/studio-select-field.tsx
 * @description Reusable dropdown select built on @yuva-devlab/ui Select primitives.
 * @module @devlab-ai-studio/ui/studio-select-field
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@yuva-devlab/ui";

export interface StudioSelectOption {
  value: string;
  label: string;
}

export interface StudioSelectFieldProps {
  /** Current selected value. */
  value: string;
  /** Change handler. */
  onValueChange: (value: string) => void;
  /** Options list. */
  options: StudioSelectOption[];
  /** Optional placeholder when empty. */
  placeholder?: string;
  /** Optional aria-label for accessibility. */
  ariaLabel?: string;
}

/** Reusable dropdown list component wrapping @yuva-devlab/ui Select. */
export function StudioSelectField({
  value,
  onValueChange,
  options,
  placeholder,
  ariaLabel,
}: StudioSelectFieldProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger aria-label={ariaLabel}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
