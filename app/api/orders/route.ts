// app/api/orders/route.ts
// Creates a pre-order and returns EFT payment instructions.
// Paystack redirect can replace the EFT branch once PAYMENT_PROVIDER=paystack.

import { NextResponse } from "next/server";
import { createOrder, validateAndTotal } from "@/lib/orders";
import { eftConfigured, getEftDetails } from "@/lib/payment/eft";
import type { PreorderRequest } from "@/lib/payment/types";
import { getProduct, SIZES } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isCustomer(value: unknown): value is PreorderRequest["customer"] {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.fullName === "string" &&
    typeof row.email === "string" &&
    typeof row.phone === "string" &&
    typeof row.addressLine1 === "string" &&
    typeof row.city === "string" &&
    typeof row.province === "string" &&
    typeof row.postalCode === "string"
  );
}

function isPreorderBody(value: unknown): value is PreorderRequest {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  if (!isCustomer(row.customer) || !Array.isArray(row.lines)) return false;
  if (row.currency !== "ZAR" || typeof row.total !== "number") return false;

  return row.lines.every((line) => {
    if (typeof line !== "object" || line === null) return false;
    const item = line as Record<string, unknown>;
    return (
      typeof item.productId === "string" &&
      typeof item.name === "string" &&
      typeof item.size === "string" &&
      SIZES.includes(item.size as (typeof SIZES)[number]) &&
      typeof item.quantity === "number" &&
      typeof item.unitPrice === "number" &&
      getProduct(item.productId)?.name === item.name
    );
  });
}

export async function POST(request: Request) {
  if (!eftConfigured()) {
    return NextResponse.json(
      { error: "EFT payment is not configured. Set EFT_* environment variables." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isPreorderBody(body)) {
    return NextResponse.json({ error: "Invalid order payload." }, { status: 400 });
  }

  const customer = body.customer;
  if (
    !customer.fullName.trim() ||
    !customer.email.trim() ||
    !customer.phone.trim() ||
    !customer.addressLine1.trim() ||
    !customer.city.trim() ||
    !customer.province.trim() ||
    !customer.postalCode.trim()
  ) {
    return NextResponse.json({ error: "All required fields must be filled in." }, { status: 400 });
  }

  const total = validateAndTotal(body.lines);
  if (total === null) {
    return NextResponse.json(
      { error: "One or more items in your cart are invalid." },
      { status: 400 },
    );
  }

  try {
    const stored = await createOrder({
      ...body,
      customer: {
        ...customer,
        fullName: customer.fullName.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
        addressLine1: customer.addressLine1.trim(),
        addressLine2: (customer.addressLine2 ?? "").trim(),
        city: customer.city.trim(),
        province: customer.province.trim(),
        postalCode: customer.postalCode.trim(),
      },
      total,
    });

    const eft = getEftDetails();
    if (!eft) {
      return NextResponse.json({ error: "EFT payment is not configured." }, { status: 503 });
    }

    return NextResponse.json({
      orderId: stored.order.id,
      reference: stored.order.reference,
      total: stored.order.total,
      eft,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
