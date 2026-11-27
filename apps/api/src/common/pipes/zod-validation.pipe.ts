import { PipeTransform, ArgumentMetadata, BadRequestException } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import type { ZodSchema } from "zod";

/** Validates `@Body(...)` payloads against a `@devlab-ai-studio/validation` Zod schema. */
export class ZodValidationPipe implements PipeTransform {
  private readonly logger = new Logger(ZodValidationPipe.name);

  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (metadata.type !== "body") {
      return value;
    }
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const errorMsg = result.error.errors
        .map((error) => `${error.path.join(".")}: ${error.message}`)
        .join(", ");
      this.logger.warn(
        `[transform] Validation failed (${metadata.metatype?.name ?? "body"}): ${errorMsg.slice(0, 300)}`,
      );
      throw new BadRequestException(`Validation failed: ${errorMsg}`);
    }
    this.logger.info(`[transform] Validation passed (${metadata.metatype?.name ?? "body"})`);
    return result.data;
  }
}
