import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import type { CreateConsumerAppInput, UpdateConsumerAppInput } from "@devlab-ai-studio/validation";
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

  async updateApp(slug: string, input: UpdateConsumerAppInput) {
    const existing = await this.repository.findBySlug(slug);
    if (!existing) throw new NotFoundException(`Consumer app "${slug}" not found`);

    this.logger.info(`[updateApp] Updating consumer app "${slug}"`);
    return this.repository.updateBySlug(slug, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.ownerEmail !== undefined ? { ownerEmail: input.ownerEmail } : {}),
      ...(input.mcpEndpointUrl !== undefined ? { mcpEndpointUrl: input.mcpEndpointUrl } : {}),
      ...(input.monthlyBudgetUsd !== undefined ? { monthlyBudgetUsd: input.monthlyBudgetUsd } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    });
  }

  async deleteApp(slug: string) {
    const existing = await this.repository.findBySlug(slug);
    if (!existing) throw new NotFoundException(`Consumer app "${slug}" not found`);

    this.logger.info(`[deleteApp] Deleting consumer app "${slug}"`);
    return this.repository.deleteBySlug(slug);
  }

  async rotateAppKey(slug: string) {
    const existing = await this.repository.findBySlug(slug);
    if (!existing) throw new NotFoundException(`Consumer app "${slug}" not found`);

    this.logger.info(`[rotateAppKey] Rotating gateway key for "${slug}"`);
    const { rawKey, keyHash } = this.crypto.generateAppKey();
    const app = await this.repository.updateBySlug(slug, { appKeyHash: keyHash });
    return { app, appKey: rawKey };
  }

  async verifyAppKey(rawKey: string) {
    const keyHash = this.crypto.hashAppKey(rawKey);
    const app = await this.repository.findByKeyHash(keyHash);
    if (!app || !app.isActive) {
      throw new UnauthorizedException("Invalid or inactive consumer app key");
    }
    return app;
  }
}
