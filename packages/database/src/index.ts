/**
 * @file packages/database/src/index.ts
 * @description Prisma client singleton and model re-exports for `@devlab-ai-studio/database`.
 * @module @devlab-ai-studio/database
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

export * from "@prisma/client";

/**
 * Creates a configured {@link PrismaClient} backed by `@prisma/adapter-pg`.
 *
 * @param connectionString - Postgres connection URI supplied by the consumer runtime.
 * @returns Configured Prisma client instance.
 */
export function createStudioPrismaClient(connectionString: string): PrismaClient {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}
