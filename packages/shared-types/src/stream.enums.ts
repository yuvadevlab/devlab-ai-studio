/**
 * @file packages/shared-types/src/stream.enums.ts
 * @description Canonical SSE stream event types and log levels for gateway runs.
 * @module @devlab-ai-studio/shared-types/stream-enums
 */

/** Server-Sent Event types emitted by `apps/gateway`. */
export const GatewayStreamEventType = {
  RUN: "run",
  LOG: "log",
  REASONING: "reasoning",
  TOKEN: "token",
  ERROR: "error",
  DONE: "done",
} as const;

export type GatewayStreamEventType =
  (typeof GatewayStreamEventType)[keyof typeof GatewayStreamEventType];

/** Telemetry log levels emitted on SSE `log` frames. */
export const GatewayLogLevel = {
  SYS: "SYS",
  CTX: "CTX",
  LLM: "LLM",
  TOOL: "TOOL",
  DONE: "DONE",
  ERR: "ERR",
} as const;

export type GatewayLogLevel = (typeof GatewayLogLevel)[keyof typeof GatewayLogLevel];

/** Discriminated union of SSE frames emitted by `apps/gateway`. */
export type GatewayStreamEvent =
  | { type: typeof GatewayStreamEventType.RUN; runId: string }
  | {
      type: typeof GatewayStreamEventType.LOG;
      level: GatewayLogLevel;
      message: string;
      detail?: string;
    }
  | { type: typeof GatewayStreamEventType.REASONING; content: string }
  | { type: typeof GatewayStreamEventType.TOKEN; content: string }
  | { type: typeof GatewayStreamEventType.ERROR; error: string }
  | { type: typeof GatewayStreamEventType.DONE };
