// app/checkout/field.tsx — bordered text input used across the checkout form.

"use client";

import { useId } from "react";

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  required?: boolean;
  className?: string;
};

export function Field({
  label,
  name,
  type = "text",
  autoComplete,
  inputMode,
  required = true,
  className = "",
}: FieldProps) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="label block text-paper-dim">
        {label}
        {required ? null : <span className="ml-2 normal-case tracking-normal">(optional)</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        required={required}
        className="mt-2 w-full border border-line bg-ink-soft px-4 py-3 text-base text-paper placeholder:text-paper-dim/50 focus:border-paper"
      />
    </div>
  );
}
