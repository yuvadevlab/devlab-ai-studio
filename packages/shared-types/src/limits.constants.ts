/**
 * @file packages/shared-types/src/limits.constants.ts
 * @description Canonical numeric bounds, defaults, and operational constants (zero magic numbers).
 * @module @devlab-ai-studio/shared-types/limits-constants
 */

/** Default feature flags for newly created or unconfigured AI profiles. */
export const DEFAULT_AI_FEATURE_FLAGS = {
  enableAgentMode: true,
  showReasoning: true,
  showLiveConsole: true,
  parallelToolCalls: true,
  followUpSuggestions: true,
  voiceInput: true,
} as const;

/** Canonical bounds and defaults for AI profile policies. */
export const POLICY_BOUNDS = {
  MIN_TEMPERATURE: 0,
  MAX_TEMPERATURE: 1.5,
  DEFAULT_TEMPERATURE: 0.1,
  MIN_TURNS: 1,
  MAX_TURNS: 20,
  DEFAULT_TURNS: 8,
  MIN_TOKENS: 128,
  MAX_TOKENS: 32768,
  DEFAULT_TOKENS: 4096,
  DEFAULT_PROFILE_VERSION: 1,
} as const;

/** Canonical bounds and defaults for Provider, ModelCatalog, ConsumerApp, and Feedback entities. */
export const CATALOG_BOUNDS = {
  SLUG_MIN_LENGTH: 2,
  SLUG_MAX_LENGTH: 64,
  NAME_MAX_LENGTH: 120,
  MODEL_ID_MAX_LENGTH: 160,
  API_KEY_MIN_LENGTH: 8,
  FEEDBACK_COMMENT_MAX_LENGTH: 1000,
  MIN_CONTEXT_WINDOW: 1024,
  MAX_CONTEXT_WINDOW: 2_000_000,
  DEFAULT_CONTEXT_WINDOW: 128_000,
  DEFAULT_COST_PER_1M: 0,
  DEFAULT_MONTHLY_BUDGET_USD: 25,
  DEFAULT_RECENT_RUNS_LIMIT: 50,
  RECENT_VERSIONS_TAKE: 5,
} as const;

/** Canonical server, cache, and stream defaults. */
export const SERVER_DEFAULTS = {
  API_PORT: 4002,
  GATEWAY_PORT: 8002,
  PROFILE_CACHE_TTL_MS: 30_000,
  TELEMETRY_STREAM_KEY: "devlab:ai:telemetry",
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/devlab_ai_studio",
  STUDIO_API_URL: "http://localhost:4002",
  API_CORS_ORIGINS: "http://localhost:3002",
  GATEWAY_CORS_ORIGINS: "http://localhost:3001,http://localhost:3002",
} as const;

/** Cryptographic constants for AES-256-GCM secret encryption and app key generation. */
export const CRYPTO_CONSTANTS = {
  AES_ALGORITHM: "aes-256-gcm",
  IV_BYTES: 12,
  APP_KEY_PREFIX: "dlai_app_",
  APP_KEY_RANDOM_BYTES: 24,
  KEY_MASK_MIN_LENGTH: 8,
  KEY_MASK_PREFIX_LENGTH: 3,
  KEY_MASK_SUFFIX_LENGTH: 4,
  KEY_MASK_PLACEHOLDER: "****",
  DEV_MASTER_KEY_HEX: "0000000000000000000000000000000000000000000000000000000000000000",
} as const;
