// components/preorder-info.tsx — how the pre-order works. No stock claims.

const POINTS = [
  "Printed in South Africa after orders close.",
  "Shipping within South Africa.",
  "Final production timing will be confirmed before checkout goes live.",
];

export function PreorderInfo() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="reveal display text-2xl sm:text-4xl">Limited first drop</h2>
        <ul className="reveal mt-6 max-w-xl space-y-3 text-sm text-paper-dim sm:text-base">
          {POINTS.map((point) => (
            <li key={point} className="border-l border-gold pl-4">
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
