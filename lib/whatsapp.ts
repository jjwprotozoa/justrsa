// lib/whatsapp.ts
// Opens the customer's WhatsApp to message themselves with order details for reference.

/** Strip to digits and normalise SA numbers (0xx → 27xx). */
export function normalizeWhatsAppNumber(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0") && digits.length === 10) return `27${digits.slice(1)}`;
  if (digits.startsWith("27") && digits.length === 11) return digits;
  if (digits.length >= 10 && digits.length <= 15) return digits;
  return null;
}

/** wa.me link to the customer's own number — WhatsApp "message yourself" for order reference. */
export function customerSelfWhatsAppLink(phone: string, text: string): string | null {
  const number = normalizeWhatsAppNumber(phone);
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function statusLabel(paid: boolean, hasProof: boolean): string {
  if (paid) return "Paid";
  if (hasProof) return "Proof uploaded — awaiting confirmation";
  return "Awaiting EFT payment";
}

export function orderSelfWhatsAppMessage(input: {
  reference: string;
  totalLabel: string;
  orderUrl: string;
  customerName: string;
  lines: { name: string; size: string; quantity: number; lineTotal: string }[];
  paid: boolean;
  hasProof: boolean;
}): string {
  const items = input.lines
    .map((line) => `• ${line.name} · ${line.size} × ${line.quantity} — ${line.lineTotal}`)
    .join("\n");

  return [
    "JUST RSA · Drop 001 pre-order",
    "",
    `Ref: ${input.reference}`,
    `Total: ${input.totalLabel}`,
    `Status: ${statusLabel(input.paid, input.hasProof)}`,
    `Name: ${input.customerName}`,
    "",
    "Items:",
    items,
    "",
    `Track order: ${input.orderUrl}`,
  ].join("\n");
}
