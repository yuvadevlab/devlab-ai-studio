import { Injectable } from "@nestjs/common";
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
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
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
}
