import { PrismaClient } from "@prisma/client";

// Vercel's Postgres/Neon integration may expose the URL under a different name.
process.env.DATABASE_URL ||=
  process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_UNPOOLED || "";

const g = globalThis as unknown as { prisma?: PrismaClient; ready?: Promise<void> };
export const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;

export const STATUSES = ["PENDING", "COMPLETED", "FAILED"] as const;
export type Status = (typeof STATUSES)[number];

type Row = { id: string; message: string; status: string; createdAt: Date; updatedAt: Date };
const store = (globalThis as unknown as { rows?: Row[] });
const rows: Row[] = (store.rows ??= []);
// Demo fallback used only when no DATABASE_URL is configured (data is not persistent).
const memoryDb = {
  receipt: {
    async findFirst(_?: unknown) { return rows[0] ?? null; },
    async findUnique({ where }: { where: { id: string } }) { return rows.find((r) => r.id === where.id) ?? null; },
    async create({ data }: { data: { message?: string } }) {
      const now = new Date();
      const r: Row = { id: crypto.randomUUID(), message: data.message ?? "hi this is a demo app", status: "PENDING", createdAt: now, updatedAt: now };
      rows.push(r);
      return r;
    },
    async update({ where, data }: { where: { id: string }; data: { status?: string; message?: string } }) {
      const r = rows.find((x) => x.id === where.id)!;
      if (data.status) r.status = data.status;
      if (data.message) r.message = data.message; r.updatedAt = new Date();
      return r;
    },
  },
} as unknown as PrismaClient;

/** Returns the client once the Receipt table exists (created on first use). */
export async function db() {
  if (!process.env.DATABASE_URL) return memoryDb;
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
