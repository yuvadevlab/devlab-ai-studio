import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { createStudioPrismaClient } from "@devlab-ai-studio/database";

@Injectable()
export class PrismaService implements OnModuleDestroy {
  readonly client = createStudioPrismaClient(
    process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/devlab_ai_studio",
  );

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
