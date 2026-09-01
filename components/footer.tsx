// components/footer.tsx — brand sign-off.

import { Wordmark } from "./wordmark";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Wordmark className="text-4xl sm:text-6xl" />
        <p className="mt-4 max-w-sm text-sm text-paper-dim">
          South African moments. Made wearable.
        </p>
        <p className="label mt-10 text-gold">justrsa.co.za</p>
      </div>
    </footer>
  );
}
