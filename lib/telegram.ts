// lib/telegram.ts
// Admin Telegram alerts and commands (mark orders paid from chat).

import { getOrderByReference, markOrderPaid, type StoredOrder } from "@/lib/orders";
import { formatZar } from "@/lib/products";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://justrsa.co.za";
const REFERENCE_PATTERN = /^JRS-[A-F0-9]{6}$/;

type InlineKeyboard = {
  inline_keyboard: { text: string; callback_data: string }[][];
};

type TelegramUpdate = {
  message?: {
    chat: { id: number };
    text?: string;
  };
  callback_query?: {
    id: string;
    from: { id: number };
    message?: { chat: { id: number }; message_id: number };
    data?: string;
  };
};

export function telegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim() && process.env.TELEGRAM_CHAT_ID?.trim());
}

function botToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || null;
}

function adminChatId(): string | null {
  return process.env.TELEGRAM_CHAT_ID?.trim() || null;
}

function isAuthorizedChat(chatId: number | string): boolean {
  const allowed = adminChatId();
  return allowed ? String(chatId) === allowed : false;
}

async function telegramApi<T>(method: string, body: Record<string, unknown>): Promise<T> {
  const token = botToken();
  if (!token) throw new Error("Telegram bot token missing.");

  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data: unknown = await response.json();
  if (!response.ok) {
    const detail =
      typeof data === "object" && data && "description" in data
        ? String((data as { description: string }).description)
        : response.statusText;
    throw new Error(`Telegram ${method}: ${detail}`);
  }
  return data as T;
}

async function sendTelegramMessage(
  text: string,
  replyMarkup?: InlineKeyboard,
): Promise<number | null> {
  const chatId = adminChatId();
  if (!chatId) return null;

  const result = await telegramApi<{ ok: boolean; result?: { message_id: number } }>(
    "sendMessage",
    {
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    },
  );
  return result.result?.message_id ?? null;
}

/** Fire-and-forget wrapper — never blocks or throws into request handlers. */
export function notifyTelegram(text: string, replyMarkup?: InlineKeyboard): void {
  if (!telegramConfigured()) return;
  void sendTelegramMessage(text, replyMarkup).catch((error) => {
    console.error("[telegram]", error instanceof Error ? error.message : error);
  });
}

function paidKeyboard(reference: string): InlineKeyboard {
  return {
    inline_keyboard: [[{ text: "✅ Mark paid", callback_data: `paid:${reference}` }]],
  };
}

function formatLines(order: StoredOrder): string {
  return order.lines
    .map((line) => `• ${line.product_name} · ${line.size} × ${line.quantity}`)
    .join("\n");
}

export function notifyNewOrder(order: StoredOrder): void {
  const { order: row } = order;
  notifyTelegram(
    [
      "🛒 New pre-order",
      "",
      `Ref: ${row.reference}`,
      `Total: ${formatZar(row.total)}`,
      "",
      formatLines(order),
      "",
      `${row.customer_name}`,
      row.customer_email,
      row.customer_phone,
      `${row.address_line1}, ${row.city}, ${row.province} ${row.postal_code}`,
      "",
      `Mark paid: /paid ${row.reference}`,
      `${SITE_URL}/admin`,
    ].join("\n"),
    paidKeyboard(row.reference),
  );
}

export function notifyProofUploaded(order: StoredOrder): void {
  const { order: row } = order;
  notifyTelegram(
    [
      "📎 Proof uploaded",
      "",
      `Ref: ${row.reference}`,
      `Total: ${formatZar(row.total)}`,
      `${row.customer_name} · ${row.customer_email}`,
      "",
      `Mark paid: /paid ${row.reference}`,
      `${SITE_URL}/admin`,
    ].join("\n"),
    paidKeyboard(row.reference),
  );
}

