import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import type { UpsertModelInput, UpsertProviderInput } from "@devlab-ai-studio/validation";
import { CryptoService } from "../../common/crypto/crypto.service";
import { ProvidersRepository } from "./providers.repository";

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);

  constructor(
    private readonly repository: ProvidersRepository,
    private readonly crypto: CryptoService,
  ) {}

  listProviders() {
    this.logger.info("[listProviders] Fetching configured LLM providers");
    return this.repository.findAllProviders();
  }

  upsertProvider(input: UpsertProviderInput) {
    this.logger.info(`[upsertProvider] Upserting provider "${input.slug}"`);
    return this.repository.upsertProvider({
      slug: input.slug,
      name: input.name,
      baseUrl: input.baseUrl,
      isActive: input.isActive,
      ...(input.apiKey
        ? {
            encryptedApiKey: this.crypto.encryptSecret(input.apiKey),
            keyMask: this.crypto.maskApiKey(input.apiKey),
          }
        : {}),
    });
  }

  listModels() {
    this.logger.info("[listModels] Fetching active model catalog");
    return this.repository.findActiveModels();
  }

  upsertModel(input: UpsertModelInput) {
    this.logger.info(`[upsertModel] Upserting model "${input.modelId}"`);
    return this.repository.upsertModel(input);
  }
}
