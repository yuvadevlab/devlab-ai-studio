import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { telemetryBatchSchema, type TelemetryBatchInput } from "@devlab-ai-studio/validation";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { TelemetryService } from "./telemetry.service";

@ApiTags("telemetry")
@Controller("telemetry")
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post("ingest")
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: "Batch-ingest async run, attempt, and tool telemetry events" })
  ingestBatch(@Body(new ZodValidationPipe(telemetryBatchSchema)) body: TelemetryBatchInput) {
    return this.telemetryService.ingestBatch(body);
  }
}
