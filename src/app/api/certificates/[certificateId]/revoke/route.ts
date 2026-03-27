import { NextResponse } from "next/server";

import { revokeCertificateSchema } from "@/lib/validations/recruiter";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ certificateId: string }> },
) {
  const json = await request.json();
  const routeParams = await params;
  const parsed = revokeCertificateSchema.safeParse({
    certificateId: routeParams.certificateId,
    reason: json.reason,
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "Revoke route validated. Persist status, revoke metadata, and audit logs through Supabase next.",
    data: parsed.data,
  });
}
