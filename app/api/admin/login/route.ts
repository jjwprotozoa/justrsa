// app/api/admin/login/route.ts — sets the admin session cookie.

import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminConfigured,
  adminCookieOptions,
  createAdminSessionToken,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: "Set ADMIN_PASSWORD in the environment to enable admin." },
      { status: 503 },
    );
  }

  let password = "";
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { password?: string };
    password = String(body.password ?? "");
  } else {
    const form = await request.formData();
    password = String(form.get("password") ?? "");
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    ADMIN_COOKIE,
    createAdminSessionToken(),
    adminCookieOptions(60 * 60 * 24 * 7),
  );
  return response;
}
