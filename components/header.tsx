// components/header.tsx — sticky top bar: wordmark, drop link, cart count.

"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { DROP } from "@/lib/products";
import { Wordmark } from "./wordmark";

export function Header() {
  const { itemCount, ready } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <Link href="/" aria-label="JUST RSA home">
          <Wordmark className="text-xl sm:text-2xl" />
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-5 sm:gap-8">
          <Link
            href="/#drop-001"
            className="label text-paper-dim transition-colors hover:text-paper"
          >
            {DROP.code}
          </Link>
          <Link href="/cart" className="label text-paper transition-colors hover:text-gold">
            Cart
            <span aria-hidden="true"> ({ready ? itemCount : 0})</span>
            <span className="sr-only">, {ready ? itemCount : 0} items</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
