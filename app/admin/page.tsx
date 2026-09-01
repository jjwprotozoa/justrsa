// app/admin/page.tsx — password-protected order + proof dashboard.

import type { Metadata } from "next";
import { AdminLogin } from "@/components/admin-login";
import { AdminOrders, type AdminOrderCard } from "@/components/admin-orders";
import { adminConfigured, isAdminAuthenticated } from "@/lib/admin-auth";
import { listOrders } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!adminConfigured()) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 sm:px-6">
        <h1 className="display text-4xl">Admin</h1>
        <p className="mt-6 text-sm text-paper-dim">
          Set <span className="font-mono text-paper">ADMIN_PASSWORD</span> in{" "}
          <span className="font-mono text-paper">.env.local</span> (or your host env vars), then
          restart the server.
        </p>
      </div>
    );
  }

  if (!(await isAdminAuthenticated())) {
    return <AdminLogin />;
  }

  const orders: AdminOrderCard[] = (await listOrders(100)).map(({ order, lines, payment }) => ({
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

  return <AdminOrders orders={orders} />;
}
