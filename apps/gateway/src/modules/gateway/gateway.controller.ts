import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
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
import { ProfileCacheService } from "../../common/cache/profile-cache.service";
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

  constructor(
    private readonly gatewayService: GatewayService,
    private readonly profileCache: ProfileCacheService,
  ) {}

  @Post(StudioApiRoute.GATEWAY_RUNS_STREAM)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Stream an AI agent run over unbuffered HTTP 200 SSE" })
  async streamRun(
    @Body() rawBody: unknown,
    @Req() req: FastifyRawRequest,
    @Res() reply: FastifyRawReply,
  ): Promise<void> {
    const result = gatewayRunRequestSchema.safeParse(rawBody);
    if (!result.success) {
      const errorMsg = result.error.errors
        .map((error) => `${error.path.join(".")}: ${error.message}`)
        .join(", ");
      throw new BadRequestException(`Validation failed: ${errorMsg}`);
    }
    const parsed = result.data as GatewayRunRequest;
    const authHeader = req.raw.headers.authorization;
    const rawKey = authHeader?.startsWith(HttpHeaderValue.BEARER_PREFIX)
      ? authHeader.slice(HttpHeaderValue.BEARER_PREFIX.length).trim()
      : undefined;

    let appSlug = parsed.appSlug;
    if (rawKey) {
      try {
        const verifiedApp = await this.profileCache.verifyAppKey(rawKey);
        appSlug = verifiedApp.slug;
      } catch {
        throw new UnauthorizedException("Invalid or inactive consumer app key");
      }
    }

    if (!appSlug) {
      throw new BadRequestException("Either appSlug or Authorization Bearer key is required");
    }

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
      await this.gatewayService.streamRun(
        { ...parsed, appSlug },
        emitFrame,
        abortController.signal,
      );
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
