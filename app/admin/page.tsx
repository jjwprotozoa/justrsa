// app/admin/page.tsx — password-protected order + proof dashboard.

import type { Metadata } from "next";
import { AdminLogin } from "@/components/admin-login";
import { AdminOrders, type AdminOrderCard } from "@/components/admin-orders";
import { adminConfigured, isAdminAuthenticated } from "@/lib/admin-auth";
import { listOrders } from "@/lib/orders";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

function AdminLoadError({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="display text-4xl">Orders</h1>
      <p className="label mt-2 text-paper-dim">JUST RSA · Admin</p>
      <p className="mt-8 border border-gold p-4 text-sm text-paper-dim">{message}</p>
      <p className="mt-4 text-sm text-paper-dim">
        On Hostinger, add{" "}
        <span className="font-mono text-paper">NEXT_PUBLIC_SUPABASE_URL</span> and{" "}
        <span className="font-mono text-paper">SUPABASE_SERVICE_ROLE_KEY</span>, then redeploy.
      </p>
    </div>
  );
}

export default async function AdminPage() {
  if (!adminConfigured()) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 sm:px-6">
        <h1 className="display text-4xl">Admin</h1>
        <p className="mt-6 text-sm text-paper-dim">
          Set <span className="font-mono text-paper">ADMIN_PASSWORD</span> in your host env vars,
          then redeploy.
        </p>
      </div>
    );
  }

  if (!(await isAdminAuthenticated())) {
    return <AdminLogin />;
  }

  if (!isSupabaseConfigured()) {
    return (
      <AdminLoadError message="Supabase is not configured on this server. Orders cannot be loaded." />
    );
  }

  let orders: AdminOrderCard[];
  try {
    orders = (await listOrders(100)).map(({ order, lines, payment }) => ({
      reference: order.reference,
      status: order.status,
      paymentStatus: payment.status,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      total: order.total,
      createdAt: order.created_at,
      hasProof: Boolean(payment.proof_filename),
      proofMime: payment.proof_mime,
      proofUploadedAt: payment.proof_uploaded_at,
      lines: lines.map((line) => ({
        name: line.product_name,
        size: line.size,
        quantity: line.quantity,
      })),
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load orders.";
    return <AdminLoadError message={message} />;
  }

  return <AdminOrders orders={orders} />;
}
