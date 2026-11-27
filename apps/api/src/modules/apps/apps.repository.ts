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

  findByKeyHash(appKeyHash: string) {
    return this.prisma.client.consumerApp.findFirst({
      where: { appKeyHash },
      select: {
        id: true,
        slug: true,
        name: true,
        isActive: true,
        monthlyBudgetUsd: true,
        mcpEndpointUrl: true,
      },
    });
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

  updateBySlug(
    slug: string,
    data: {
      name?: string;
      ownerEmail?: string;
      mcpEndpointUrl?: string | null;
      monthlyBudgetUsd?: number;
      isActive?: boolean;
      appKeyHash?: string;
    },
  ) {
    return this.prisma.client.consumerApp.update({
      where: { slug },
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

  deleteBySlug(slug: string) {
    return this.prisma.client.consumerApp.delete({
      where: { slug },
      select: { id: true, slug: true, name: true },
    });
  }
}
