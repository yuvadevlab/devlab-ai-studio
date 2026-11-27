import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class AppsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.client.consumerApp.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        ownerEmail: true,
        mcpEndpointUrl: true,
        monthlyBudgetUsd: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.client.consumerApp.findUnique({ where: { slug } });
  }

  createApp(data: {
    slug: string;
    name: string;
    ownerEmail: string;
    appKeyHash: string;
    mcpEndpointUrl?: string;
    monthlyBudgetUsd: number;
  }) {
    return this.prisma.client.consumerApp.create({
      data,
      select: {
        id: true,
        slug: true,
        name: true,
        ownerEmail: true,
        mcpEndpointUrl: true,
        monthlyBudgetUsd: true,
        isActive: true,
        createdAt: true,
      },
    });
  }
}
