// app/order/[reference]/page.tsx
// Order confirmation with EFT instructions. Bookmarkable by payment reference.

import Link from "next/link";
import { notFound } from "next/navigation";
import { EftInstructions } from "@/components/eft-instructions";
import { getOrderByReference } from "@/lib/orders";
import { getEftDetails } from "@/lib/payment/eft";
import { formatZar } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ reference: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { reference } = await params;
  return {
    title: `Order ${reference}`,
    robots: { index: false, follow: false },
  };
}

export default async function OrderPage({ params }: PageProps) {
  const { reference } = await params;
  const stored = await getOrderByReference(reference);
  if (!stored) notFound();

  const { order, lines, payment } = stored;
  const paid = order.status === "paid" || payment.status === "confirmed";
  const eft = !paid ? getEftDetails() : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
      <p className="label text-gold">Pre-order placed</p>
      <h1 className="display mt-3 text-4xl sm:text-6xl">Order {order.reference}</h1>
      <p className="mt-4 text-sm text-paper-dim">
        Confirmation for <span className="text-paper">{order.customer_email}</span>
      </p>

      <div className="mt-10 border border-line p-5 sm:p-6">
        <h2 className="label text-paper-dim">Items</h2>
        <ul className="mt-4 space-y-3">
          {lines.map((line) => (
            <li key={line.id} className="flex justify-between gap-4 text-sm">
              <span>
                {line.product_name}
                <span className="label ml-2 text-paper-dim">
                  {line.size} × {line.quantity}
                </span>
              </span>
              <span className="label shrink-0">{formatZar(line.unit_price * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex justify-between border-t border-line pt-5">
          <span className="label text-paper-dim">Total</span>
          <span className="display text-2xl">{formatZar(order.total)}</span>
        </div>
      </div>

      <div className="mt-8">
        {paid ? (
          <EftInstructions reference={order.reference} paid />
        ) : eft ? (
          <EftInstructions
            reference={order.reference}
            total={order.total}
            eft={eft}
            hasProof={Boolean(payment.proof_filename)}
            proofUploadedAt={payment.proof_uploaded_at}
          />
        ) : (
          <p className="text-sm text-paper-dim">Awaiting payment confirmation.</p>
        )}
      </div>

      <Link
        href="/"
        className="label mt-10 inline-flex border border-paper px-6 py-4 transition-colors hover:bg-paper hover:text-ink"
      >
        [ Back to Drop 001 ]
      </Link>
    </div>
  );
}
