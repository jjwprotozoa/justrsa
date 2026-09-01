// components/admin-login.tsx — password form for /admin.

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (!response.ok) {
      const data: unknown = await response.json().catch(() => null);
      setError(
        typeof data === "object" && data && "error" in data
          ? String((data as { error: string }).error)
          : "Login failed.",
      );
      return;
    }
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-24 sm:px-6">
      <h1 className="display text-4xl">Admin</h1>
      <p className="label mt-3 text-paper-dim">JUST RSA · Orders</p>
      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div>
          <label htmlFor="admin-password" className="label block text-paper-dim">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-2 w-full border border-line bg-ink-soft px-4 py-3 text-paper"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="label w-full border border-paper bg-paper px-4 py-4 text-ink hover:bg-gold hover:border-gold disabled:opacity-50"
        >
          {busy ? "Signing in…" : "[ Sign in ]"}
        </button>
        <p aria-live="polite" className="min-h-5 text-sm text-gold">
          {error}
        </p>
      </form>
    </div>
  );
}
