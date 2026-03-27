import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const eventId = (await params).eventId;
  const payload = await request.json();

  return NextResponse.json({
    ok: true,
    message: "Event update route scaffolded per blueprint.",
    eventId,
    payload,
  });
}
