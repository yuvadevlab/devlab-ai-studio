# Backend API Rules (`apps/api` — NestJS + Fastify)

1. **5-Layer Architecture**:
   - **Controller**: HTTP routing, Swagger decorators, `@Body(new ZodValidationPipe(schema))`, delegates immediately to Service. Zero business logic or direct Prisma calls.
   - **Service**: Business orchestration, policy resolution, encryption/cost math, logging. Calls Repositories.
   - **Repository**: Exclusively encapsulates `@devlab-ai-studio/database` Prisma queries.
   - **Common**: `HttpExceptionFilter` (Fastify), `TransformInterceptor`, `ZodValidationPipe`.
   - **Config**: Validated environment configuration.
2. **Logging**:
   - `private readonly logger = new Logger(ClassName.name);`
   - Only `.info`, `.warn`, `.error` with `[methodName] message`.
3. **SSE Endpoints**:
   - Always enforce HTTP `200 OK` before flushing headers, disable proxy buffering (`X-Accel-Buffering: no`), and propagate client disconnect `AbortSignal`.
