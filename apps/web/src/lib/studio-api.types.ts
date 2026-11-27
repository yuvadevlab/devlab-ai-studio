/**
 * @file apps/web/src/lib/studio-api.types.ts
 * @description Shared TypeScript interfaces for Studio Control Plane and Gateway API responses.
 * @module @devlab-ai-studio/web/lib/studio-api.types
 */

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface StudioProvider {
  id: string;
  slug: string;
  name: string;
  baseUrl: string;
  keyMask: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { models: number };
}

export interface StudioModel {
  id: string;
  providerId: string;
  modelId: string;
  displayName: string;
  contextWindow: number;
  costPer1mInput: string | number;
  costPer1mOutput: string | number;
  isActive: boolean;
  provider?: { slug: string; name: string };
}

export interface StudioConsumerApp {
  id: string;
  slug: string;
  name: string;
  ownerEmail: string;
  mcpEndpointUrl: string | null;
  monthlyBudgetUsd: string | number;
  isActive: boolean;
  createdAt: string;
}

export interface StudioProfileVersion {
  id: string;
  version: number;
  systemPrompt: string;
  policyJson: Record<string, unknown>;
  createdAt: string;
}

export interface StudioProfile {
  id: string;
  slug: string;
  name: string;
  publishedVersionId: string | null;
  versions: StudioProfileVersion[];
}

export interface StudioAnalyticsSummary {
  appSlug: string;
  totalRuns: number;
  successRate: number;
  failedRuns: number;
  avgLatencyMs: number;
  totalCostUsd: number;
  totalTokensIn: number;
  totalTokensOut: number;
  feedback: { up: number; down: number };
}

export interface StudioRunAttempt {
  id: string;
  attemptIndex: number;
  isFallback: boolean;
  latencyMs: number;
  status: string;
  tokensIn: number;
  tokensOut: number;
  costUsd: string | number;
  model?: { modelId: string; displayName: string };
  provider?: { slug: string; name: string };
}

export interface StudioAgentRun {
  id: string;
  traceId?: string;
  profileSlug?: string;
  profile?: { slug: string; name: string };
  profileVersion?: number;
  status: string;
  finalModelId?: string | null;
  durationMs: number;
  latencyMs?: number;
  tokensIn: number;
  tokensOut: number;
  totalCostUsd: string | number;
  createdAt: string;
  attempts?: StudioRunAttempt[];
}
