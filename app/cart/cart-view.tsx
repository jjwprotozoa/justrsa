// app/cart/cart-view.tsx — line items, quantities, total, link to checkout.

"use client";

import Image from "next/image";
import Link from "next/link";
import { MAX_QUANTITY, useCart } from "@/lib/cart";
import { formatZar, getProduct } from "@/lib/products";

export function CartView() {
  const { lines, subtotal, itemCount, ready, setQuantity, remove } = useCart();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
      <h1 className="display text-4xl sm:text-6xl">Cart</h1>
      <p className="label mt-3 text-paper-dim">Drop 001 · Pre-order</p>

      {!ready ? (
        <p className="mt-12 text-sm text-paper-dim">Loading your cart…</p>
      ) : lines.length === 0 ? (
        <div className="mt-12 border border-line p-6 sm:p-10">
          <p className="text-paper-dim">Your cart is empty.</p>
          <Link
            href="/#drop-001"
            className="label mt-6 inline-flex border border-paper px-6 py-4 transition-colors hover:bg-paper hover:text-ink"
          >
            [ Shop Drop 001 ]
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-10 border-t border-line">
            {lines.map((line) => {
              const product = getProduct(line.productId);
              if (!product) return null;
              return (
                <li
                  key={line.key}
                  className="flex gap-4 border-b border-line py-5 sm:gap-6 sm:py-6"
                >
                  <div className="relative h-24 w-20 shrink-0 border border-line bg-ink sm:h-32 sm:w-28">
                    <Image
                      src={product.image}
                      alt={product.imageAlt}
                      fill
                      sizes="112px"
                      className="object-contain p-1"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="display text-lg sm:text-xl">{product.name}</h2>
                        <p className="label mt-1 text-paper-dim">
                          Size {line.size} · {formatZar(product.price)}
                        </p>
                      </div>
                      <p className="label shrink-0 text-gold">
                        {formatZar(product.price * line.quantity)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-4">
                      <div className="flex items-center border border-line">
                        <button
                          type="button"
                          onClick={() => setQuantity(line.key, line.quantity - 1)}
                          aria-label={`Decrease quantity of ${product.name}, size ${line.size}`}
                          className="px-3 py-2 leading-none text-paper-dim transition-colors hover:text-paper"
                        >
                          &minus;
                        </button>
                        <span className="label w-8 text-center">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(line.key, line.quantity + 1)}
                          disabled={line.quantity >= MAX_QUANTITY}
                          aria-label={`Increase quantity of ${product.name}, size ${line.size}`}
                          className="px-3 py-2 leading-none text-paper-dim transition-colors hover:text-paper disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(line.key)}
                        className="label text-paper-dim underline underline-offset-4 transition-colors hover:text-gold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex items-baseline justify-between">
            <span className="label text-paper-dim">
              Total · {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
            <span className="display text-3xl sm:text-4xl">{formatZar(subtotal)}</span>
          </div>

          <p className="mt-3 text-xs text-paper-dim">
            Pre-order. Shipping within South Africa is calculated before checkout goes live.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/checkout"
              className="label flex-1 border border-paper bg-paper px-6 py-4 text-center text-ink transition-colors hover:border-gold hover:bg-gold"
            >
              [ Checkout ]
            </Link>
            <Link
              href="/#drop-001"
              className="label border border-line px-6 py-4 text-center text-paper-dim transition-colors hover:border-paper hover:text-paper"
            >
              Keep shopping
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
