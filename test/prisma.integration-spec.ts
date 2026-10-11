import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../src/prisma/prisma.service.js';

const databaseTests = process.env.DATABASE_URL ? describe : describe.skip;

databaseTests('PrismaService integration', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
  });

  afterAll(async () => {
    await prisma.onModuleDestroy();
  });

  it('connects to the configured PostgreSQL database', async () => {
    const result = await prisma.$queryRaw<Array<{ one: number }>>`SELECT 1 AS one`;

    expect(result).toEqual([{ one: 1 }]);
  });
});
