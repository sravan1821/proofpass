import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ contributionId: string }> },
) {
  const contributionId = (await params).contributionId;
  const payload = await request.json().catch(() => ({}));

  return NextResponse.json({
    ok: true,
    message: "Contribution approval route scaffolded per blueprint.",
    contributionId,
    payload,
  });
}
