#!/usr/bin/env node
// scripts/orders.mjs — list orders and mark EFT payments as paid (Supabase).
// Usage:
//   npm run orders:list
//   npm run orders -- paid JRS-ABC123
//   npm run orders -- paid JRS-ABC123 "PoP checked"

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });
const [cmd, reference, ...noteParts] = process.argv.slice(2);
const notes = noteParts.join(" ").trim();

if (cmd === "list") {
  const { data: orders, error } = await db
    .from("orders")
    .select(
      "reference, status, customer_name, customer_email, total, created_at, payments(status, proof_filename)",
    )
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  if (!orders?.length) {
    console.log("No orders yet.");
  } else {
    for (const row of orders) {
      const payment = Array.isArray(row.payments) ? row.payments[0] : row.payments;
      const proof = payment?.proof_filename ? "proof:yes" : "proof:no";
      console.log(
        `${row.reference}  ${row.status.padEnd(14)}  ${(payment?.status || "-").padEnd(14)}  ${proof.padEnd(9)}  R${row.total}  ${row.customer_name}  <${row.customer_email}>`,
      );
    }
  }
} else if (cmd === "paid" && reference) {
  const now = new Date().toISOString();
  const ref = reference.toUpperCase();
  const { data: updated, error } = await db
    .from("orders")
    .update({ status: "paid", paid_at: now })
    .eq("reference", ref)
    .eq("status", "awaiting_eft")
    .select("id")
    .maybeSingle();
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  if (!updated) {
    console.error(`Could not mark ${ref} paid (missing or already paid).`);
    process.exit(1);
  }
  await db
    .from("payments")
    .update({ status: "confirmed", confirmed_at: now, notes: notes || "Marked paid via CLI" })
    .eq("reference", ref)
    .in("status", ["pending", "proof_uploaded"]);
  console.log(`Marked ${ref} as paid.`);
} else {
  console.log(`Usage:
  npm run orders:list
  npm run orders -- paid JRS-XXXXXX [notes]`);
  process.exit(1);
}
