/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireApprovedOrganizer } from "@/lib/auth";
import { CERTIFICATE_TEMPLATES, type CertificateTemplate } from "@/lib/certificates/templates";
import { createMongoServerClient } from "@/lib/db/mongo/server";
import { CertificatesClient } from "./certificates-client";

// Strip MongoDB _id buffers & toJSON methods so Next.js can serialize to client
function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

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

  const { data: customTemplates } = (await supabase!
    .from("certificate_templates")
    .select("*")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false })) as { data: any[] | null };

  // Fetch all registrations for the organizer's events
  const eventIds = (events || []).map((e: any) => e.id);
  let allRegistrations: any[] = [];
  if (eventIds.length > 0) {
    const { data: regs } = (await supabase!
      .from("event_registrations")
      .select("*")
      .in("event_id", eventIds)
      .order("created_at", { ascending: false })) as { data: any[] | null };
    allRegistrations = regs || [];
  }

  const certs = (certificates || []).map((certificate: any) => ({
    ...certificate,
    event_name: (certificate.events as Record<string, string>)?.name || "—",
  }));

  const mappedCustomTemplates: CertificateTemplate[] = (customTemplates || []).map((template: any) => ({
    id: template.id,
    name: template.name,
    source: "custom",
    label: "Custom PDF",
    accent: "linear-gradient(135deg, #8fdcff 0%, #5873ff 100%)",
    frame: "rgba(143,220,255,0.18)",
    paper: "linear-gradient(160deg, #0b1220 0%, #121b2d 100%)",
    ink: "#eff5ff",
    badge: "#8fdcff",
    sampleRecipient: "Participant Name",
    sampleAchievement: "Your uploaded certificate layout",
    pdfDataUrl: template.pdf_data_url,
    pdfName: template.pdf_name,
    signatureDataUrl: template.signature_data_url,
    signerName: template.signer_name,
    signerTitle: template.signer_title,
    placeholders: {
      recipientName: template.placeholder_recipient_name || "{{recipient_name}}",
      achievement: template.placeholder_achievement || "{{achievement}}",
      eventName: template.placeholder_event_name || "{{event_name}}",
      organizationName: template.placeholder_organization_name || "{{organization_name}}",
      certificateId: template.placeholder_certificate_id || "{{certificate_id}}",
      issueDate: template.placeholder_issue_date || "{{issue_date}}",
    },
  }));

  return (
    <CertificatesClient
      events={serialize(events || [])}
      certificates={serialize(certs)}
      templates={serialize([...CERTIFICATE_TEMPLATES, ...mappedCustomTemplates])}
      registrations={serialize(allRegistrations)}
    />
  );
}
