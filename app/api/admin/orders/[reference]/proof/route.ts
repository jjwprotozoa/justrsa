// app/api/admin/orders/[reference]/proof/route.ts
// Streams a proof-of-payment file from Supabase Storage. Admin session required.

import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getProofFile } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ reference: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { reference } = await context.params;
  const proof = await getProofFile(reference);
  if (!proof) {
    return NextResponse.json({ error: "No proof on file." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(proof.bytes), {
    headers: {
      "Content-Type": proof.mime,
      "Content-Disposition": `inline; filename="${proof.filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
