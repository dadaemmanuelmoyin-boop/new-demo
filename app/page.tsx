import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const demo = (await prisma.receipt.findFirst({ orderBy: { createdAt: "asc" } })) ?? (await prisma.receipt.create({ data: {} }));
  redirect(`/receipt/${demo.id}`);
}
