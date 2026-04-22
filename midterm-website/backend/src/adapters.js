import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  // 告訴伺服器執行時，請連這條有 pooler 的網址
  datasourceUrl: process.env.DATABASE_URL,
});