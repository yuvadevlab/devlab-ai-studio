/**
 * @file apps/web/src/lib/studio-api.ts
 * @description Typed REST and SSE client for DevLab AI Studio Control Plane and Gateway.
 * @module @devlab-ai-studio/web/lib/studio-api
 */

import {
  buildStudioApiUrl,
  HttpHeader,
  HttpHeaderValue,
  HttpMethod,
  LlmRole,
  StudioApiRoute,
  type GatewayStreamEvent,
} from "@devlab-ai-studio/shared-types";
import type {
  CreateConsumerAppInput,
  CreateProfileVersionInput,
  UpdateConsumerAppInput,
  UpdateProviderInput,
  UpsertModelInput,
  UpsertProviderInput,
} from "@devlab-ai-studio/validation";
import { AuthStorageKey } from "@yuva-devlab/auth-client";
import { StudioWebDefaults } from "@/constants/routes.constants";
import { extractResponseError } from "./studio-error";
import type {
  ApiEnvelope,
  StudioAgentRun,
  StudioAnalyticsSummary,
  StudioConsumerApp,
  StudioModel,
  StudioProfile,
  StudioProfileVersion,
  StudioProvider,
} from "./studio-api.types";

export type {
  StudioAgentRun,
  StudioAnalyticsSummary,
  StudioConsumerApp,
  StudioModel,
  StudioProfile,
  StudioProfileVersion,
  StudioProvider,
  StudioRunAttempt,
} from "./studio-api.types";

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_STUDIO_API_URL || StudioWebDefaults.API_URL;
}

function getGatewayBaseUrl(): string {
  return process.env.NEXT_PUBLIC_STUDIO_GATEWAY_URL || StudioWebDefaults.GATEWAY_URL;
}

