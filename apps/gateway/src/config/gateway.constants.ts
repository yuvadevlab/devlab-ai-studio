/**
 * @file apps/gateway/src/config/gateway.constants.ts
 * @description Operational limits, timeouts, and Redis stream constants for `apps/gateway`.
 */

/** Operational bounds and timeouts for gateway caching and telemetry flushing. */
export const GATEWAY_LIMITS = {
  UPSTREAM_TIMEOUT_MS: 5000,
  FLUSH_INTERVAL_MS: 1500,
  FLUSH_TRIGGER_COUNT: 50,
  MAX_BATCH_SIZE: 200,
  MAX_CACHE_ENTRIES: 500,
} as const;

/** Redis Streams command and field constants for Upstash REST pipelines. */
export const REDIS_STREAM_PROTOCOL = {
  PIPELINE_PATH: "pipeline",
  CMD_XADD: "XADD",
  AUTO_ID: "*",
  FIELD_PAYLOAD: "payload",
} as const;
