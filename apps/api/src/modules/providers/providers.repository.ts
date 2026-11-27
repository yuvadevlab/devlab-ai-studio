import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

export interface UpsertProviderData {
  slug: string;
  name: string;
  baseUrl: string;
  encryptedApiKey?: string;
  keyMask?: string;
  isActive: boolean;
}

export interface UpsertModelData {
  providerId: string;
  modelId: string;
  displayName: string;
  capabilities: Record<string, boolean>;
  contextWindow: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  isActive: boolean;
  isDeprecated: boolean;
}

@Injectable()
export class ProvidersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllProviders() {
    return this.prisma.client.provider.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        baseUrl: true,
        keyMask: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { models: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  findProviderBySlug(slug: string) {
    return this.prisma.client.provider.findUnique({ where: { slug } });
  }

  updateProviderBySlug(
    slug: string,
    data: {
      name?: string;
      baseUrl?: string;
      encryptedApiKey?: string;
      keyMask?: string;
      isActive?: boolean;
    },
  ) {
    return this.prisma.client.provider.update({
      where: { slug },
      data,
      select: {
        id: true,
        slug: true,
        name: true,
        baseUrl: true,
        keyMask: true,
        isActive: true,
        updatedAt: true,
        _count: {
          select: { models: true },
        },
      },
    });
  }

  deleteProviderBySlug(slug: string) {
    return this.prisma.client.provider.delete({
      where: { slug },
      select: { id: true, slug: true, name: true },
    });
  }

  upsertProvider(data: UpsertProviderData) {
    return this.prisma.client.provider.upsert({
      where: { slug: data.slug },
      create: data,
      update: {
        name: data.name,
        baseUrl: data.baseUrl,
        isActive: data.isActive,
        ...(data.encryptedApiKey ? { encryptedApiKey: data.encryptedApiKey } : {}),
        ...(data.keyMask ? { keyMask: data.keyMask } : {}),
      },
      select: {
        id: true,
        slug: true,
        name: true,
        baseUrl: true,
        keyMask: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  findActiveModels() {
    return this.prisma.client.modelCatalog.findMany({
      where: { isActive: true },
      include: {
        provider: {
          select: { id: true, slug: true, name: true },
        },
      },
      orderBy: { displayName: "asc" },
    });
  }

  upsertModel(data: UpsertModelData) {
    return this.prisma.client.modelCatalog.upsert({
      where: { providerId_modelId: { providerId: data.providerId, modelId: data.modelId } },
      create: data,
      update: {
        displayName: data.displayName,
        capabilities: data.capabilities,
        contextWindow: data.contextWindow,
        inputCostPer1M: data.inputCostPer1M,
        outputCostPer1M: data.outputCostPer1M,
        isActive: data.isActive,
        isDeprecated: data.isDeprecated,
      },
    });
  }

  findModelById(id: string) {
    return this.prisma.client.modelCatalog.findUnique({ where: { id } });
  }

  deleteModelById(id: string) {
    return this.prisma.client.modelCatalog.delete({
      where: { id },
      select: { id: true, modelId: true, displayName: true },
    });
  }
}
