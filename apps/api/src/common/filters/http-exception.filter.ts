import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";

interface FastifyLikeReply {
  status: (code: number) => { send: (body: unknown) => unknown };
}

interface FastifyLikeRequest {
  url: string;
  method: string;
}

/**
 * Global exception filter that standardises all error responses into
 * `{ success: false, statusCode, timestamp, path, error }` for Fastify.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyLikeReply>();
    const request = ctx.getRequest<FastifyLikeRequest>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException ? exception.getResponse() : "Internal server error";

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: message,
    };

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[catch] ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `[catch] ${request.method} ${request.url} ${status} — ${typeof message === "string" ? message : JSON.stringify(message).slice(0, 200)}`,
      );
    }

    void reply.status(status).send(errorResponse);
  }
}
