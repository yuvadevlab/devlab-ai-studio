import { Injectable } from "@nestjs/common";
import type { CreateProfileVersionInput } from "@devlab-ai-studio/validation";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class ProfilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAppBySlug(slug: string) {
    return this.prisma.client.consumerApp.findUnique({ where: { slug } });
  }

  findProfilesByAppId(appId: string) {
    return this.prisma.client.aiProfile.findMany({
      where: { appId },
      include: { versions: { orderBy: { version: "desc" }, take: 5 } },
      orderBy: { slug: "asc" },
    });
  }

  findProfileWithVersions(appId: string, slug: string) {
    return this.prisma.client.aiProfile.findUnique({
      where: { appId_slug: { appId, slug } },
      include: {
        versions: {
          orderBy: { version: "desc" },
          include: { primaryModel: { include: { provider: true } } },
        },
      },
    });
  }

  async createProfileVersion(appId: string, input: CreateProfileVersionInput) {
    return this.prisma.client.$transaction(async (tx) => {
      let profile = await tx.aiProfile.findUnique({
        where: { appId_slug: { appId, slug: input.slug } },
        include: { versions: { orderBy: { version: "desc" }, take: 1 } },
      });

      if (!profile) {
        profile = await tx.aiProfile.create({
          data: { appId, slug: input.slug, name: input.name },
          include: { versions: true },
        });
      }

      const nextVersion = (profile.versions[0]?.version ?? 0) + 1;
      const createdVersion = await tx.aiProfileVersion.create({
        data: {
          profileId: profile.id,
          version: nextVersion,
          primaryModelId: input.primaryModelId,
          fallbackModelIds: input.fallbackModelIds,
          creativityPreset: input.creativityPreset,
          temperature: input.temperature,
          maxTurns: input.maxTurns,
          maxTokens: input.maxTokens,
          featureFlags: input.featureFlags,
          enabledToolNamespaces: input.enabledToolNamespaces,
          systemPrompt: input.systemPrompt,
        },
      });

      if (input.publish) {
        await tx.aiProfile.update({
          where: { id: profile.id },
          data: { name: input.name, publishedVersionId: createdVersion.id },
        });
      }

      return { profileId: profile.id, version: createdVersion };
    });
  }

  publishVersion(profileId: string, versionId: string) {
    return this.prisma.client.aiProfile.update({
      where: { id: profileId },
      data: { publishedVersionId: versionId },
    });
  }
}
