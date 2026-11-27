import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { StudioApiRoute, buildStudioApiUrl } from "@devlab-ai-studio/shared-types";
import type { TelemetryBatchInput, TelemetryEvent } from "@devlab-ai-studio/validation";
import { loadGatewayConfig } from "../../config/gateway-config";
import { GATEWAY_LIMITS, REDIS_STREAM_PROTOCOL } from "../../config/gateway.constants";
import { StudioHttpClient } from "../http/studio-http.client";

/**
 * Non-blocking telemetry publisher. Buffers run, attempt, and tool events and flushes
 * them in bounded batches to Upstash Redis Streams or `apps/api` batch ingestion.
 */
@Injectable()
export class TelemetryPublisherService implements OnModuleDestroy {
  private readonly logger = new Logger(TelemetryPublisherService.name);
  private readonly config = loadGatewayConfig();
  private readonly queue: TelemetryEvent[] = [];
  private readonly flushTimer: ReturnType<typeof setInterval>;

  constructor(private readonly httpClient: StudioHttpClient) {
    this.flushTimer = setInterval(() => {
      void this.flush();
    }, GATEWAY_LIMITS.FLUSH_INTERVAL_MS);
  }

  publish(event: TelemetryEvent): void {
    this.queue.push(event);
    if (this.queue.length >= GATEWAY_LIMITS.FLUSH_TRIGGER_COUNT) {
      void this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0, GATEWAY_LIMITS.MAX_BATCH_SIZE);

    try {
      if (this.config.upstashRedisRestUrl && this.config.upstashRedisRestToken) {
        const url = new URL(
          REDIS_STREAM_PROTOCOL.PIPELINE_PATH,
          this.config.upstashRedisRestUrl.endsWith("/")
            ? this.config.upstashRedisRestUrl
            : `${this.config.upstashRedisRestUrl}/`,
        ).toString();

        const pipeline = batch.map((evt) => [
          REDIS_STREAM_PROTOCOL.CMD_XADD,
          this.config.telemetryStreamKey,
          REDIS_STREAM_PROTOCOL.AUTO_ID,
          REDIS_STREAM_PROTOCOL.FIELD_PAYLOAD,
          JSON.stringify(evt),
        ]);

        await this.httpClient.postJson(url, pipeline, {
          bearerToken: this.config.upstashRedisRestToken,
        });
        return;
      }

      const ingestUrl = buildStudioApiUrl(
        this.config.studioApiUrl,
        StudioApiRoute.TELEMETRY,
        StudioApiRoute.TELEMETRY_INGEST,
      );
      await this.httpClient.postJson<TelemetryBatchInput, unknown>(ingestUrl, { events: batch });
    } catch (error) {
      this.logger.warn(
        `[flush] Telemetry flush failed (${batch.length} events): ${(error as Error).message}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    clearInterval(this.flushTimer);
    await this.flush();
  }
}
