// lib/payment/index.ts
// The one and only integration point for a South African payment provider
// (Yoco, Paystack ZA, PayFast, Peach, Ozow...).
//
// Nothing is charged today. `startPreorderCheckout` deliberately returns
// `unavailable` so the checkout UI can be built, reviewed and shipped before a
// provider account exists.
//
// TO GO LIVE:
//   1. Add a server route (e.g. app/api/checkout/route.ts) that reads the
//      provider secret from process.env and creates a hosted payment session
//      from a `PreorderRequest`. Never call a provider directly from the client.
//   2. Persist the order (customer + lines + reference) before redirecting.
//   3. Replace the body of `startPreorderCheckout` with a fetch to that route
//      and return `{ status: "redirect", url }`.
//   4. Handle the provider webhook to confirm payment and mark the order paid.
//
// Amounts here are in rand. Most providers expect cents — convert at the
// boundary in step 1, not in the UI.

import type { PreorderRequest, PreorderResult } from "./types";

export type { Customer, PreorderLine, PreorderRequest, PreorderResult } from "./types";

/** Flip to true once a provider is wired up behind a server route. */
export const PAYMENTS_ENABLED = false;

export const PAYMENTS_DISABLED_MESSAGE =
  "Checkout opens once Drop 001 production timing is confirmed. Your details are not submitted yet.";

export async function startPreorderCheckout(request: PreorderRequest): Promise<PreorderResult> {
  if (!PAYMENTS_ENABLED) {
    return { status: "unavailable", message: PAYMENTS_DISABLED_MESSAGE };
  }

  // Replace with: POST /api/checkout -> provider session -> { url }
  void request;
  return { status: "error", message: "No payment provider is configured." };
}
