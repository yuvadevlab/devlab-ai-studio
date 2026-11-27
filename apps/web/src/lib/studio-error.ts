/**
 * @file apps/web/src/lib/studio-error.ts
 * @description Normalizes API, Zod validation, SSE, and network errors into human-readable toast messages.
 * @module @devlab-ai-studio/web/lib/studio-error
 */

import { toast } from "@devlab-ai-studio/ui";
import { STUDIO_WEB_COPY } from "../constants/ui-copy";

export class StudioApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "StudioApiError";
  }
}

const FIELD_LABELS: Record<string, string> = {
  slug: "Slug",
  name: "Name",
  baseUrl: "Base URL",
  apiKey: "API key",
  modelId: "Model ID",
  providerId: "Provider",
  providerSlug: "Provider",
  ownerEmail: "Owner email",
  mcpEndpointUrl: "MCP endpoint URL",
  monthlyBudgetUsd: "Monthly budget",
  primaryModelId: "Primary model",
  fallbackModelIds: "Fallback models",
  temperature: "Temperature",
  maxTokens: "Max tokens",
  maxTurns: "Max turns",
  systemPrompt: "System prompt",
  profileSlug: "Profile",
  appSlug: "App",
  prompt: "Prompt",
};

function humanizeField(path: string): string {
  const leaf = path.split(".").pop() ?? path;
  return FIELD_LABELS[leaf] ?? leaf.replace(/([A-Z])/g, " $1").trim();
}

function formatZodIssues(issues: Array<{ path?: unknown[]; message?: string }>): string {
  const formatted = issues
    .map((issue) => {
      const path = Array.isArray(issue.path) ? issue.path.map(String).join(".") : "";
      const msg = issue.message ?? "Invalid value";
      return path ? `${humanizeField(path)}: ${msg}` : msg;
    })
    .filter(Boolean);
  return formatted.join(" · ") || STUDIO_WEB_COPY.COMMON.UNEXPECTED_ERROR;
}

function cleanValidationString(raw: string): string {
  const stripped = raw.replace(/^Validation failed:\s*/i, "").trim();
  const parts = stripped.split(/,\s*(?=[a-zA-Z0-9_.]+\s*:)/);
  return parts
    .map((part) => {
      const colonIdx = part.indexOf(":");
      if (colonIdx <= 0) return part;
      const field = part.slice(0, colonIdx).trim();
      const msg = part.slice(colonIdx + 1).trim();
      return `${humanizeField(field)}: ${msg}`;
    })
    .join(" · ");
}

/** Extracts a clean, user-facing error message from an HTTP error response body. */
export async function extractResponseError(response: Response): Promise<StudioApiError> {
  const rawText = await response.text().catch(() => response.statusText);
  const message = parseErrorPayload(rawText, response.status);
  return new StudioApiError(message, response.status);
}

/** Parses raw JSON envelopes, Zod issue arrays, or plain text into readable copy. */
export function parseErrorPayload(raw: string, statusCode?: number): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return statusFallback(statusCode);
  }

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return formatZodIssues(parsed as Array<{ path?: unknown[]; message?: string }>);
      }
      if (parsed && typeof parsed === "object") {
        const obj = parsed as Record<string, unknown>;
        if (Array.isArray(obj.issues)) {
          return formatZodIssues(obj.issues as Array<{ path?: unknown[]; message?: string }>);
        }
        const errField = obj.error;
        if (typeof errField === "string") {
          return cleanValidationString(errField);
        }
        if (errField && typeof errField === "object") {
          const nestedMsg = (errField as Record<string, unknown>).message;
          if (typeof nestedMsg === "string") {
            return cleanValidationString(nestedMsg);
          }
          if (Array.isArray(nestedMsg)) {
            return nestedMsg.map(String).join(" · ");
          }
        }
        if (typeof obj.message === "string") {
          return cleanValidationString(obj.message);
        }
      }
    } catch {
      // Fall through to plain-text handling
    }
  }

  if (/^Validation failed:/i.test(trimmed)) {
    return cleanValidationString(trimmed);
  }
  if (/Failed to fetch|NetworkError|ECONNREFUSED/i.test(trimmed)) {
    return "Unable to reach Studio server. Check that API and Gateway are running.";
  }

  return trimmed;
}

function statusFallback(statusCode?: number): string {
  switch (statusCode) {
    case 400:
      return "Please check the form fields and try again.";
    case 401:
      return "Authentication failed. Check your API key.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "A record with this identifier already exists.";
    default:
      return statusCode && statusCode >= 500
        ? "Server error. Please try again."
        : STUDIO_WEB_COPY.COMMON.UNEXPECTED_ERROR;
  }
}

/** Formats any thrown error or raw message into a clean single-string toast message. */
export function formatStudioError(
  error: unknown,
  fallback: string = STUDIO_WEB_COPY.COMMON.UNEXPECTED_ERROR,
): string {
  if (error instanceof StudioApiError) {
    return error.message || fallback;
  }
  if (error instanceof Error) {
    return parseErrorPayload(error.message) || fallback;
  }
  if (typeof error === "string") {
    return parseErrorPayload(error) || fallback;
  }
  return fallback;
}

/** Displays a normalized error toast for API, Zod validation, SSE, or network failures. */
export function notifyStudioError(error: unknown, fallback?: string): void {
  toast.error(formatStudioError(error, fallback));
}
