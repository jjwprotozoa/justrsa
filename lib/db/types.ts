// lib/db/types.ts
// Shared order/payment row shapes used by the Supabase data layer.

export type OrderStatus = "awaiting_eft" | "paid" | "cancelled";
export type PaymentStatus = "pending" | "proof_uploaded" | "confirmed" | "failed";

export type OrderRow = {
  id: string;
  reference: string;
  status: OrderStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  province: string;
  postal_code: string;
  total: number;
  currency: string;
  created_at: string;
  paid_at: string | null;
};

export type OrderLineRow = {
  id: number;
  order_id: string;
  product_id: string;
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
};

export type PaymentRow = {
  id: number;
  order_id: string;
  method: string;
  status: PaymentStatus;
  amount: number;
  reference: string;
  created_at: string;
  confirmed_at: string | null;
  notes: string;
  proof_filename: string | null;
  proof_mime: string | null;
  proof_path: string | null;
  proof_uploaded_at: string | null;
};
