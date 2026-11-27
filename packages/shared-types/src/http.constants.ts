/**
 * @file packages/shared-types/src/http.constants.ts
 * @description Canonical HTTP status codes, headers, and SSE transport constants.
 * @module @devlab-ai-studio/shared-types/http-constants
 */

/** Canonical HTTP header names used across Studio services. */
export const HttpHeader = {
  AUTHORIZATION: "Authorization",
  CONTENT_TYPE: "Content-Type",
  CACHE_CONTROL: "Cache-Control",
  CONNECTION: "Connection",
  ACCEL_BUFFERING: "X-Accel-Buffering",
  REQUEST_ID: "x-request-id",
  CORRELATION_ID: "x-correlation-id",
} as const;

/** Canonical MIME types and header values. */
export const HttpHeaderValue = {
  APPLICATION_JSON: "application/json",
  SSE_CONTENT_TYPE: "text/event-stream; charset=utf-8",
  SSE_CACHE_CONTROL: "no-cache, no-transform",
  KEEP_ALIVE: "keep-alive",
  NO: "no",
  BEARER_PREFIX: "Bearer ",
} as const;

/** Canonical HTTP methods. */
export const HttpMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
  OPTIONS: "OPTIONS",
} as const;

/** HTTP status code required for unbuffered SSE streams on Cloud Run / GFE. */
export const SSE_HTTP_STATUS_OK = 200;
