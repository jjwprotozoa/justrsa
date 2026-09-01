// components/order-status.tsx
// Visual order progress: placed → payment → confirmed.

type OrderStatusProps = {
  paid: boolean;
  hasProof: boolean;
};

const STEPS = [
  { key: "placed", label: "Order placed" },
  { key: "payment", label: "Payment" },
  { key: "confirmed", label: "Confirmed" },
] as const;

function stepState(key: (typeof STEPS)[number]["key"], paid: boolean, hasProof: boolean) {
  if (key === "placed") return "done";
  if (key === "payment") {
    if (paid) return "done";
    if (hasProof) return "done";
    return "current";
  }
  if (paid) return "done";
  if (hasProof) return "current";
  return "upcoming";
}

function paymentDetail(paid: boolean, hasProof: boolean): string {
  if (paid) return "Payment received";
  if (hasProof) return "Proof received — awaiting confirmation";
  return "EFT + upload proof below";
}

export function OrderStatus({ paid, hasProof }: OrderStatusProps) {
  return (
    <div className="border border-line p-5 sm:p-6">
      <h2 className="label text-paper-dim">Status</h2>
      <ol className="mt-5 space-y-4">
        {STEPS.map((step, index) => {
          const state = stepState(step.key, paid, hasProof);
          return (
            <li key={step.key} className="flex gap-4">
              <span
                className={`label flex h-8 w-8 shrink-0 items-center justify-center border ${
                  state === "done"
                    ? "border-gold bg-gold text-ink"
                    : state === "current"
                      ? "border-paper text-paper"
                      : "border-line text-paper-dim"
                }`}
                aria-hidden
              >
                {index + 1}
              </span>
              <div className="min-w-0 pt-1">
                <p
                  className={`label ${state === "upcoming" ? "text-paper-dim" : state === "current" ? "text-paper" : "text-gold"}`}
                >
                  {step.label}
                </p>
                {step.key === "payment" ? (
                  <p className="mt-1 text-sm text-paper-dim">{paymentDetail(paid, hasProof)}</p>
                ) : null}
                {step.key === "confirmed" && paid ? (
                  <p className="mt-1 text-sm text-paper-dim">Pre-order locked in for Drop 001</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
