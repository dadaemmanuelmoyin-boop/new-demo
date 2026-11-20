import { PrismaClient } from "@prisma/client";

// Vercel's Postgres/Neon integration may expose the URL under a different name.
process.env.DATABASE_URL ||=
  process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_UNPOOLED || "";

const g = globalThis as unknown as { prisma?: PrismaClient; ready?: Promise<void> };
export const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;

export const STATUSES = ["PENDING", "COMPLETED", "FAILED"] as const;
export type Status = (typeof STATUSES)[number];

/** Returns the client once the Receipt table exists (created on first use). */
export async function db() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add a Postgres database to the Vercel project and redeploy.");
  }
  if (!g.ready) {
    g.ready = prisma
      .$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS "Receipt" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "message" TEXT NOT NULL DEFAULT 'hi this is a demo app',
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`
      )
      .then(() => undefined)
      .catch((e: unknown) => {
        g.ready = undefined;
        throw e;
      });
  }
  await g.ready;
  return prisma;
}

export function describeError(e: unknown) {
  const m = e instanceof Error ? e.message : String(e);
  return m.replace(/postgres(ql)?:\/\/[^\s"']+/g, "postgresql://***").split("\n").filter(Boolean).slice(-4).join(" ");
}
