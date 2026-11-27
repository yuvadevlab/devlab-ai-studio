import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

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
      },
      orderBy: { name: "asc" },
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
}
