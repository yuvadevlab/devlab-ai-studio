/**
 * @file packages/validation/src/telemetry.schema.ts
 * @description Zod schemas for gateway execution requests and async telemetry ingestion batches.
 * @module @devlab-ai-studio/validation/telemetry-schema
 */

import { z } from "zod";
import { LlmRole } from "@yuva-devlab/agent-protocol";
import {
  StudioAttemptStatus,
  StudioRunStatus,
  TelemetryEventType,
} from "@devlab-ai-studio/shared-types";
import { resolveProfileOverridesSchema } from "./policy.schema";

export const gatewayMessageSchema = z.object({
  role: z.enum([LlmRole.SYSTEM, LlmRole.USER, LlmRole.ASSISTANT]),
  content: z.string().min(1),
});

export const gatewayRunRequestSchema = z
  .object({
    appSlug: z.string().min(1).optional(),
    profileSlug: z.string().min(1),
    userId: z.string().min(1).default("studio-user"),
    conversationId: z.string().optional(),
    prompt: z.string().min(1).optional(),
    messages: z.array(gatewayMessageSchema).min(1).optional(),
    overrides: resolveProfileOverridesSchema.optional(),
  })
  .refine((data) => Boolean(data.prompt || data.messages?.length), {
    message: "Either prompt or messages must be provided",
  });

export type GatewayRunRequest = z.infer<typeof gatewayRunRequestSchema>;

export const telemetryRunEventSchema = z.object({
  type: z.literal(TelemetryEventType.RUN_RECORDED),
  runId: z.string().uuid(),
  appId: z.string().uuid(),
  profileId: z.string().uuid(),
  profileVersion: z.number().int().positive(),
  userId: z.string().min(1),
  conversationId: z.string().uuid().optional(),
  status: z.enum([
    StudioRunStatus.RUNNING,
    StudioRunStatus.SUCCESS,
    StudioRunStatus.FAILED,
    StudioRunStatus.RECOVERED,
    StudioRunStatus.CANCELLED,
  ]),
  durationMs: z.number().int().nonnegative(),
  tokensIn: z.number().int().nonnegative(),
  tokensOut: z.number().int().nonnegative(),
  reasoningTokens: z.number().int().nonnegative().default(0),
  totalCostUsd: z.number().nonnegative(),
  errorCode: z.string().optional(),
});

export const telemetryAttemptEventSchema = z.object({
  type: z.literal(TelemetryEventType.ATTEMPT_RECORDED),
  runId: z.string().uuid(),
  providerId: z.string().uuid(),
  modelId: z.string().uuid(),
  attemptIndex: z.number().int().nonnegative(),
  isFallback: z.boolean().default(false),
  ttftMs: z.number().int().nonnegative().optional(),
  latencyMs: z.number().int().nonnegative(),
  status: z.enum([
    StudioAttemptStatus.SUCCESS,
    StudioAttemptStatus.ERROR,
    StudioAttemptStatus.TIMEOUT,
    StudioAttemptStatus.RATE_LIMITED,
  ]),
  errorCode: z.string().optional(),
  tokensIn: z.number().int().nonnegative(),
  tokensOut: z.number().int().nonnegative(),
  costUsd: z.number().nonnegative(),
});

export const telemetryToolEventSchema = z.object({
  type: z.literal(TelemetryEventType.TOOL_RECORDED),
  runId: z.string().uuid(),
  toolName: z.string().min(1),
  durationMs: z.number().int().nonnegative(),
  ok: z.boolean(),
  errorCode: z.string().optional(),
});

export const telemetryEventSchema = z.discriminatedUnion("type", [
  telemetryRunEventSchema,
  telemetryAttemptEventSchema,
  telemetryToolEventSchema,
]);

export type TelemetryEvent = z.infer<typeof telemetryEventSchema>;

export const telemetryBatchSchema = z.object({
  events: z.array(telemetryEventSchema).min(1).max(200),
});

export type TelemetryBatchInput = z.infer<typeof telemetryBatchSchema>;
