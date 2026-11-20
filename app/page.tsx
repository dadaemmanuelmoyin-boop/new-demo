import { redirect } from "next/navigation";
import { db, describeError } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  let id: string;
  try {
    const prisma = await db();
    const demo = (await prisma.receipt.findFirst({ orderBy: { createdAt: "asc" } })) ?? (await prisma.receipt.create({ data: {} }));
    id = demo.id;
  } catch (e) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Database error</h1>
        <p style={{ marginTop: 12, wordBreak: "break-word" }}>{describeError(e)}</p>
      </main>
    );
  }
  redirect(`/receipt/${id}`);
}
