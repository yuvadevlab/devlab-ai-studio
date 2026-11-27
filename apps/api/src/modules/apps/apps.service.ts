import { ConflictException, Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import type { CreateConsumerAppInput } from "@devlab-ai-studio/validation";
import { CryptoService } from "../../common/crypto/crypto.service";
import { AppsRepository } from "./apps.repository";

@Injectable()
export class AppsService {
  private readonly logger = new Logger(AppsService.name);

  constructor(
    private readonly repository: AppsRepository,
    private readonly crypto: CryptoService,
  ) {}

  listApps() {
    this.logger.info("[listApps] Listing registered consumer apps");
    return this.repository.findAll();
  }

  async createApp(input: CreateConsumerAppInput) {
    this.logger.info(`[createApp] Registering consumer app "${input.slug}"`);
    const existing = await this.repository.findBySlug(input.slug);
    if (existing) {
      throw new ConflictException(`Consumer app "${input.slug}" already exists`);
    }

    const { rawKey, keyHash } = this.crypto.generateAppKey();
    const app = await this.repository.createApp({
      slug: input.slug,
      name: input.name,
      ownerEmail: input.ownerEmail,
      appKeyHash: keyHash,
      mcpEndpointUrl: input.mcpEndpointUrl,
      monthlyBudgetUsd: input.monthlyBudgetUsd,
    });

    return {
      app,
      appKey: rawKey,
    };
  }
}
