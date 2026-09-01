// lib/payment/paystack.ts
// Paystack ZA — scaffold only. Activate once the account is verified.
//
// WHEN VERIFIED:
//   1. Set PAYMENT_PROVIDER=paystack and PAYSTACK_SECRET_KEY in .env.local
//   2. Implement initializeTransaction() below (POST /transaction/initialize)
//   3. Add app/api/paystack/webhook/route.ts to verify signatures and call
//      markOrderPaid(reference) from lib/orders.ts
//   4. In app/api/orders/route.ts, after createOrder(), call initializeTransaction
//      and return { status: "redirect", url: authorization_url } instead of EFT
//
// Docs: https://paystack.com/docs/payments/accept-payments/
// Amounts: store rand in SQLite; send amount * 100 (cents) to Paystack.

export function paystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY?.trim());
}

export function paystackReady(): boolean {
  return process.env.PAYMENT_PROVIDER === "paystack" && paystackConfigured();
}

/**
 * Placeholder. Replace with a real initialize call once keys exist.
 * Returns a hosted checkout URL the customer is redirected to.
 */
export async function initializePaystackTransaction(_input: {
  email: string;
  /** Amount in rand. Converted to cents inside this function. */
  amountZar: number;
  reference: string;
  callbackUrl: string;
}): Promise<{ authorizationUrl: string } | { error: string }> {
  if (!paystackReady()) {
    return { error: "Paystack is not configured yet (account pending verification)." };
  }

  // TODO: POST https://api.paystack.co/transaction/initialize
  // Authorization: Bearer ${process.env.PAYSTACK_SECRET_KEY}
  // body: { email, amount: amountZar * 100, reference, currency: "ZAR", callback_url }
  void _input;
  return { error: "Paystack initializeTransaction is not wired yet." };
}
