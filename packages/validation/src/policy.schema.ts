/**
 * @file packages/validation/src/policy.schema.ts
 * @description Zod schemas for AI profile policies, runtime overrides, and resolution helpers.
 * @module @devlab-ai-studio/validation/policy-schema
 */

import { z } from "zod";
import {
  AgentCreativityPreset,
  CREATIVITY_TEMPERATURE_MAP,
  DEFAULT_AI_FEATURE_FLAGS,
  POLICY_BOUNDS,
} from "@devlab-ai-studio/shared-types";

export const AppAiFeatureFlagsSchema = z.object({
  enableAgentMode: z.boolean().default(DEFAULT_AI_FEATURE_FLAGS.enableAgentMode),
  showReasoning: z.boolean().default(DEFAULT_AI_FEATURE_FLAGS.showReasoning),
  showLiveConsole: z.boolean().default(DEFAULT_AI_FEATURE_FLAGS.showLiveConsole),
  parallelToolCalls: z.boolean().default(DEFAULT_AI_FEATURE_FLAGS.parallelToolCalls),
  followUpSuggestions: z.boolean().default(DEFAULT_AI_FEATURE_FLAGS.followUpSuggestions),
  voiceInput: z.boolean().default(DEFAULT_AI_FEATURE_FLAGS.voiceInput),
});

export type AppAiFeatureFlags = z.infer<typeof AppAiFeatureFlagsSchema>;

const creativityPresetSchema = z.enum([
  AgentCreativityPreset.ANALYTICAL,
  AgentCreativityPreset.BALANCED,
  AgentCreativityPreset.CREATIVE,
]);

export const AppAiPolicySchema = z.object({
  appId: z.string().min(1),
  profileSlug: z.string().min(1),
  profileVersion: z.number().int().positive().default(POLICY_BOUNDS.DEFAULT_PROFILE_VERSION),
  creativityPreset: creativityPresetSchema.default(AgentCreativityPreset.ANALYTICAL),
  temperature: z
    .number()
    .min(POLICY_BOUNDS.MIN_TEMPERATURE)
    .max(POLICY_BOUNDS.MAX_TEMPERATURE)
    .optional(),
  maxTurns: z
    .number()
    .int()
    .min(POLICY_BOUNDS.MIN_TURNS)
    .max(POLICY_BOUNDS.MAX_TURNS)
    .default(POLICY_BOUNDS.DEFAULT_TURNS),
  maxTokens: z
    .number()
    .int()
    .min(POLICY_BOUNDS.MIN_TOKENS)
    .max(POLICY_BOUNDS.MAX_TOKENS)
    .default(POLICY_BOUNDS.DEFAULT_TOKENS),
  enabledToolNamespaces: z.array(z.string()).default([]),
  features: AppAiFeatureFlagsSchema.default({ ...DEFAULT_AI_FEATURE_FLAGS }),
});

export type AppAiPolicy = z.infer<typeof AppAiPolicySchema>;

export const resolveProfileOverridesSchema = z.object({
  creativityPreset: creativityPresetSchema.optional(),
  temperature: z
    .number()
    .min(POLICY_BOUNDS.MIN_TEMPERATURE)
    .max(POLICY_BOUNDS.MAX_TEMPERATURE)
    .optional(),
  maxTurns: z.number().int().min(POLICY_BOUNDS.MIN_TURNS).max(POLICY_BOUNDS.MAX_TURNS).optional(),
  features: AppAiFeatureFlagsSchema.partial().optional(),
});

export type AppAiPolicyOverrides = z.infer<typeof resolveProfileOverridesSchema>;

/** Canonical resolved profile payload returned by `apps/api` and cached by `apps/gateway`. */
export interface ResolvedProfileResponse {
  appId: string;
  profileId: string;
  policy: AppAiPolicy & { temperature: number };
  primaryModel: {
    provider: string;
    modelId: string;
    baseUrl: string;
  };
  fallbackModelIds: string[];
}

/**
 * Resolves effective profile policy by clamping optional runtime overrides
 * within the published profile bounds.
 */
export function resolveEffectivePolicy(
  base: AppAiPolicy,
  overrides?: AppAiPolicyOverrides,
): AppAiPolicy & { temperature: number } {
  const preset = overrides?.creativityPreset ?? base.creativityPreset;
  const rawTemp = overrides?.temperature ?? base.temperature ?? CREATIVITY_TEMPERATURE_MAP[preset];
  const temperature = Math.min(
    POLICY_BOUNDS.MAX_TEMPERATURE,
    Math.max(POLICY_BOUNDS.MIN_TEMPERATURE, rawTemp),
  );
  const maxTurns = overrides?.maxTurns
    ? Math.min(base.maxTurns, Math.max(POLICY_BOUNDS.MIN_TURNS, overrides.maxTurns))
    : base.maxTurns;

  return {
    ...base,
    creativityPreset: preset,
    temperature,
    maxTurns,
    features: {
      ...base.features,
      ...overrides?.features,
    },
  };
}
