// app/checkout/page.tsx — checkout route metadata wrapper.

import type { Metadata } from "next";
import { CheckoutView } from "./checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your JUST RSA Drop 001 pre-order.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
