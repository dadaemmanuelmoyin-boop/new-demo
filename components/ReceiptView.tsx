"use client";
import { useEffect, useState } from "react";

type Receipt = { id: string; message: string; status: "PENDING" | "COMPLETED" | "FAILED" };

const LABEL = { PENDING: "Pending", COMPLETED: "Completed", FAILED: "Failed" } as const;

export default function ReceiptView({ initial }: { initial: Receipt }) {
  const [r, setR] = useState<Receipt>(initial);

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/receipts/${r.id}`, { cache: "no-store" });
        if (res.ok) setR(await res.json());
      } catch {}
    }, 3000);
    return () => clearInterval(t);
  }, [r.id]);

  async function toggle() {
    const next = r.status === "PENDING" ? "COMPLETED" : "PENDING";
    setR((p) => ({ ...p, status: next }));
    const res = await fetch(`/api/receipts/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) setR(await res.json());
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col justify-between bg-white p-6 md:my-6 md:min-h-[860px] md:rounded-3xl md:border md:border-neutral-200 md:shadow-lg">
      <section className="mt-[60px]">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5CD65C]">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h1 className="mt-7 text-left text-[22px] font-bold text-black">{r.message}</h1>
      </section>

      <button
        onClick={toggle}
        className={`mb-6 h-[52px] w-full rounded-full text-base font-semibold text-white transition-colors duration-500 ${
          r.status === "FAILED" ? "bg-[#E5484D]" : "bg-[#18D458]"
        }`}
      >
        {LABEL[r.status]}
      </button>
    </main>
  );
}
