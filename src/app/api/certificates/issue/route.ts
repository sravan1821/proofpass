import { NextResponse } from "next/server";

import {
  buildVerificationUrl,
  generatePublicToken,
  generateSerialNumber,
  hashCertificateToken,
} from "@/lib/certificates/service";
import { certificateIssueSchema } from "@/lib/validations/recruiter";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = certificateIssueSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const token = generatePublicToken();

  return NextResponse.json({
    ok: true,
    serialNumber: generateSerialNumber(),
    publicToken: token,
    tokenHash: hashCertificateToken(token),
    verifyUrl: buildVerificationUrl(token),
    payload: parsed.data,
  });
}
