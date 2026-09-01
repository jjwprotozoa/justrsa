// app/order/[reference]/page.tsx
// Order confirmation with EFT instructions. Bookmarkable by payment reference.

import Link from "next/link";
import { notFound } from "next/navigation";
import { EftInstructions } from "@/components/eft-instructions";
import { OrderPageActions } from "@/components/order-page-actions";
import { OrderStatus } from "@/components/order-status";
import { getOrderByReference } from "@/lib/orders";
import { getEftDetails } from "@/lib/payment/eft";
import { formatZar } from "@/lib/products";
import { orderSelfWhatsAppMessage, customerSelfWhatsAppLink } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://justrsa.co.za";

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
  const hasProof = Boolean(payment.proof_filename);
  const eft = !paid ? getEftDetails() : null;
  const orderUrl = `${SITE_URL}/order/${order.reference}`;
  const totalLabel = formatZar(order.total);
  const whatsappHref = customerSelfWhatsAppLink(
    order.customer_phone,
    orderSelfWhatsAppMessage({
      reference: order.reference,
      totalLabel,
      orderUrl,
      customerName: order.customer_name,
      lines: lines.map((line) => ({
        name: line.product_name,
        size: line.size,
        quantity: line.quantity,
        lineTotal: formatZar(line.unit_price * line.quantity),
      })),
      paid,
      hasProof,
    }),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
      <p className="label text-gold">Pre-order placed</p>
      <h1 className="display mt-3 text-4xl sm:text-6xl">Order {order.reference}</h1>
      <p className="mt-4 text-sm text-paper-dim">
        {order.customer_name} · {order.customer_phone} · {order.customer_email}
      </p>

      <div className="mt-8 space-y-6">
        <OrderStatus paid={paid} hasProof={hasProof} />
        <OrderPageActions
          reference={order.reference}
          customerPhone={order.customer_phone}
          orderUrl={orderUrl}
          whatsappHref={whatsappHref}
        />
      </div>

      <div className="mt-8 border border-line p-5 sm:p-6">
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
            hasProof={hasProof}
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