function parseReference(text: string): string | null {
  const match = text.match(/JRS-[A-F0-9]{6}/i);
  if (!match) return null;
  const reference = match[0].toUpperCase();
  return REFERENCE_PATTERN.test(reference) ? reference : null;
}

async function reply(chatId: number, text: string): Promise<void> {
  await telegramApi("sendMessage", {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
  });
}

async function confirmPaid(chatId: number, reference: string, source: string): Promise<string> {
  const stored = await getOrderByReference(reference);
  if (!stored) return `Order ${reference} not found.`;

  if (stored.order.status === "paid") {
    return `${reference} is already marked paid.`;
  }

  const ok = await markOrderPaid(reference, `Marked paid via Telegram (${source})`);
  if (!ok) {
    return `Could not mark ${reference} paid. Check status in /admin.`;
  }

  return `✅ ${reference} marked paid · ${formatZar(stored.order.total)} · ${stored.order.customer_name}`;
}

async function handleCommand(message: NonNullable<TelegramUpdate["message"]>): Promise<void> {
  if (!isAuthorizedChat(message.chat.id)) return;

  const text = message.text?.trim() ?? "";
  if (!text.startsWith("/")) return;

  const [command, ...args] = text.split(/\s+/);
  const lower = command.toLowerCase();

  if (lower === "/start" || lower === "/help") {
    await reply(
      message.chat.id,
      [
        "JUST RSA admin bot",
        "",
        "/paid JRS-XXXXXX — mark an EFT order as paid",
        "/order JRS-XXXXXX — show order status",
        "",
        "You can also tap ✅ Mark paid on alert messages.",
      ].join("\n"),
    );
    return;
  }

  if (lower === "/paid") {
    const reference = parseReference(args.join(" "));
    if (!reference) {
      await reply(message.chat.id, "Usage: /paid JRS-XXXXXX");
      return;
    }
    const result = await confirmPaid(message.chat.id, reference, "command");
    await reply(message.chat.id, result);
    return;
  }

  if (lower === "/order") {
    const reference = parseReference(args.join(" "));
    if (!reference) {
      await reply(message.chat.id, "Usage: /order JRS-XXXXXX");
      return;
    }
    const stored = await getOrderByReference(reference);
    if (!stored) {
      await reply(message.chat.id, `Order ${reference} not found.`);
      return;
    }
    const { order: row, payment } = stored;
    await reply(
      message.chat.id,
      [
        `Ref: ${row.reference}`,
        `Status: ${row.status}`,
        `Payment: ${payment.status}`,
        `Total: ${formatZar(row.total)}`,
        `${row.customer_name} · ${row.customer_email}`,
        payment.proof_uploaded_at ? `Proof: uploaded` : "Proof: none",
      ].join("\n"),
    );
  }
}

async function handleCallback(
  query: NonNullable<TelegramUpdate["callback_query"]>,
): Promise<void> {
  const chatId = query.message?.chat.id;
  if (!chatId || !isAuthorizedChat(chatId)) return;

  const data = query.data ?? "";
  if (!data.startsWith("paid:")) return;

  const reference = parseReference(data.slice("paid:".length));
  let result = "Invalid order reference.";
  if (reference) {
    result = await confirmPaid(chatId, reference, "button");
  }

  await telegramApi("answerCallbackQuery", {
    callback_query_id: query.id,
    text: result.slice(0, 200),
    show_alert: result.startsWith("✅"),
  });

  if (query.message?.message_id) {
    await telegramApi("sendMessage", {
      chat_id: chatId,
      text: result,
      disable_web_page_preview: true,
    }).catch(() => {});
  }
}

export async function handleTelegramUpdate(update: TelegramUpdate): Promise<void> {
  if (update.callback_query) {
    await handleCallback(update.callback_query);
    return;
  }
  if (update.message) {
    await handleCommand(update.message);
  }
}

export function verifyTelegramWebhookSecret(secret: string | null): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (!expected) return true;
  return secret === expected;
}
