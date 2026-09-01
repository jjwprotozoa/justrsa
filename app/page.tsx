// app/page.tsx — JUST RSA home: hero, Drop 001, the moment, pre-order terms.

import { DropSection } from "@/components/drop-section";
import { Hero } from "@/components/hero";
import { PreorderInfo } from "@/components/preorder-info";
import { Story } from "@/components/story";
import { DROP, PRODUCTS } from "@/lib/products";

/** Product structured data so social and search surfaces render the drop correctly. */
function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `JUST RSA — ${DROP.code}`,
    itemListElement: PRODUCTS.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        image: `https://justrsa.co.za${product.image}`,
        brand: { "@type": "Brand", name: "JUST RSA" },
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "ZAR",
          availability: "https://schema.org/PreOrder",
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // Static, locally built JSON with `<` escaped: the standard Next.js way to
      // emit JSON-LD. No user input reaches this string.
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD has no other output path
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <DropSection />
      <Story />
      <PreorderInfo />
      <StructuredData />
    </>
  );
}
