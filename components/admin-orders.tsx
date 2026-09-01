// components/admin-orders.tsx — order list with proof preview and mark-paid actions.

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatZar } from "@/lib/products";

export type AdminOrderCard = {
  reference: string;
  status: string;
  paymentStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  createdAt: string;
  hasProof: boolean;
  proofMime: string | null;
  proofUploadedAt: string | null;
  lines: { name: string; size: string; quantity: number }[];
};

export function AdminOrders({ orders }: { orders: AdminOrderCard[] }) {
  const router = useRouter();
  const [busyRef, setBusyRef] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  async function markPaid(reference: string) {
    setBusyRef(reference);
    setNotice(null);
    const response = await fetch(`/api/admin/orders/${encodeURIComponent(reference)}/paid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: "Marked paid in admin" }),
    });
    setBusyRef(null);
    if (!response.ok) {
      const data: unknown = await response.json().catch(() => null);
      setNotice(
        typeof data === "object" && data && "error" in data
          ? String((data as { error: string }).error)
          : "Could not mark paid.",
      );
      return;
    }
    setNotice(`${reference} marked paid.`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl sm:text-5xl">Orders</h1>
          <p className="label mt-2 text-paper-dim">JUST RSA · Admin</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="label border border-line px-4 py-3 text-paper-dim transition-colors hover:border-paper hover:text-paper"
        >
          [ Sign out ]
        </button>
      </div>

      <p aria-live="polite" className="mt-4 min-h-5 text-sm text-gold">
        {notice}
      </p>

      {orders.length === 0 ? (
        <p className="mt-12 text-paper-dim">No orders yet.</p>
      ) : (
        <ul className="mt-10 space-y-6">
          {orders.map((order) => {
            const paid = order.status === "paid" || order.paymentStatus === "confirmed";
            const proofIsImage = order.proofMime?.startsWith("image/");
            return (
              <li key={order.reference} className="border border-line">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-4 sm:p-5">
                  <div>
                    <p className="display text-xl">{order.reference}</p>
                    <p className="label mt-2 text-paper-dim">
                      {order.status} · {order.paymentStatus}
                      {order.hasProof ? " · proof on file" : ""}
                    </p>
                    <p className="mt-2 text-sm text-paper">
                      {order.customerName} · {order.customerEmail} · {order.customerPhone}
                    </p>
                    <p className="mt-1 text-xs text-paper-dim">
                      {new Date(order.createdAt).toLocaleString("en-ZA")}
                    </p>
                  </div>
                  <p className="display text-2xl text-gold">{formatZar(order.total)}</p>
                </div>

                <ul className="space-y-2 border-b border-line px-4 py-4 text-sm sm:px-5">
                  {order.lines.map((line) => (
                    <li key={`${line.name}:${line.size}`}>
                      {line.name}{" "}
                      <span className="label text-paper-dim">
                        {line.size} × {line.quantity}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:p-5">
                  <div>
                    {order.hasProof ? (
                      <>
                        {proofIsImage ? (
                          // biome-ignore lint/performance/noImgElement: auth-gated dynamic proof URL
                          <img
                            src={`/api/admin/orders/${encodeURIComponent(order.reference)}/proof`}
                            alt={`Proof for ${order.reference}`}
                            className="max-h-80 w-full border border-line object-contain bg-ink-soft"
                          />
                        ) : null}
                        <a
                          href={`/api/admin/orders/${encodeURIComponent(order.reference)}/proof`}
                          target="_blank"
                          rel="noreferrer"
                          className="label mt-3 inline-block text-gold underline underline-offset-4"
                        >
                          Open proof
                          {order.proofUploadedAt
                            ? ` · ${new Date(order.proofUploadedAt).toLocaleString("en-ZA")}`
                            : ""}
                        </a>
                      </>
                    ) : (
                      <p className="text-sm text-paper-dim">No proof uploaded yet.</p>
                    )}
                  </div>

                  <div className="sm:self-end">
                    {paid ? (
                      <p className="label text-gold">Paid</p>
                    ) : (
                      <button
                        type="button"
                        disabled={busyRef === order.reference}
                        onClick={() => markPaid(order.reference)}
                        className="label border border-paper bg-paper px-5 py-3 text-ink hover:bg-gold hover:border-gold disabled:opacity-50"
                      >
                        {busyRef === order.reference ? "Saving…" : "[ Mark paid ]"}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
