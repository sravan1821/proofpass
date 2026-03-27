import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll() {},
    },
  });

  const body = await request.json();
  const data = body.data;

  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "Invalid submission data" }, { status: 400 });
  }

  // Get form
  const { data: form } = await supabase
    .from("forms")
    .select("*")
    .eq("share_id", shareId)
    .single();

  if (!form) {
    return NextResponse.json({ error: "Form not found." }, { status: 404 });
  }

  if (form.status !== "published") {
    return NextResponse.json({ error: "This form is no longer accepting responses." }, { status: 403 });
  }

  const settings = (form.settings_json || {}) as Record<string, unknown>;

  // Response limit check
  if (settings.responseLimit && form.response_count >= (settings.responseLimit as number)) {
    return NextResponse.json({ error: "This form has reached its response limit." }, { status: 403 });
  }

  // Insert response
  const { error: insertError } = await supabase.from("form_responses").insert({
    form_id: form.id,
    data_json: data,
    ip_address: request.headers.get("x-forwarded-for") || "unknown",
    source: "direct",
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Increment count
  await supabase
    .from("forms")
    .update({ response_count: form.response_count + 1 })
    .eq("id", form.id);

  return NextResponse.json({
    success: true,
    confirmationMessage: (settings.confirmationMessage as string) || "Thank you for your response!",
  });
}
