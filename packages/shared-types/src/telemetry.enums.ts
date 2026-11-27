/**
 * @file packages/shared-types/src/telemetry.enums.ts
 * @description Canonical telemetry event types emitted by `apps/gateway` and ingested by `apps/api`.
 * @module @devlab-ai-studio/shared-types/telemetry-enums
 */

/** Canonical telemetry event kinds published on the async event bus. */
export const TelemetryEventType = {
  RUN_RECORDED: "run.recorded",
  ATTEMPT_RECORDED: "attempt.recorded",
  TOOL_RECORDED: "tool.recorded",
  FEEDBACK_RECORDED: "feedback.recorded",
} as const;

export type TelemetryEventType = (typeof TelemetryEventType)[keyof typeof TelemetryEventType];

/** Run outcome status matching Prisma `RunOutcomeStatus`. */
export const StudioRunStatus = {
  RUNNING: "RUNNING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  RECOVERED: "RECOVERED",
  CANCELLED: "CANCELLED",
} as const;

export type StudioRunStatus = (typeof StudioRunStatus)[keyof typeof StudioRunStatus];

/** LLM attempt status matching Prisma `AttemptStatus`. */
export const StudioAttemptStatus = {
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
  TIMEOUT: "TIMEOUT",
  RATE_LIMITED: "RATE_LIMITED",
} as const;

export type StudioAttemptStatus = (typeof StudioAttemptStatus)[keyof typeof StudioAttemptStatus];
