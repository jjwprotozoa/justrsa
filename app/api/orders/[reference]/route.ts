// app/api/orders/[reference]/route.ts
// Public lookup by payment reference so customers can reopen EFT instructions.

import { NextResponse } from "next/server";
import { getOrderByReference } from "@/lib/orders";
import { getEftDetails } from "@/lib/payment/eft";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ reference: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { reference } = await context.params;
  const stored = await getOrderByReference(reference);

  if (!stored) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const eft = stored.order.status === "awaiting_eft" ? getEftDetails() : null;

  return NextResponse.json({
    reference: stored.order.reference,
    status: stored.order.status,
    total: stored.order.total,
    currency: stored.order.currency,
    createdAt: stored.order.created_at,
    paidAt: stored.order.paid_at,
    paymentStatus: stored.payment.status,
    proofUploaded: Boolean(stored.payment.proof_filename),
    proofUploadedAt: stored.payment.proof_uploaded_at,
    lines: stored.lines.map((line) => ({
      name: line.product_name,
      size: line.size,
      quantity: line.quantity,
      unitPrice: line.unit_price,
    })),
    eft,
  });
}
