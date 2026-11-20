import { NextResponse } from "next/server";
import { db, STATUSES } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const pick = (r: { id: string; message: string; status: string; updatedAt: Date }) => ({
  id: r.id, message: r.message, status: r.status, updatedAt: r.updatedAt,
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const prisma = await db();
  const r = await prisma.receipt.findUnique({ where: { id: params.id } });
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(pick(r));
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const prisma = await db();
  const body = await req.json().catch(() => ({}));
  if (!STATUSES.includes(body.status)) {
    return NextResponse.json({ error: `status must be one of ${STATUSES.join(", ")}` }, { status: 400 });
  }
  const exists = await prisma.receipt.findUnique({ where: { id: params.id } });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const r = await prisma.receipt.update({ where: { id: params.id }, data: { status: body.status } });
  return NextResponse.json(pick(r));
}
