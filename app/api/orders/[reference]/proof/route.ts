// app/api/orders/[reference]/proof/route.ts
// Accepts a proof-of-payment upload (image or PDF) for an awaiting EFT order.

import { NextResponse } from "next/server";
import { attachProofOfPayment, MAX_PROOF_BYTES } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ reference: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { reference } = await context.params;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form upload." }, { status: 400 });
  }

  const file = form.get("proof");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a proof file to upload." }, { status: 400 });
  }

  if (file.size > MAX_PROOF_BYTES) {
    return NextResponse.json({ error: "File must be under 8 MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await attachProofOfPayment(reference, {
    buffer,
    mime: file.type || "application/octet-stream",
    originalName: file.name || "proof",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    filename: result.filename,
    message: "Proof of payment received. We will confirm once it clears.",
  });
}
