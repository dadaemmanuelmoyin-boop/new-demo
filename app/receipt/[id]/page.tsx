import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import ReceiptView from "@/components/ReceiptView";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { id: string } }) {
  const prisma = await db();
  const r = await prisma.receipt.findUnique({ where: { id: params.id } });
  if (!r) notFound();
  return <ReceiptView initial={{ id: r.id, message: r.message, status: r.status as "PENDING" | "COMPLETED" | "FAILED" }} />;
}
