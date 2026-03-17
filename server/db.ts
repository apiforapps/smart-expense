import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  var prisma: InstanceType<typeof PrismaClient> | undefined;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const db = globalThis.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}
