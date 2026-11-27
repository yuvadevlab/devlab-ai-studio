import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  GatewayStreamEventType,
  HttpHeader,
  HttpHeaderValue,
  SSE_HTTP_STATUS_OK,
  StudioApiRoute,
  type GatewayStreamEvent,
} from "@devlab-ai-studio/shared-types";
import { gatewayRunRequestSchema, type GatewayRunRequest } from "@devlab-ai-studio/validation";
import { Logger } from "@yuva-devlab/logger";
import type { IncomingMessage, ServerResponse } from "node:http";
import { GatewayService } from "./gateway.service";

interface FastifyRawRequest {
  raw: IncomingMessage;
}

interface FastifyRawReply {
  raw: ServerResponse;
}

@ApiTags(StudioApiRoute.GATEWAY)
@Controller(StudioApiRoute.GATEWAY)
export class GatewayController {
  private readonly logger = new Logger(GatewayController.name);

  constructor(private readonly gatewayService: GatewayService) {}

  @Post(StudioApiRoute.GATEWAY_RUNS_STREAM)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Stream an AI agent run over unbuffered HTTP 200 SSE" })
  async streamRun(
    @Body() rawBody: unknown,
    @Req() req: FastifyRawRequest,
    @Res() reply: FastifyRawReply,
  ): Promise<void> {
    const parsed = gatewayRunRequestSchema.parse(rawBody) as GatewayRunRequest;
    const rawRes = reply.raw;
    const abortController = new AbortController();

    rawRes.statusCode = SSE_HTTP_STATUS_OK;
    rawRes.setHeader(HttpHeader.CONTENT_TYPE, HttpHeaderValue.SSE_CONTENT_TYPE);
    rawRes.setHeader(HttpHeader.CACHE_CONTROL, HttpHeaderValue.SSE_CACHE_CONTROL);
    rawRes.setHeader(HttpHeader.CONNECTION, HttpHeaderValue.KEEP_ALIVE);
    rawRes.setHeader(HttpHeader.ACCEL_BUFFERING, HttpHeaderValue.NO);
    rawRes.flushHeaders();

    req.raw.on("close", () => abortController.abort());

    const emitFrame = (event: GatewayStreamEvent): void => {
      if (!rawRes.writableEnded) {
        rawRes.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    };

    try {
      await this.gatewayService.streamRun(parsed, emitFrame, abortController.signal);
    } catch (error) {
      this.logger.error(`[streamRun] Failed: ${(error as Error).message}`);
      emitFrame({
        type: GatewayStreamEventType.ERROR,
        error: (error as Error).message || "Gateway error",
      });
      emitFrame({ type: GatewayStreamEventType.DONE });
    } finally {
      if (!rawRes.writableEnded) {
        rawRes.end();
      }
    }
  }
}
