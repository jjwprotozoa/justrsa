// app/api/admin/orders/[reference]/paid/route.ts — mark an EFT order as paid.

import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { markOrderPaid } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ reference: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { reference } = await context.params;
  let notes = "";
  try {
    const body = (await request.json()) as { notes?: string };
    notes = String(body.notes ?? "").trim();
  } catch {
    notes = "";
  }

  const ok = await markOrderPaid(reference, notes || "Marked paid in admin");
  if (!ok) {
    return NextResponse.json(
      { error: "Could not mark paid (missing or already paid)." },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true });
}
