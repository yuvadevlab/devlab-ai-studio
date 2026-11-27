import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ProvidersService } from "./providers.service";

@ApiTags("providers")
@Controller("providers")
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  @ApiOperation({ summary: "List configured LLM providers (keys masked)" })
  listProviders() {
    return this.providersService.listProviders();
  }

  @Get("models")
  @ApiOperation({ summary: "List all active models across providers" })
  listModels() {
    return this.providersService.listModels();
  }
}
