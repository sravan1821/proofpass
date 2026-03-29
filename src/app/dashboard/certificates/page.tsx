/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  dedupeCertificateTemplates,
  getVisibleCertificateTemplates,
  mapCustomCertificateTemplate,
} from "@/lib/certificates/templates";
import { requireApprovedOrganizer } from "@/lib/auth";
import { createMongoServerClient } from "@/lib/db/mongo/server";
import { CertificatesClient } from "./certificates-client";

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export default async function CertificatesPage() {
  const user = await requireApprovedOrganizer();
  const supabase = await createMongoServerClient();

  const { data: events } = (await supabase!
    .from("events")
    .select("id, name, status, start_date, end_date, venue, event_code, org_name_display")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false })) as { data: any[] | null };

  const { data: certificates } = (await supabase!
    .from("certificates")
    .select("*, events(name)")
    .eq("organizer_id", user.id)
    .order("issued_at", { ascending: false })) as { data: any[] | null };

  const { data: customTemplates } = (await supabase!
    .from("certificate_templates")
    .select("*")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false })) as { data: any[] | null };

  const eventIds = (events || []).map((event: any) => event.id);
  let allRegistrations: any[] = [];
  if (eventIds.length > 0) {
    const { data: registrations } = (await supabase!
      .from("event_registrations")
      .select("*")
      .in("event_id", eventIds)
      .order("created_at", { ascending: false })) as { data: any[] | null };
    allRegistrations = registrations || [];
  }

  const mappedCertificates = (certificates || []).map((certificate: any) => ({
    ...certificate,
    event_name: (certificate.events as Record<string, string>)?.name || "—",
  }));

  const mappedCustomTemplates = (customTemplates || []).map((template: any) => mapCustomCertificateTemplate(template));
  const visibleTemplates = dedupeCertificateTemplates([
    ...getVisibleCertificateTemplates(),
    ...mappedCustomTemplates,
  ]);

  return (
    <CertificatesClient
      events={serialize(events || [])}
      certificates={serialize(mappedCertificates)}
      templates={serialize(visibleTemplates)}
      registrations={serialize(allRegistrations)}
      organizationName={user.orgName || "ProofPass"}
    />
  );
}
