/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireApprovedOrganizer } from "@/lib/auth";
import { createMongoServerClient } from "@/lib/db/mongo/server";
import { CertificatesClient } from "./certificates-client";

export default async function CertificatesPage() {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();

  const { data: events } = (await supabase!
    .from("events")
    .select("id, name, status")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false })) as { data: any[] | null };

  const { data: certificates } = (await supabase!
    .from("certificates")
    .select("*, events(name)")
    .eq("organizer_id", user.id)
    .order("issued_at", { ascending: false })) as { data: any[] | null };

  const certs = (certificates || []).map((c: any) => ({
    ...c,
    event_name: (c.events as Record<string, string>)?.name || "—",
  }));

  return <CertificatesClient events={events || []} certificates={certs} />;
}
