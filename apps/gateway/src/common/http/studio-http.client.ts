import { Injectable } from "@nestjs/common";
import { HttpHeader, HttpHeaderValue, HttpMethod } from "@devlab-ai-studio/shared-types";
import { GATEWAY_LIMITS } from "../../config/gateway.constants";

/** Options for {@link StudioHttpClient.postJson}. */
export interface PostJsonOptions {
  bearerToken?: string;
  timeoutMs?: number;
}

/**
 * Typed JSON HTTP client with bounded timeouts and standardized envelope unwrapping
 * for communication with `apps/api` and Upstash Redis REST endpoints.
 */
@Injectable()
export class StudioHttpClient {
  async postJson<TRequest, TResponse>(
    url: string,
    body: TRequest,
    options?: PostJsonOptions,
  ): Promise<TResponse> {
    const headers: Record<string, string> = {
      [HttpHeader.CONTENT_TYPE]: HttpHeaderValue.APPLICATION_JSON,
    };
    if (options?.bearerToken) {
      headers[HttpHeader.AUTHORIZATION] = `${HttpHeaderValue.BEARER_PREFIX}${options.bearerToken}`;
    }

    const res = await fetch(url, {
      method: HttpMethod.POST,
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(options?.timeoutMs ?? GATEWAY_LIMITS.UPSTREAM_TIMEOUT_MS),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`Upstream HTTP ${res.status} (${url}): ${errorText.slice(0, 200)}`);
    }

    const parsed = (await res.json()) as { data?: TResponse } & TResponse;
    return parsed.data ?? parsed;
  }
}
