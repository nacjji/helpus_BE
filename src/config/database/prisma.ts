import { PrismaClient } from '@prisma/client';

const prisma =
  process.env.NODE_ENV === 'development'
    ? new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_TEST_URL,
          },
        },
      })
    : new PrismaClient();

export default prisma;