function readPortalToken(): string | null {
  if (typeof window === "undefined") return null;
  const fromStorage =
    window.localStorage.getItem(AuthStorageKey.TOKEN) ||
    window.localStorage.getItem(AuthStorageKey.ACCESS_TOKEN_LEGACY);
  if (fromStorage) return fromStorage;
  const match = document.cookie.match(
    new RegExp(
      `(?:^|;\\s*)(?:${AuthStorageKey.TOKEN}|${AuthStorageKey.ACCESS_TOKEN_LEGACY})=([^;]+)`,
    ),
  );
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const token = readPortalToken();
  const response = await fetch(url, {
    ...init,
    headers: {
      [HttpHeader.CONTENT_TYPE]: HttpHeaderValue.APPLICATION_JSON,
      ...(token ? { [HttpHeader.AUTHORIZATION]: `${HttpHeaderValue.BEARER_PREFIX}${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw await extractResponseError(response);
  }

  const envelope = (await response.json()) as ApiEnvelope<T>;
  return envelope.data;
}

export function fetchProviders(): Promise<StudioProvider[]> {
  return requestJson<StudioProvider[]>(
    buildStudioApiUrl(getApiBaseUrl(), StudioApiRoute.PROVIDERS),
  );
}

export function upsertProvider(input: UpsertProviderInput): Promise<StudioProvider> {
  return requestJson<StudioProvider>(buildStudioApiUrl(getApiBaseUrl(), StudioApiRoute.PROVIDERS), {
    method: HttpMethod.POST,
    body: JSON.stringify(input),
  });
}

export function updateProvider(slug: string, input: UpdateProviderInput): Promise<StudioProvider> {
  return requestJson<StudioProvider>(
    buildStudioApiUrl(getApiBaseUrl(), StudioApiRoute.PROVIDERS, slug),
    { method: HttpMethod.PATCH, body: JSON.stringify(input) },
  );
}

export function deleteProvider(slug: string): Promise<{ id: string; slug: string; name: string }> {
  return requestJson<{ id: string; slug: string; name: string }>(
    buildStudioApiUrl(getApiBaseUrl(), StudioApiRoute.PROVIDERS, slug),
    { method: HttpMethod.DELETE },
  );
}

export function fetchModels(): Promise<StudioModel[]> {
  return requestJson<StudioModel[]>(
    buildStudioApiUrl(getApiBaseUrl(), StudioApiRoute.PROVIDERS, StudioApiRoute.PROVIDERS_MODELS),
  );
}

export function upsertModel(input: UpsertModelInput): Promise<StudioModel> {
  return requestJson<StudioModel>(
    buildStudioApiUrl(getApiBaseUrl(), StudioApiRoute.PROVIDERS, StudioApiRoute.PROVIDERS_MODELS),
    { method: HttpMethod.POST, body: JSON.stringify(input) },
  );
}

export function deleteModel(
  id: string,
): Promise<{ id: string; modelId: string; displayName: string }> {
  return requestJson<{ id: string; modelId: string; displayName: string }>(
    buildStudioApiUrl(
      getApiBaseUrl(),
      StudioApiRoute.PROVIDERS,
      StudioApiRoute.PROVIDERS_MODELS,
      id,
    ),
    { method: HttpMethod.DELETE },
  );
}

export function fetchApps(): Promise<StudioConsumerApp[]> {
  return requestJson<StudioConsumerApp[]>(buildStudioApiUrl(getApiBaseUrl(), StudioApiRoute.APPS));
}

export function createApp(
  input: CreateConsumerAppInput,
): Promise<{ app: StudioConsumerApp; appKey: string }> {
  return requestJson<{ app: StudioConsumerApp; appKey: string }>(
    buildStudioApiUrl(getApiBaseUrl(), StudioApiRoute.APPS),
    { method: HttpMethod.POST, body: JSON.stringify(input) },
  );
}

export function updateApp(slug: string, input: UpdateConsumerAppInput): Promise<StudioConsumerApp> {
  return requestJson<StudioConsumerApp>(
    buildStudioApiUrl(getApiBaseUrl(), StudioApiRoute.APPS, slug),
    { method: HttpMethod.PATCH, body: JSON.stringify(input) },
  );
}

export function deleteApp(slug: string): Promise<{ id: string; slug: string; name: string }> {
  return requestJson<{ id: string; slug: string; name: string }>(
    buildStudioApiUrl(getApiBaseUrl(), StudioApiRoute.APPS, slug),
    { method: HttpMethod.DELETE },
  );
}

export function rotateAppKey(slug: string): Promise<{ app: StudioConsumerApp; appKey: string }> {
  return requestJson<{ app: StudioConsumerApp; appKey: string }>(
    buildStudioApiUrl(getApiBaseUrl(), StudioApiRoute.APPS, slug, StudioApiRoute.APPS_ROTATE_KEY),
    { method: HttpMethod.POST },
  );
}

export function fetchProfiles(appSlug: string): Promise<StudioProfile[]> {
  return requestJson<StudioProfile[]>(
    buildStudioApiUrl(getApiBaseUrl(), StudioApiRoute.APPS, appSlug, StudioApiRoute.PROFILES),
  );
}

export function createProfileVersion(
  appSlug: string,
  input: CreateProfileVersionInput,
): Promise<StudioProfileVersion> {
  return requestJson<StudioProfileVersion>(
    buildStudioApiUrl(getApiBaseUrl(), StudioApiRoute.APPS, appSlug, StudioApiRoute.PROFILES),
    { method: HttpMethod.POST, body: JSON.stringify(input) },
  );
}

export function publishProfileVersion(
  appSlug: string,
  profileSlug: string,
  versionId: string,
): Promise<StudioProfile> {
  return requestJson<StudioProfile>(
    buildStudioApiUrl(
      getApiBaseUrl(),
      StudioApiRoute.APPS,
      appSlug,
      StudioApiRoute.PROFILES,
      profileSlug,
      StudioApiRoute.PROFILE_PUBLISH,
    ),
    { method: HttpMethod.PATCH, body: JSON.stringify({ versionId }) },
  );
}

export function fetchAnalyticsSummary(appSlug: string): Promise<StudioAnalyticsSummary> {
  return requestJson<StudioAnalyticsSummary>(
    buildStudioApiUrl(
      getApiBaseUrl(),
      StudioApiRoute.APPS,
      appSlug,
      StudioApiRoute.ANALYTICS,
      StudioApiRoute.ANALYTICS_SUMMARY,
    ),
  );
}

export function fetchRecentRuns(appSlug: string): Promise<StudioAgentRun[]> {
  return requestJson<StudioAgentRun[]>(
    buildStudioApiUrl(
      getApiBaseUrl(),
      StudioApiRoute.APPS,
      appSlug,
      StudioApiRoute.ANALYTICS,
      StudioApiRoute.ANALYTICS_RUNS,
    ),
  );
}

export async function streamGatewayRun(
  params: { appKey: string; appSlug?: string; profileSlug: string; prompt: string },
  onEvent: (event: GatewayStreamEvent) => void,
): Promise<void> {
  const url = buildStudioApiUrl(
    getGatewayBaseUrl(),
    StudioApiRoute.GATEWAY,
    StudioApiRoute.GATEWAY_RUNS,
    StudioApiRoute.STREAM,
  );
  const response = await fetch(url, {
    method: HttpMethod.POST,
    headers: {
      [HttpHeader.CONTENT_TYPE]: HttpHeaderValue.APPLICATION_JSON,
      [HttpHeader.AUTHORIZATION]: `${HttpHeaderValue.BEARER_PREFIX}${params.appKey}`,
    },
    body: JSON.stringify({
      ...(params.appSlug ? { appSlug: params.appSlug } : {}),
      profileSlug: params.profileSlug,
      prompt: params.prompt,
      messages: [{ role: LlmRole.USER, content: params.prompt }],
    }),
  });

  if (!response.ok || !response.body) {
    throw await extractResponseError(response);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      onEvent(JSON.parse(payload) as GatewayStreamEvent);
    }
  }
}
