/**
 * @file packages/validation/src/policy.schema.ts
 * @description Zod schemas for AI profile policies, runtime overrides, and resolution helpers.
 * @module @devlab-ai-studio/validation/policy-schema
 */

import { z } from "zod";
import { AgentCreativityPreset, CREATIVITY_TEMPERATURE_MAP } from "@devlab-ai-studio/shared-types";

export const AppAiFeatureFlagsSchema = z.object({
  enableAgentMode: z.boolean().default(true),
  showReasoning: z.boolean().default(true),
  showLiveConsole: z.boolean().default(true),
  parallelToolCalls: z.boolean().default(true),
  followUpSuggestions: z.boolean().default(true),
  voiceInput: z.boolean().default(true),
});

export type AppAiFeatureFlags = z.infer<typeof AppAiFeatureFlagsSchema>;

export const AppAiPolicySchema = z.object({
  appId: z.string().min(1),
  profileSlug: z.string().min(1),
  profileVersion: z.number().int().positive().default(1),
  creativityPreset: z
    .enum([
      AgentCreativityPreset.ANALYTICAL,
      AgentCreativityPreset.BALANCED,
      AgentCreativityPreset.CREATIVE,
    ])
    .default(AgentCreativityPreset.ANALYTICAL),
  temperature: z.number().min(0).max(1.5).optional(),
  maxTurns: z.number().int().min(1).max(20).default(8),
  maxTokens: z.number().int().min(128).max(32768).default(4096),
  enabledToolNamespaces: z.array(z.string()).default([]),
  features: AppAiFeatureFlagsSchema.default({
    enableAgentMode: true,
    showReasoning: true,
    showLiveConsole: true,
    parallelToolCalls: true,
    followUpSuggestions: true,
    voiceInput: true,
  }),
});

export type AppAiPolicy = z.infer<typeof AppAiPolicySchema>;

export const resolveProfileOverridesSchema = z.object({
  creativityPreset: z
    .enum([
      AgentCreativityPreset.ANALYTICAL,
      AgentCreativityPreset.BALANCED,
      AgentCreativityPreset.CREATIVE,
    ])
    .optional(),
  temperature: z.number().min(0).max(1.5).optional(),
  maxTurns: z.number().int().min(1).max(20).optional(),
  features: AppAiFeatureFlagsSchema.partial().optional(),
});

export type AppAiPolicyOverrides = z.infer<typeof resolveProfileOverridesSchema>;

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
  const temperature = Math.min(1.5, Math.max(0, rawTemp));
  const maxTurns = overrides?.maxTurns
    ? Math.min(base.maxTurns, Math.max(1, overrides.maxTurns))
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
