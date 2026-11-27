/**
 * @file packages/shared-types/src/regex.constants.ts
 * @description Canonical regular expressions shared across validation, API, gateway, and UI.
 * @module @devlab-ai-studio/shared-types/regex-constants
 */

/** Shared validation regular expressions for DevLab AI Studio. */
export const STUDIO_REGEX = {
  /** Lowercase kebab-case identifier (slugs for providers, apps, and profiles). */
  KEBAB_SLUG: /^[a-z0-9-]+$/,
  /** 64-character hexadecimal key (256-bit AES master key). */
  HEX_64: /^[0-9a-fA-F]{64}$/,
} as const;
