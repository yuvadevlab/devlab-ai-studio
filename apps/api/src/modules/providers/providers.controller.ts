import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { StudioApiRoute } from "@devlab-ai-studio/shared-types";
import {
  upsertModelSchema,
  upsertProviderSchema,
  type UpsertModelInput,
  type UpsertProviderInput,
} from "@devlab-ai-studio/validation";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { ProvidersService } from "./providers.service";

@ApiTags(StudioApiRoute.PROVIDERS)
@Controller(StudioApiRoute.PROVIDERS)
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  @ApiOperation({ summary: "List configured LLM providers (keys masked)" })
  listProviders() {
    return this.providersService.listProviders();
  }

  @Post()
  @ApiOperation({ summary: "Create or update an LLM provider (encrypts API key at rest)" })
  upsertProvider(@Body(new ZodValidationPipe(upsertProviderSchema)) body: UpsertProviderInput) {
    return this.providersService.upsertProvider(body);
  }

  @Get(StudioApiRoute.PROVIDERS_MODELS)
  @ApiOperation({ summary: "List all active models across providers" })
  listModels() {
    return this.providersService.listModels();
  }

  @Post(StudioApiRoute.PROVIDERS_MODELS)
  @ApiOperation({ summary: "Create or update a model catalog entry and its token pricing" })
  upsertModel(@Body(new ZodValidationPipe(upsertModelSchema)) body: UpsertModelInput) {
    return this.providersService.upsertModel(body);
  }
}
