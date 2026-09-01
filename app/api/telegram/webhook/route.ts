// app/api/telegram/webhook/route.ts
// Receives Telegram bot updates so admins can mark EFT orders paid from chat.

import { NextResponse } from "next/server";
import { handleTelegramUpdate, verifyTelegramWebhookSecret } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (!verifyTelegramWebhookSecret(secret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let update: unknown;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  try {
    await handleTelegramUpdate(update as Parameters<typeof handleTelegramUpdate>[0]);
  } catch (error) {
    console.error("[telegram webhook]", error instanceof Error ? error.message : error);
  }

  return NextResponse.json({ ok: true });
}
