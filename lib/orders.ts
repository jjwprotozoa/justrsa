// lib/orders.ts
// Create and look up pre-orders in Supabase. Amounts are whole rand (ZAR).
// Proof files live in the private `payment-proofs` storage bucket.

import { randomBytes, randomUUID } from "node:crypto";
import { getSupabaseAdmin, PROOF_BUCKET } from "@/lib/supabase/admin";
import type { OrderLineRow, OrderRow, PaymentRow } from "@/lib/db/types";
import { getProduct } from "@/lib/products";
import type { Customer, PreorderLine, PreorderRequest } from "@/lib/payment/types";

export type { OrderLineRow, OrderRow, PaymentRow } from "@/lib/db/types";

export type StoredOrder = {
  order: OrderRow;
  lines: OrderLineRow[];
  payment: PaymentRow;
};

function makeReference(): string {
  return `JRS-${randomBytes(3).toString("hex").toUpperCase()}`;
}

/** Recomputes the cart total from the catalogue so client totals cannot be spoofed. */
export function validateAndTotal(lines: PreorderLine[]): number | null {
  if (lines.length === 0) return null;
  let total = 0;
  for (const line of lines) {
    const product = getProduct(line.productId);
    if (!product || product.price !== line.unitPrice || line.quantity < 1) {
      return null;
    }
    total += product.price * line.quantity;
  }
  return total;
}

export async function createOrder(request: PreorderRequest): Promise<StoredOrder> {
  const total = validateAndTotal(request.lines);
  if (total === null || total !== request.total) {
    throw new Error("Invalid order total.");
  }

  const db = getSupabaseAdmin();
  const id = randomUUID();
  const reference = makeReference();
  const now = new Date().toISOString();

  const { error: orderError } = await db.from("orders").insert({
    id,
    reference,
    status: "awaiting_eft",
    customer_name: request.customer.fullName,
    customer_email: request.customer.email,
    customer_phone: request.customer.phone,
    address_line1: request.customer.addressLine1,
    address_line2: request.customer.addressLine2,
    city: request.customer.city,
    province: request.customer.province,
    postal_code: request.customer.postalCode,
    total,
    currency: request.currency,
    created_at: now,
  });
  if (orderError) throw new Error(orderError.message);

  const { error: linesError } = await db.from("order_lines").insert(
    request.lines.map((line) => ({
      order_id: id,
      product_id: line.productId,
      product_name: line.name,
      size: line.size,
      quantity: line.quantity,
      unit_price: line.unitPrice,
    })),
  );
  if (linesError) {
    await db.from("orders").delete().eq("id", id);
    throw new Error(linesError.message);
  }

  const { error: paymentError } = await db.from("payments").insert({
    order_id: id,
    method: "eft",
    status: "pending",
    amount: total,
    reference,
    created_at: now,
  });
  if (paymentError) {
    await db.from("orders").delete().eq("id", id);
    throw new Error(paymentError.message);
  }

  const stored = await getOrderByReference(reference);
  if (!stored) throw new Error("Order was not saved.");
  return stored;
}

export async function getOrderByReference(reference: string): Promise<StoredOrder | null> {
  const db = getSupabaseAdmin();
  const { data: order, error } = await db
    .from("orders")
    .select("*")
    .eq("reference", reference.toUpperCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!order) return null;

  const { data: lines, error: linesError } = await db
    .from("order_lines")
    .select("*")
    .eq("order_id", order.id)
    .order("id");
  if (linesError) throw new Error(linesError.message);

  const { data: payment, error: paymentError } = await db
    .from("payments")
    .select("*")
    .eq("order_id", order.id)
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (paymentError) throw new Error(paymentError.message);
  if (!payment) return null;

  return {
    order: order as OrderRow,
    lines: (lines ?? []) as OrderLineRow[],
    payment: payment as PaymentRow,
  };
}

