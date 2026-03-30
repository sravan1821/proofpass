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
    .select("id, name, status, start_date, end_date, venue, venue_details, event_code, org_name_display, category, registration_fee, description, event_time, advantages, slug")
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

  const { data: smtpProfile } = (await supabase!
    .from("profiles")
    .select("smtp_enabled, smtp_secure, smtp_host, smtp_port, smtp_username, smtp_password, smtp_from_name, smtp_from_email, smtp_reply_to, smtp_send_registration_emails, smtp_send_certificate_emails")
    .eq("id", user.id)
    .single()) as { data: any | null };

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
      smtpProfile={serialize(
        smtpProfile
          ? {
              smtp_enabled: smtpProfile.smtp_enabled,
              smtp_secure: smtpProfile.smtp_secure,
              smtp_host: smtpProfile.smtp_host,
              smtp_port: smtpProfile.smtp_port,
              smtp_username: smtpProfile.smtp_username,
              smtp_from_name: smtpProfile.smtp_from_name,
              smtp_from_email: smtpProfile.smtp_from_email,
              smtp_reply_to: smtpProfile.smtp_reply_to,
              smtp_send_registration_emails: smtpProfile.smtp_send_registration_emails,
              smtp_send_certificate_emails: smtpProfile.smtp_send_certificate_emails,
              smtp_has_saved_password: Boolean(smtpProfile.smtp_password),
            }
          : null,
      )}
    />
  );
}
