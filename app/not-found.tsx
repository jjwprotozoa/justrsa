// app/not-found.tsx — 404.

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6 sm:py-32">
      <p className="label text-gold">404</p>
      <h1 className="display mt-4 text-4xl sm:text-6xl">Nothing here.</h1>
      <Link
        href="/"
        className="label mt-10 inline-flex border border-paper px-6 py-4 transition-colors hover:bg-paper hover:text-ink"
      >
        [ Back to Drop 001 ]
      </Link>
    </div>
  );
}
