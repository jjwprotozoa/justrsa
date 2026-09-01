// app/cart/page.tsx — cart route metadata wrapper.

import type { Metadata } from "next";
import { CartView } from "./cart-view";

export const metadata: Metadata = {
  title: "Cart",
  description: "Your JUST RSA Drop 001 pre-order.",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return <CartView />;
}
