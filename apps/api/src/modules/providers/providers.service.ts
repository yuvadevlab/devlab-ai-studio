import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { ProvidersRepository } from "./providers.repository";

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);

  constructor(private readonly repository: ProvidersRepository) {}

  listProviders() {
    this.logger.info("[listProviders] Fetching configured LLM providers");
    return this.repository.findAllProviders();
  }

  listModels() {
    this.logger.info("[listModels] Fetching active model catalog");
    return this.repository.findActiveModels();
  }
}
