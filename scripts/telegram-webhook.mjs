#!/usr/bin/env node
// scripts/telegram-webhook.mjs — register the Telegram webhook for admin commands.
// Usage:
//   npm run telegram:webhook
//   npm run telegram:webhook -- https://justrsa.co.za

import { readFileSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
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

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const siteUrl = (process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL || "https://justrsa.co.za").replace(
  /\/$/,
  "",
);
let secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

if (!token) {
  console.error("Set TELEGRAM_BOT_TOKEN in .env.local");
  process.exit(1);
}

if (!secret) {
  secret = randomBytes(16).toString("hex");
  console.log("Generated TELEGRAM_WEBHOOK_SECRET (add to .env.local and Vercel):");
  console.log(secret);
}

const webhookUrl = `${siteUrl}/api/telegram/webhook?secret=${encodeURIComponent(secret)}`;
const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: webhookUrl, allowed_updates: ["message", "callback_query"] }),
});

const data = await response.json();
if (!data.ok) {
  console.error("setWebhook failed:", data.description ?? data);
  process.exit(1);
}

console.log("Webhook registered:");
console.log(webhookUrl);
