/**
 * @file packages/validation/src/control-plane.schema.ts
 * @description Zod schemas for Provider, ModelCatalog, ConsumerApp, AiProfileVersion, and RunFeedback CRUD.
 * @module @devlab-ai-studio/validation/control-plane-schema
 */

import { z } from "zod";
import { KEBAB_SLUG_REGEX } from "@yuva-devlab/regex";
import {
  AgentCreativityPreset,
  CATALOG_BOUNDS,
  DEFAULT_AI_FEATURE_FLAGS,
  POLICY_BOUNDS,
} from "@devlab-ai-studio/shared-types";
import { AppAiFeatureFlagsSchema } from "./policy.schema";

const kebabSlugSchema = z
  .string()
  .min(CATALOG_BOUNDS.SLUG_MIN_LENGTH)
  .max(CATALOG_BOUNDS.SLUG_MAX_LENGTH)
  .regex(KEBAB_SLUG_REGEX);

export const upsertProviderSchema = z.object({
  slug: kebabSlugSchema,
  name: z.string().min(1).max(CATALOG_BOUNDS.NAME_MAX_LENGTH),
  baseUrl: z.string().url(),
  apiKey: z.string().min(CATALOG_BOUNDS.API_KEY_MIN_LENGTH).optional(),
  isActive: z.boolean().default(true),
});

export type UpsertProviderInput = z.infer<typeof upsertProviderSchema>;

export const upsertModelSchema = z.object({
  providerId: z.string().uuid(),
  modelId: z.string().min(1).max(CATALOG_BOUNDS.MODEL_ID_MAX_LENGTH),
  displayName: z.string().min(1).max(CATALOG_BOUNDS.MODEL_ID_MAX_LENGTH),
  capabilities: z.record(z.string(), z.boolean()).default({}),
  contextWindow: z
    .number()
    .int()
    .min(CATALOG_BOUNDS.MIN_CONTEXT_WINDOW)
    .max(CATALOG_BOUNDS.MAX_CONTEXT_WINDOW)
    .default(CATALOG_BOUNDS.DEFAULT_CONTEXT_WINDOW),
  inputCostPer1M: z.number().nonnegative().default(CATALOG_BOUNDS.DEFAULT_COST_PER_1M),
  outputCostPer1M: z.number().nonnegative().default(CATALOG_BOUNDS.DEFAULT_COST_PER_1M),
  isActive: z.boolean().default(true),
});

export type UpsertModelInput = z.infer<typeof upsertModelSchema>;

export const createConsumerAppSchema = z.object({
  slug: kebabSlugSchema,
  name: z.string().min(1).max(CATALOG_BOUNDS.NAME_MAX_LENGTH),
  ownerEmail: z.string().email(),
  mcpEndpointUrl: z.string().url().optional(),
  monthlyBudgetUsd: z.number().positive().default(CATALOG_BOUNDS.DEFAULT_MONTHLY_BUDGET_USD),
});

export type CreateConsumerAppInput = z.infer<typeof createConsumerAppSchema>;

export const createProfileVersionSchema = z.object({
  slug: kebabSlugSchema,
  name: z.string().min(1).max(CATALOG_BOUNDS.NAME_MAX_LENGTH),
  primaryModelId: z.string().uuid(),
  fallbackModelIds: z.array(z.string().uuid()).default([]),
  creativityPreset: z
    .enum([
      AgentCreativityPreset.ANALYTICAL,
      AgentCreativityPreset.BALANCED,
      AgentCreativityPreset.CREATIVE,
    ])
    .default(AgentCreativityPreset.ANALYTICAL),
  temperature: z
    .number()
    .min(POLICY_BOUNDS.MIN_TEMPERATURE)
    .max(POLICY_BOUNDS.MAX_TEMPERATURE)
    .default(POLICY_BOUNDS.DEFAULT_TEMPERATURE),
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
  featureFlags: AppAiFeatureFlagsSchema.default({ ...DEFAULT_AI_FEATURE_FLAGS }),
  enabledToolNamespaces: z.array(z.string()).default([]),
  systemPrompt: z.string().default(""),
  publish: z.boolean().default(true),
});

export type CreateProfileVersionInput = z.infer<typeof createProfileVersionSchema>;

export const publishProfileVersionSchema = z.object({
  versionId: z.string().uuid(),
});

export type PublishProfileVersionInput = z.infer<typeof publishProfileVersionSchema>;

export const submitRunFeedbackSchema = z.object({
  runId: z.string().uuid(),
  userId: z.string().min(1),
  rating: z.enum(["UP", "DOWN"]),
  comment: z.string().max(CATALOG_BOUNDS.FEEDBACK_COMMENT_MAX_LENGTH).optional(),
});

export type SubmitRunFeedbackInput = z.infer<typeof submitRunFeedbackSchema>;
