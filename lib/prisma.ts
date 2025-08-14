import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? (process.env.DATABASE_URL ? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Performance optimizations
  __internal: {
    engine: {
      // Enable query batching
      enableEngineDebugMode: false,
      // Enable connection pooling
      enableConnectionPooling: true,
    },
  },
}) : null)

if (process.env.NODE_ENV !== 'production' && prisma) globalForPrisma.prisma = prisma 