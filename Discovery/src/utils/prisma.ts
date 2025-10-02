import { PrismaClient } from "@prisma/client";

let prismaGlobal: PrismaClient | undefined;

export const prisma: PrismaClient = (() => {
  if (prismaGlobal) return prismaGlobal;
  prismaGlobal = new PrismaClient();
  return prismaGlobal;
})();
