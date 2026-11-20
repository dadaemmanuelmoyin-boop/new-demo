import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  const prisma = await db();
  const body = await req.json().catch(() => ({}));
  const message =
    typeof body.message === "string" && body.message.trim()
      ? body.message.trim().slice(0, 200)
      : undefined;
  const receipt = await prisma.receipt.create({ data: { ...(message && { message }) } });
  return NextResponse.json({ id: receipt.id, url: `/receipt/${receipt.id}` }, { status: 201 });
}
