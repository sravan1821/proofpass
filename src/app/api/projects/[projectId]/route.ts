import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const projectId = (await params).projectId;
  const payload = await request.json();

  return NextResponse.json({
    ok: true,
    message: "Project update route scaffolded per blueprint.",
    projectId,
    payload,
  });
}
