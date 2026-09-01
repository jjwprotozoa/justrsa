// components/order-page-actions.tsx
// Copy reference/link and open WhatsApp with a pre-filled order message.

"use client";

import { useState } from "react";

type OrderPageActionsProps = {
  reference: string;
  customerPhone: string;
  orderUrl: string;
  whatsappHref: string | null;
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function OrderPageActions({
  reference,
  customerPhone,
  orderUrl,
  whatsappHref,
}: OrderPageActionsProps) {
  const [notice, setNotice] = useState<string | null>(null);

  async function handleCopy(text: string, label: string) {
    const ok = await copyText(text);
    setNotice(ok ? `${label} copied.` : `Could not copy ${label.toLowerCase()}.`);
    window.setTimeout(() => setNotice(null), 2500);
  }

  return (
    <div className="border border-line p-5 sm:p-6">
      <h2 className="label text-paper-dim">Track this order</h2>
      <p className="mt-3 text-sm leading-relaxed text-paper-dim">
        Bookmark this page or save your reference{" "}
        <span className="font-mono text-paper">{reference}</span>. Come back anytime to check
        payment status or upload proof.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => handleCopy(reference, "Reference")}
          className="label border border-line px-5 py-3 text-paper transition-colors hover:border-paper"
        >
          [ Copy reference ]
        </button>
        <button
          type="button"
          onClick={() => handleCopy(orderUrl, "Link")}
          className="label border border-line px-5 py-3 text-paper transition-colors hover:border-paper"
        >
          [ Copy page link ]
        </button>
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="label border border-paper bg-paper px-5 py-3 text-center text-ink transition-colors hover:border-gold hover:bg-gold"
          >
            [ Save to WhatsApp ]
          </a>
        ) : null}
      </div>

      {whatsappHref ? (
        <p className="mt-3 text-xs text-paper-dim">
          Opens WhatsApp on {customerPhone} with a copy of this order — send it to yourself to keep
          for reference.
        </p>
      ) : (
        <p className="mt-3 text-xs text-paper-dim">
          Add a valid mobile number at checkout to save this order to WhatsApp.
        </p>
      )}

      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-gold">
        {notice}
      </p>
    </div>
  );
}
