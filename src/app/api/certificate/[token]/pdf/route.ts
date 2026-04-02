import { NextResponse } from "next/server";

import { generateCertificatePdf } from "@/lib/certificates/pdf";
import { createMongoServerClient } from "@/lib/db/mongo/server";

type EventRow = {
  name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  venue?: string | null;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const supabase = await createMongoServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  let certificate: Record<string, unknown> | null = null;
  let event: EventRow | null = null;

  const { data } = await supabase
    .from("certificates")
    .select("*, events(name, start_date, end_date, venue)")
    .eq("certificate_id_display", decodeURIComponent(token))
    .single();

  if (data) {
    certificate = data as Record<string, unknown>;
    event = (data as { events?: EventRow | null }).events ?? null;
  } else {
    const { data: byHash } = await supabase
      .from("certificates")
      .select("*, events(name, start_date, end_date, venue)")
      .eq("token_hash", token)
      .single();

    if (byHash) {
      certificate = byHash as Record<string, unknown>;
      event = (byHash as { events?: EventRow | null }).events ?? null;
    }
  }

  if (!certificate) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }

  const { buffer, filename } = await generateCertificatePdf({
    certificate: certificate as never,
    event: (event as Record<string, unknown> | null) ?? null,
    organizationName: String(certificate.organization_name || "ProofPass"),
  });

  const url = new URL(request.url);
  const download = url.searchParams.get("download") === "1";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
