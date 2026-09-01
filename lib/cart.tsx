// lib/cart.tsx
// Client-side cart: React context over localStorage. No server state, no accounts.
// Lines are keyed by product id + size so the same shirt in two sizes stays separate.

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getProduct, type Size } from "./products";

const STORAGE_KEY = "justrsa.cart.v1";
const MAX_QUANTITY = 10;

export type CartLine = {
  /** `${productId}:${size}` */
  key: string;
  productId: string;
  size: Size;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  /** True once localStorage has been read, so the UI can avoid hydration flicker. */
  ready: boolean;
  add: (productId: string, size: Size, quantity: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function lineKey(productId: string, size: Size) {
  return `${productId}:${size}`;
}

/** Reads persisted lines, discarding anything that no longer matches the catalogue. */
function readStoredLines(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry) => {
      if (typeof entry !== "object" || entry === null) return [];
      const { productId, size, quantity } = entry as Partial<CartLine>;
      if (typeof productId !== "string" || typeof size !== "string") return [];
      if (!getProduct(productId)) return [];
      const safeQuantity = Math.min(MAX_QUANTITY, Math.max(1, Math.floor(Number(quantity) || 1)));
      return [
        {
          key: lineKey(productId, size as Size),
          productId,
          size: size as Size,
          quantity: safeQuantity,
        },
      ];
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(readStoredLines());
    setReady(true);
  }, []);

  // Side effect: mirrors cart state into localStorage on every change.
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage full or blocked (private mode): the cart simply stays in memory.
    }
  }, [lines, ready]);

  const add = useCallback((productId: string, size: Size, quantity: number) => {
    setLines((current) => {
      const key = lineKey(productId, size);
      const existing = current.find((line) => line.key === key);
      if (!existing) {
        return [...current, { key, productId, size, quantity: Math.min(MAX_QUANTITY, quantity) }];
      }
      return current.map((line) =>
        line.key === key
          ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + quantity) }
          : line,
      );
    });
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((current) =>
      quantity < 1
        ? current.filter((line) => line.key !== key)
        : current.map((line) =>
            line.key === key ? { ...line, quantity: Math.min(MAX_QUANTITY, quantity) } : line,
          ),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setLines((current) => current.filter((line) => line.key !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = lines.reduce((total, line) => total + line.quantity, 0);
    const subtotal = lines.reduce((total, line) => {
      const product = getProduct(line.productId);
      return product ? total + product.price * line.quantity : total;
    }, 0);
    return { lines, itemCount, subtotal, ready, add, setQuantity, remove, clear };
  }, [lines, ready, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}

export { MAX_QUANTITY };
