// components/product-card.tsx
// One Drop 001 product: image, title, price, size, quantity, pre-order button.

"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { useCart, MAX_QUANTITY } from "@/lib/cart";
import { formatZar, SIZES, type Product, type Size } from "@/lib/products";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const { add } = useCart();
  const [size, setSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headingId = useId();
  const sizeErrorId = useId();

  // Side effect: mutates cart state and briefly flips the button label.
  function handlePreorder() {
    if (!size) {
      setError(true);
      return;
    }
    setError(false);
    add(product.id, size, quantity);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2000);
  }

  return (
    <article aria-labelledby={headingId} className="group flex w-full flex-col border border-line">
      <div className="relative aspect-[4/5] w-full overflow-hidden border-b border-line bg-ink">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={`object-contain transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03] ${product.imageClass ?? "p-3 sm:p-4"}`}
        />
      </div>

      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="label text-paper-dim">{product.number}</p>
            <h3 id={headingId} className="display mt-2 text-2xl sm:text-3xl">
              {product.title.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h3>
          </div>
          <p className="display shrink-0 text-xl text-gold sm:text-2xl">
            {formatZar(product.price)}
          </p>
        </div>

        <fieldset>
          <legend className="label text-paper-dim">Size</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {SIZES.map((option) => {
              const selected = size === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setSize(option);
                    setError(false);
                  }}
                  className={`label min-w-12 border px-3 py-2 transition-colors ${
                    selected
                      ? "border-paper bg-paper text-ink"
                      : "border-line text-paper-dim hover:border-paper hover:text-paper"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {error ? (
            <p id={sizeErrorId} role="alert" className="label mt-3 text-gold">
              Choose a size
            </p>
          ) : null}
        </fieldset>

        <div className="flex items-center justify-between gap-4">
          <span className="label text-paper-dim">Quantity</span>
          <div className="flex items-center border border-line">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              disabled={quantity <= 1}
              aria-label={`Decrease quantity of ${product.name}`}
              className="px-4 py-2 text-lg leading-none text-paper-dim transition-colors hover:text-paper disabled:opacity-30"
            >
              &minus;
            </button>
            <span aria-live="polite" className="label w-8 text-center text-paper">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.min(MAX_QUANTITY, value + 1))}
              disabled={quantity >= MAX_QUANTITY}
              aria-label={`Increase quantity of ${product.name}`}
              className="px-4 py-2 text-lg leading-none text-paper-dim transition-colors hover:text-paper disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePreorder}
          aria-describedby={error ? sizeErrorId : undefined}
          className="label mt-auto w-full border border-paper bg-paper px-4 py-4 text-ink transition-colors hover:bg-gold hover:border-gold"
        >
          {added ? "Added to cart" : "Pre-order"}
        </button>
      </div>
    </article>
  );
}
