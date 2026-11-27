/**
 * @file apps/gateway/src/modules/gateway/llm-stream.executor.ts
 * @description Executes streaming LLM completions via @yuva-devlab/ai-client provider adapters.
 * @module @devlab-ai-studio/gateway/llm-stream-executor
 */

import { LlmRole } from "@yuva-devlab/agent-protocol";
import {
  createAssistantMessage,
  createSystemMessage,
  createUserMessage,
  createProvider,
  type ProviderType,
} from "@yuva-devlab/ai-client";
import type { ResolvedModelTarget } from "@devlab-ai-studio/validation";

export interface StreamExecutionParams {
  target: ResolvedModelTarget;
  systemPrompt: string;
  messages: Array<{ role: string; content: string }>;
  temperature: number;
  maxTokens: number;
  signal: AbortSignal;
  onToken: (content: string) => void;
  onReasoning?: (content: string) => void;
}

export interface StreamExecutionResult {
  tokensIn: number;
  tokensOut: number;
  ttftMs: number | undefined;
  latencyMs: number;
  costUsd: number;
}

const KNOWN_PROVIDER_TYPES: ReadonlySet<string> = new Set<ProviderType>([
  "ollama",
  "groq",
  "google",
  "openai",
  "anthropic",
  "cline",
]);

function resolveProviderType(slug: string): ProviderType {
  const normalized = slug.toLowerCase();
  if (KNOWN_PROVIDER_TYPES.has(normalized)) {
    return normalized as ProviderType;
  }
  return "openai";
}

/**
 * Streams a chat completion through `@yuva-devlab/ai-client` adapters and records usage/TTFT.
 */
export async function executeModelStream(
  params: StreamExecutionParams,
): Promise<StreamExecutionResult> {
  const { target, systemPrompt, messages, temperature, maxTokens, signal, onToken, onReasoning } =
    params;

  const providerType = resolveProviderType(target.provider);
  if (providerType !== "ollama" && !target.apiKey) {
    throw new Error(`Provider "${target.provider}" has no API key configured`);
  }

  const provider = createProvider(providerType, {
    ...(target.apiKey ? { apiKey: target.apiKey } : {}),
    ...(target.baseUrl ? { baseUrl: target.baseUrl } : {}),
  });

  const startedAt = Date.now();
  let ttftMs: number | undefined;
  let tokensIn = 0;
  let tokensOut = 0;

  const formattedMessages = [
    ...(systemPrompt ? [createSystemMessage(systemPrompt)] : []),
    ...messages
      .filter((m) => m.role !== LlmRole.SYSTEM)
      .map((m) =>
        m.role === LlmRole.ASSISTANT
          ? createAssistantMessage(m.content)
          : createUserMessage(m.content),
      ),
  ];

  for await (const chunk of provider.stream({
    model: target.modelId,
    messages: formattedMessages,
    temperature,
    maxTokens,
    responseFormat: "text",
    timeoutMs: 30_000,
  })) {
    if (signal.aborted) break;
    if (chunk.reasoningDelta && onReasoning) {
      onReasoning(chunk.reasoningDelta);
    }
    if (chunk.delta) {
      if (ttftMs === undefined) ttftMs = Date.now() - startedAt;
      onToken(chunk.delta);
    }
    if (chunk.usage) {
      tokensIn = chunk.usage.promptTokens || tokensIn;
      tokensOut = chunk.usage.completionTokens || tokensOut;
    }
  }

  const latencyMs = Date.now() - startedAt;
  const costUsd =
    (tokensIn * target.inputCostPer1M + tokensOut * target.outputCostPer1M) / 1_000_000;

  return { tokensIn, tokensOut, ttftMs, latencyMs, costUsd };
}
