import { NextResponse } from "next/server";

import { recruiterLeadSchema } from "@/lib/validations/recruiter";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = recruiterLeadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "Recruiter lead accepted. Persist this via Supabase in the next implementation step.",
    data: parsed.data,
  });
}
