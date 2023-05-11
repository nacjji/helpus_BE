import { PrismaClient } from '@prisma/client';

export abstract class PrismaMySqlRepository {
  protected prisma: PrismaClient;

  constructor(prismaClient: any) {
    this.prisma = prismaClient;
  }
}
