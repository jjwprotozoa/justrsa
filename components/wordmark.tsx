// components/wordmark.tsx — the JUST RSA wordmark, used in the header and footer.

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`display tracking-tight ${className}`}>
      JUST<span className="text-gold">&nbsp;</span>RSA
    </span>
  );
}