export async function markOrderPaid(reference: string, notes = ""): Promise<boolean> {
  const db = getSupabaseAdmin();
  const now = new Date().toISOString();
  const ref = reference.toUpperCase();

  const { data: updated, error } = await db
    .from("orders")
    .update({ status: "paid", paid_at: now })
    .eq("reference", ref)
    .eq("status", "awaiting_eft")
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!updated) return false;

  const { error: paymentError } = await db
    .from("payments")
    .update({ status: "confirmed", confirmed_at: now, notes })
    .eq("reference", ref)
    .in("status", ["pending", "proof_uploaded"]);
  if (paymentError) throw new Error(paymentError.message);

  return true;
}

const ALLOWED_PROOF_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export const MAX_PROOF_BYTES = 8 * 1024 * 1024;

/** Uploads proof to Supabase Storage and marks the payment as proof_uploaded. */
export async function attachProofOfPayment(
  reference: string,
  file: { buffer: Buffer; mime: string; originalName: string },
): Promise<{ ok: true; filename: string } | { ok: false; error: string }> {
  const ext = ALLOWED_PROOF_TYPES[file.mime];
  if (!ext) return { ok: false, error: "Upload a JPG, PNG, WebP or PDF." };
  if (file.buffer.byteLength === 0 || file.buffer.byteLength > MAX_PROOF_BYTES) {
    return { ok: false, error: "File must be under 8 MB." };
  }

  const stored = await getOrderByReference(reference);
  if (!stored) return { ok: false, error: "Order not found." };
  if (stored.order.status === "paid" || stored.payment.status === "confirmed") {
    return { ok: false, error: "This order is already marked paid." };
  }

  const ref = stored.order.reference;
  const filename = `${ref}.${ext}`;
  const path = `${ref}/${filename}`;
  const db = getSupabaseAdmin();

  if (stored.payment.proof_path && stored.payment.proof_path !== path) {
    await db.storage.from(PROOF_BUCKET).remove([stored.payment.proof_path]);
  }

  const { error: uploadError } = await db.storage.from(PROOF_BUCKET).upload(path, file.buffer, {
    contentType: file.mime,
    upsert: true,
  });
  if (uploadError) return { ok: false, error: uploadError.message };

  const now = new Date().toISOString();
  const { error: updateError } = await db
    .from("payments")
    .update({
      status: "proof_uploaded",
      proof_filename: filename,
      proof_mime: file.mime,
      proof_path: path,
      proof_uploaded_at: now,
      notes: `Proof uploaded: ${file.originalName.slice(0, 120)}`,
    })
    .eq("order_id", stored.order.id);
  if (updateError) return { ok: false, error: updateError.message };

  return { ok: true, filename };
}

/** Downloads a proof file from Storage for admin preview. */
export async function getProofFile(
  reference: string,
): Promise<{ bytes: Buffer; mime: string; filename: string } | null> {
  const stored = await getOrderByReference(reference);
  if (!stored?.payment.proof_path || !stored.payment.proof_mime || !stored.payment.proof_filename) {
    return null;
  }

  const db = getSupabaseAdmin();
  const { data, error } = await db.storage.from(PROOF_BUCKET).download(stored.payment.proof_path);
  if (error || !data) return null;

  const bytes = Buffer.from(await data.arrayBuffer());
  return {
    bytes,
    mime: stored.payment.proof_mime,
    filename: stored.payment.proof_filename,
  };
}

export async function listOrders(limit = 50): Promise<StoredOrder[]> {
  const db = getSupabaseAdmin();
  const { data: orders, error } = await db
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  if (!orders?.length) return [];

  const results: StoredOrder[] = [];
  for (const order of orders as OrderRow[]) {
    const { data: lines } = await db
      .from("order_lines")
      .select("*")
      .eq("order_id", order.id)
      .order("id");
    const { data: payment } = await db
      .from("payments")
      .select("*")
      .eq("order_id", order.id)
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (payment) {
      results.push({
        order,
        lines: (lines ?? []) as OrderLineRow[],
        payment: payment as PaymentRow,
      });
    }
  }
  return results;
}

export type { Customer, PreorderLine, PreorderRequest };
