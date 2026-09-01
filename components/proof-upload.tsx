// components/proof-upload.tsx
// Lets the customer upload a bank POP against their order reference.

"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

type ProofUploadProps = {
  reference: string;
  hasProof: boolean;
  uploadedAt?: string | null;
};

export function ProofUpload({ reference, hasProof, uploadedAt }: ProofUploadProps) {
  const router = useRouter();
  const inputId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Choose a file first.");
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);

    const body = new FormData();
    body.append("proof", file);

    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(reference)}/proof`, {
        method: "POST",
        body,
      });
      const data: unknown = await response.json();
      const text =
        typeof data === "object" && data !== null && "message" in data
          ? String((data as { message: string }).message)
          : typeof data === "object" && data !== null && "error" in data
            ? String((data as { error: string }).error)
            : "Upload failed.";

      if (!response.ok) {
        setError(text);
        setBusy(false);
        return;
      }

      setMessage(text);
      setFile(null);
      setBusy(false);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="border-t border-line p-5 sm:p-6">
      <h3 className="label text-gold">Proof of payment</h3>

      {hasProof ? (
        <p className="mt-3 text-sm text-paper-dim">
          Proof received
          {uploadedAt ? (
            <>
              {" "}
              on{" "}
              <span className="text-paper">
                {new Date(uploadedAt).toLocaleString("en-ZA", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </>
          ) : null}
          . You can replace it with a clearer screenshot or PDF if needed.
        </p>
      ) : (
        <p className="mt-3 text-sm text-paper-dim">
          After you transfer, upload a screenshot or PDF of the payment confirmation here. We match
          it to reference <span className="font-mono text-paper">{reference}</span>.
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center"
      >
        <label htmlFor={inputId} className="sr-only">
          Proof of payment file
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setError(null);
          }}
          className="block w-full text-sm text-paper-dim file:mr-4 file:border file:border-line file:bg-ink file:px-3 file:py-2 file:text-paper"
        />
        <button
          type="submit"
          disabled={busy || !file}
          className="label shrink-0 border border-paper bg-paper px-5 py-3 text-ink transition-colors hover:border-gold hover:bg-gold disabled:opacity-40"
        >
          {busy ? "Uploading…" : hasProof ? "[ Replace proof ]" : "[ Upload proof ]"}
        </button>
      </form>

      <p className="mt-3 text-xs text-paper-dim">JPG, PNG, WebP or PDF · max 8 MB</p>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-gold">
        {error ?? message}
      </p>
    </div>
  );
}
