import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

function buildStaleClientError(delegateName: string): string {
  return [
    `Prisma client delegate "prisma.${delegateName}" is missing.`,
    "This usually means your generated Prisma client is stale compared to prisma/schema.prisma.",
    "Run: npx prisma generate",
    "Then: npx prisma db push",
    "Then restart the dev server.",
  ].join(" ");
}

export function assertPrismaDelegate(delegateName: string): void {
  const delegate = (prisma as unknown as Record<string, unknown>)[delegateName];
  if (!delegate || typeof delegate !== "object") {
    throw new Error(buildStaleClientError(delegateName));
  }
}

export function assertPrismaDelegates(delegateNames: string[]): void {
  delegateNames.forEach(assertPrismaDelegate);
}
