/**
 * @file packages/shared-types/src/enums.ts
 * @description Canonical enums and constants for DevLab AI Studio.
 * @module @devlab-ai-studio/shared-types/enums
 */

/** Named creativity / determinism presets configurable per app profile. */
export const AgentCreativityPreset = {
  ANALYTICAL: "analytical",
  BALANCED: "balanced",
  CREATIVE: "creative",
} as const;

export type AgentCreativityPreset =
  (typeof AgentCreativityPreset)[keyof typeof AgentCreativityPreset];

/** Default temperature mapped to each {@link AgentCreativityPreset}. */
export const CREATIVITY_TEMPERATURE_MAP: Record<AgentCreativityPreset, number> = {
  [AgentCreativityPreset.ANALYTICAL]: 0.1,
  [AgentCreativityPreset.BALANCED]: 0.4,
  [AgentCreativityPreset.CREATIVE]: 0.8,
};

/** Canonical service metadata constants. */
export const STUDIO_CONFIG = {
  APP_ID: "devlab-ai-studio",
  API_PREFIX: "api/v1",
  HEALTH_ROUTE: "health",
  DOCS_ROUTE: "api/docs",
} as const;
