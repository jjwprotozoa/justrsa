// lib/payment/index.ts
// Client-side checkout entry point. EFT orders POST to /api/orders; card providers
// can be added later without touching the checkout form.

import type { EftDetails } from "./eft";
import type { PreorderRequest, PreorderResult } from "./types";

export type { Customer, EftDetails, PreorderLine, PreorderRequest, PreorderResult } from "./types";

type OrderApiResponse = {
  orderId: string;
  reference: string;
  total: number;
  eft: EftDetails;
};

function isOrderResponse(data: unknown): data is OrderApiResponse {
  if (typeof data !== "object" || data === null) return false;
  const row = data as Record<string, unknown>;
  return (
    typeof row.orderId === "string" &&
    typeof row.reference === "string" &&
    typeof row.total === "number" &&
    typeof row.eft === "object" &&
    row.eft !== null
  );
}

export async function startPreorderCheckout(request: PreorderRequest): Promise<PreorderResult> {
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    const data: unknown = await response.json();

    if (!response.ok) {
      const message =
        typeof data === "object" && data !== null && "error" in data
          ? String((data as { error: string }).error)
          : "Could not place your pre-order. Try again.";
      return { status: "error", message };
    }

    if (isOrderResponse(data)) {
      return {
        status: "eft",
        orderId: data.orderId,
        reference: data.reference,
        total: data.total,
        eft: data.eft,
      };
    }

    return { status: "error", message: "Unexpected response from the server." };
  } catch {
    return { status: "error", message: "Network error. Check your connection and try again." };
  }
}
