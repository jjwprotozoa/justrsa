// app/checkout/checkout-view.tsx
// Collects fulfilment details, saves the order, and redirects to EFT instructions.

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatZar, getProduct } from "@/lib/products";
import { startPreorderCheckout, type Customer, type PreorderLine } from "@/lib/payment";
import { Field } from "./field";

export function CheckoutView() {
  const router = useRouter();
  const { lines, subtotal, ready, clear } = useCart();
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const orderLines: PreorderLine[] = lines.flatMap((line) => {
    const product = getProduct(line.productId);
    if (!product) return [];
    return [
      {
        productId: product.id,
        name: product.name,
        size: line.size,
        quantity: line.quantity,
        unitPrice: product.price,
      },
    ];
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const customer: Customer = {
      fullName: String(data.get("fullName") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      addressLine1: String(data.get("addressLine1") ?? "").trim(),
      addressLine2: String(data.get("addressLine2") ?? "").trim(),
      city: String(data.get("city") ?? "").trim(),
      province: String(data.get("province") ?? "").trim(),
      postalCode: String(data.get("postalCode") ?? "").trim(),
    };

    setSubmitting(true);
    setNotice(null);
    const result = await startPreorderCheckout({
      customer,
      lines: orderLines,
      total: subtotal,
      currency: "ZAR",
    });
    setSubmitting(false);

    if (result.status === "eft") {
      clear();
      router.push(`/order/${result.reference}`);
      return;
    }
    if (result.status === "redirect") {
      clear();
      window.location.assign(result.url);
      return;
    }
    setNotice(result.message);
  }

  if (!ready || lines.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
        <h1 className="display text-4xl sm:text-6xl">Checkout</h1>
        <p className="mt-6 text-paper-dim">
          {ready ? "There is nothing to pre-order yet." : "Loading your order…"}
        </p>
        {ready ? (
          <Link
            href="/#drop-001"
            className="label mt-8 inline-flex border border-paper px-6 py-4 transition-colors hover:bg-paper hover:text-ink"
          >
            [ Shop Drop 001 ]
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
      <h1 className="display text-4xl sm:text-6xl">Checkout</h1>
      <p className="label mt-3 text-paper-dim">Drop 001 · Pre-order · EFT</p>

      <p className="mt-6 max-w-xl text-sm text-paper-dim">
        Place your pre-order below. You will get FNB bank details and a unique payment reference on
        the next screen. Card checkout via Paystack will be added once the account is verified.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        <form className="min-w-0 lg:col-start-1 lg:row-start-1" onSubmit={handleSubmit} noValidate={false}>
          <fieldset className="border-t border-line pt-6">
            <legend className="sr-only">Contact details</legend>
            <h2 className="label text-gold">Contact</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field
                label="Full name"
                name="fullName"
                autoComplete="name"
                className="sm:col-span-2"
              />
              <Field
                label="Email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
              />
              <Field label="Phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" />
            </div>
          </fieldset>

          <fieldset className="mt-10 border-t border-line pt-6">
            <legend className="sr-only">Delivery address</legend>
            <h2 className="label text-gold">Delivery address</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field
                label="Street address"
                name="addressLine1"
                autoComplete="address-line1"
                className="sm:col-span-2"
              />
              <Field
                label="Suburb / complex"
                name="addressLine2"
                autoComplete="address-line2"
                required={false}
                className="sm:col-span-2"
              />
              <Field label="City" name="city" autoComplete="address-level2" />
              <Field label="Province" name="province" autoComplete="address-level1" />
              <Field
                label="Postal code"
                name="postalCode"
                inputMode="numeric"
                autoComplete="postal-code"
              />
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={submitting}
            className="label mt-10 w-full border border-paper bg-paper px-6 py-4 text-ink transition-colors hover:border-gold hover:bg-gold disabled:opacity-50"
          >
            {submitting ? "Placing pre-order…" : "[ Place pre-order ]"}
          </button>

          <p aria-live="polite" className="mt-4 min-h-6 text-sm text-gold">
            {notice}
          </p>
        </form>

        <aside className="order-first min-w-0 border border-line p-5 lg:order-none lg:col-start-2 lg:row-start-1 lg:sticky lg:top-24 lg:self-start">
          <h2 className="label text-paper-dim">Order</h2>
          <ul className="mt-5 space-y-4">
            {orderLines.map((line) => (
              <li
                key={`${line.productId}:${line.size}`}
                className="flex justify-between gap-4 text-sm"
              >
                <span className="min-w-0">
                  <span className="block text-paper">{line.name}</span>
                  <span className="label text-paper-dim">
                    {line.size} × {line.quantity}
                  </span>
                </span>
                <span className="label shrink-0 text-paper">
                  {formatZar(line.unitPrice * line.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-baseline justify-between border-t border-line pt-5">
            <span className="label text-paper-dim">Total</span>
            <span className="display text-3xl">{formatZar(subtotal)}</span>
          </div>
          <Link
            href="/cart"
            className="label mt-6 inline-block text-paper-dim underline underline-offset-4 transition-colors hover:text-gold"
          >
            Edit cart
          </Link>
        </aside>
      </div>
    </div>
  );
}
