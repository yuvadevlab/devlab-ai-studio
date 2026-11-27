import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import type { TelemetryBatchInput } from "@devlab-ai-studio/validation";
import { TelemetryRepository } from "./telemetry.repository";

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(private readonly repository: TelemetryRepository) {}

  async ingestBatch(input: TelemetryBatchInput) {
    this.logger.info(`[ingestBatch] Ingesting ${input.events.length} telemetry event(s)`);
    return this.repository.ingestBatch(input.events);
  }
}
