"use client";
import { useEffect, useRef, useState } from "react";

type Receipt = { id: string; message: string; status: "PENDING" | "COMPLETED" | "FAILED" };

const LABEL = { PENDING: "Pending", COMPLETED: "Completed", FAILED: "Failed" } as const;

export default function ReceiptView({ initial }: { initial: Receipt }) {
  const [r, setR] = useState<Receipt>(initial);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial.message);
  const [saving, setSaving] = useState(false);
  const editingRef = useRef(false);
  editingRef.current = editing;

  useEffect(() => {
    const t = setInterval(async () => {
      if (editingRef.current) return;
      try {
        const res = await fetch(`/api/receipts/${r.id}`, { cache: "no-store" });
        if (res.ok) setR(await res.json());
      } catch {}
    }, 3000);
    return () => clearInterval(t);
  }, [r.id]);

  async function toggleStatus() {
    if (editing) return;
    const next = r.status === "PENDING" ? "COMPLETED" : "PENDING";
    setR((p) => ({ ...p, status: next }));
    const res = await fetch(`/api/receipts/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) setR(await res.json());
  }

  async function onCircle() {
    if (!editing) {
      setDraft(r.message);
      setEditing(true);
      return;
    }
    const message = draft.trim();
    if (!message || message === r.message) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setR((p) => ({ ...p, message }));
    try {
      const res = await fetch(`/api/receipts/${r.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (res.ok) setR(await res.json());
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  return (
    <main className="mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col justify-between overflow-hidden bg-white px-6 pb-6 pt-[max(24px,env(safe-area-inset-top))] md:border-x md:border-neutral-200 md:shadow-lg">
      <section className="mt-9 min-h-0">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5CD65C]">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </div>
          <button
            onClick={onCircle}
            disabled={saving}
            aria-label={editing ? "Save" : "Edit"}
            className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors ${
              editing ? "border-[#18D458] bg-[#18D458]" : "border-neutral-300 bg-white"
            }`}
          >
            {editing ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
            )}
          </button>
        </div>

        {editing ? (
          <textarea
            autoFocus
            value={draft}
            maxLength={200}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            className="mt-7 w-full resize-none rounded-xl border-2 border-[#18D458] p-3 text-left text-[22px] font-bold leading-snug text-black outline-none"
          />
        ) : (
          <h1 className="mt-7 break-words text-left text-[22px] font-bold leading-snug text-black">{r.message}</h1>
        )}
      </section>

      <button
        onClick={toggleStatus}
        disabled={editing}
        className={`h-[52px] w-full shrink-0 rounded-full text-base font-semibold text-white transition-colors duration-500 disabled:opacity-60 ${
          r.status === "FAILED" ? "bg-[#E5484D]" : "bg-[#18D458]"
        }`}
      >
        {LABEL[r.status]}
      </button>
    </main>
  );
}
