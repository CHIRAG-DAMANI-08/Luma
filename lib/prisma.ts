import { PrismaClient } from '@prisma/client';

declare global {
  // This prevents duplicate instances of PrismaClient in development
  var prisma: PrismaClient | undefined;
}

// Use the existing Prisma client instance if it exists, otherwise create a new one
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Store the Prisma client in the global object in development to prevent hot-reloading issues
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma };
