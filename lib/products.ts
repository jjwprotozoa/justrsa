// lib/products.ts
// Single source of truth for Drop 001 products, sizes and price formatting.
// Product art lives in /public/products. Swap a file in place (keep the filename)
// or point `image` at a new path.

export const SIZES = ["S", "M", "L", "XL", "2XL"] as const;
export type Size = (typeof SIZES)[number];

export type Product = {
  id: string;
  /** Two-digit drop index shown above the title. */
  number: string;
  /** Title lines, rendered as separate display lines. */
  title: string[];
  /** Flat, single-line title for alt text, cart lines and metadata. */
  name: string;
  /** Price in rand. */
  price: number;
  image: string;
  imageAlt: string;
  /** Extra classes on the product image (e.g. tighter padding for mockups). */
  imageClass?: string;
};

export const DROP = {
  code: "DROP 001",
  location: "CAPE TOWN",
  date: "29.08.26",
} as const;

export const PRODUCTS: Product[] = [
  {
    id: "not-ai-just-rsa",
    number: "01",
    title: ["NOT AI.", "JUST RSA."],
    name: "NOT AI. JUST RSA.",
    price: 329,
    image: "/products/drop-001-01-not-ai-just-rsa.jpg",
    imageAlt: "Drop 001 tee mockup: NOT AI. JUST RSA.",
    imageClass: "p-1 sm:p-2",
  },
  {
    id: "41-46-ft",
    number: "02",
    title: ["41–46 FT"],
    name: "41–46 FT",
    price: 329,
    image: "/products/drop-001-02-41-46-ft.jpg",
    imageAlt: "Drop 001 tee: 41 to 46 FT",
  },
  {
    id: "just-another-saturday",
    number: "03",
    title: ["JUST ANOTHER", "SATURDAY", "IN SOUTH AFRICA"],
    name: "JUST ANOTHER SATURDAY IN SOUTH AFRICA",
    price: 329,
    image: "/products/drop-001-03-just-another-saturday.jpg",
    imageAlt: "Drop 001 tee: JUST ANOTHER SATURDAY IN SOUTH AFRICA",
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

const zarFormatter = new Intl.NumberFormat("en-ZA", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Formats a rand amount as `R329`. */
export function formatZar(amount: number): string {
  return `R${zarFormatter.format(amount)}`;
}
