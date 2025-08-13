import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
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
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 