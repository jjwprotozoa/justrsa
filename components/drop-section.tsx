// components/drop-section.tsx — the three Drop 001 products.

import { DROP, PRODUCTS } from "@/lib/products";
import { ProductCard } from "./product-card";

export function DropSection() {
  return (
    <section id="drop-001" className="scroll-mt-16 border-b border-line">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="reveal flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-line pb-5">
          <h2 className="display text-3xl sm:text-5xl">{DROP.code}</h2>
          <p className="label w-full text-paper-dim sm:w-auto">Pre-order · Three styles</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((product, index) => (
            <div key={product.id} className="reveal flex">
              <ProductCard product={product} priority={index === 0} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
