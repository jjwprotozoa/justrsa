// app/layout.tsx — root document, fonts, SEO metadata and cart provider.

import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://justrsa.co.za";
const TITLE = "JUST RSA — Drop 001";
const DESCRIPTION =
  "Two jets. One stadium. Drop 001 turns the Cape Town flyover of 29.08.26 into a limited pre-order run of tees, printed in South Africa.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — JUST RSA",
  },
  description: DESCRIPTION,
  applicationName: "JUST RSA",
  keywords: [
    "JUST RSA",
    "Drop 001",
    "South African streetwear",
    "Cape Town flyover",
    "limited drop tees",
    "pre-order",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "JUST RSA",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_ZA",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" className={`${oswald.variable} ${inter.variable}`}>
      <body className="grain min-h-dvh">
        <CartProvider>
          <a
            href="#main"
            className="label sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
          >
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
