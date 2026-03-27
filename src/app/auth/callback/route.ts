import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL("/sign-in", request.url);
  url.searchParams.set("error", "oauth_unavailable");
  return NextResponse.redirect(url);
}
