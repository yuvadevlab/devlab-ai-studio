import { Injectable, NotFoundException } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import type {
  UpdateProviderInput,
  UpsertModelInput,
  UpsertProviderInput,
} from "@devlab-ai-studio/validation";
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

  async updateProvider(slug: string, input: UpdateProviderInput) {
    const existing = await this.repository.findProviderBySlug(slug);
    if (!existing) throw new NotFoundException(`Provider "${slug}" not found`);

    this.logger.info(`[updateProvider] Updating provider "${slug}"`);
    return this.repository.updateProviderBySlug(slug, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.baseUrl !== undefined ? { baseUrl: input.baseUrl } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.apiKey
        ? {
            encryptedApiKey: this.crypto.encryptSecret(input.apiKey),
            keyMask: this.crypto.maskApiKey(input.apiKey),
          }
        : {}),
    });
  }

  async deleteProvider(slug: string) {
    const existing = await this.repository.findProviderBySlug(slug);
    if (!existing) throw new NotFoundException(`Provider "${slug}" not found`);

    this.logger.info(`[deleteProvider] Deleting provider "${slug}"`);
    return this.repository.deleteProviderBySlug(slug);
  }

  listModels() {
    this.logger.info("[listModels] Fetching active model catalog");
    return this.repository.findActiveModels();
  }

  upsertModel(input: UpsertModelInput) {
    this.logger.info(`[upsertModel] Upserting model "${input.modelId}"`);
    return this.repository.upsertModel(input);
  }

  async deleteModel(id: string) {
    const existing = await this.repository.findModelById(id);
    if (!existing) throw new NotFoundException(`Model "${id}" not found`);

    this.logger.info(`[deleteModel] Deleting model "${existing.modelId}"`);
    return this.repository.deleteModelById(id);
  }
}
