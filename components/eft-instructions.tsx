// components/eft-instructions.tsx
// Bank transfer details shown after checkout. Reference must match the EFT payment.

import { ProofUpload } from "@/components/proof-upload";
import { formatZar } from "@/lib/products";
import type { EftDetails } from "@/lib/payment/eft";

type EftInstructionsProps =
  | {
      reference: string;
      total: number;
      eft: EftDetails;
      paid?: false;
      hasProof?: boolean;
      proofUploadedAt?: string | null;
    }
  | {
      reference: string;
      total?: number;
      eft?: EftDetails;
      paid: true;
      hasProof?: boolean;
      proofUploadedAt?: string | null;
    };

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <span className="label shrink-0 text-paper-dim">{label}</span>
      <span className="font-mono text-sm text-paper sm:text-right">{value}</span>
    </div>
  );
}

export function EftInstructions(props: EftInstructionsProps) {
  if (props.paid) {
    return (
      <div className="border border-gold p-5 sm:p-6">
        <p className="label text-gold">Payment received</p>
        <p className="mt-3 text-sm text-paper-dim">
          Reference <span className="font-mono text-paper">{props.reference}</span> is marked paid.
          We will confirm production timing soon.
        </p>
      </div>
    );
  }

  const { reference, total, eft, hasProof = false, proofUploadedAt = null } = props;

  return (
    <div className="border border-line">
      <div className="border-b border-line p-5 sm:p-6">
        <p className="label text-gold">Pay by EFT</p>
        <p className="mt-3 text-sm leading-relaxed text-paper-dim">
          Transfer the exact amount below and use your order reference as the payment reference.
          Then upload proof of payment below so we can match it quickly.
        </p>
      </div>

      <div className="p-5 sm:p-6">
        <CopyRow label="Amount" value={formatZar(total)} />
        <CopyRow label="Reference" value={reference} />
        <CopyRow label="Bank" value={eft.bankName} />
        <CopyRow label="Account name" value={eft.accountName} />
        <CopyRow label="Account number" value={eft.accountNumber} />
        <CopyRow label="Branch code" value={eft.branchCode} />
        <CopyRow label="Account type" value={eft.accountType} />
      </div>

      <ProofUpload reference={reference} hasProof={hasProof} uploadedAt={proofUploadedAt} />
    </div>
  );
}
