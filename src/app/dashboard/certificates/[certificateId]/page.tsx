import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  ExternalLink,
  FileBadge2,
  Mail,
  Phone,
  ShieldCheck,
  Trophy,
  UserRound,
} from "lucide-react";

import { CertificateSurface } from "@/components/certificates/certificate-surface";
import { PrintCertificateButton } from "@/components/certificates/print-certificate-button";
import { requireApprovedOrganizer } from "@/lib/auth";
import {
  buildCertificateValueMap,
  formatCategoryLabel,
  formatEventDate,
  parseTemplateLayout,
  type CertificateFieldSourceKey,
} from "@/lib/certificates/fields";
import {
  getCertificateTemplate,
  hasAssetBackedTemplateSurface,
  mapCustomCertificateTemplate,
  type CertificateTemplate,
} from "@/lib/certificates/templates";
import { createMongoServerClient } from "@/lib/db/mongo/server";

type JsonRecord = Record<string, unknown>;

type CertificateRow = {
  id: string;
  event_id?: string | null;
  template_id?: string | null;
  template_source?: string | null;
  template_name?: string | null;
  template_snapshot_json?: unknown;
  field_values_json?: unknown;
  certificate_id_display?: string | null;
  status?: string | null;
  recipient_name?: string | null;
  recipient_email?: string | null;
  recipient_phone?: string | null;
  recipient_organization?: string | null;
  category?: string | null;
  achievement_detail?: string | null;
  organization_name?: string | null;
  verification_url?: string | null;
  qr_code_data?: string | null;
  issued_at?: string | null;
};

type EventRow = {
  id?: string | null;
  name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  venue?: string | null;
  org_name_display?: string | null;
};

function parseJsonRecord<T extends JsonRecord>(value: unknown): T | null {
  if (!value) return null;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? (parsed as T) : null;
    } catch {
      return null;
    }
  }

  return typeof value === "object" ? (value as T) : null;
}

function resolveTemplateFromSnapshot(snapshot: JsonRecord | null, fallbackTemplateId?: string | null) {
  if (!snapshot) return null;

  const fallbackTemplate = getCertificateTemplate(String(snapshot.id ?? fallbackTemplateId ?? ""));
  const source = snapshot.source === "custom" ? "custom" : "built_in";

  const snapshotAssetType =
    snapshot.assetType === "image" || snapshot.assetType === "pdf" || snapshot.assetType === "built_in"
      ? snapshot.assetType
      : undefined;

  const template: CertificateTemplate = {
    ...(source === "built_in" ? fallbackTemplate : {}),
    id: String(snapshot.id ?? fallbackTemplate.id),
    name: String(snapshot.name ?? fallbackTemplate.name),
    source,
    label: String(snapshot.label ?? fallbackTemplate.label),
    accent: String(snapshot.accent ?? fallbackTemplate.accent),
    frame: String(snapshot.frame ?? fallbackTemplate.frame),
    paper: String(snapshot.paper ?? fallbackTemplate.paper),
    ink: String(snapshot.ink ?? fallbackTemplate.ink),
    badge: String(snapshot.badge ?? fallbackTemplate.badge),
    sampleRecipient: String(snapshot.sampleRecipient ?? fallbackTemplate.sampleRecipient),
    sampleAchievement: String(snapshot.sampleAchievement ?? fallbackTemplate.sampleAchievement),
    assetType: source === "custom" ? snapshotAssetType : snapshotAssetType ?? fallbackTemplate.assetType,
    assetDataUrl: typeof snapshot.assetDataUrl === "string" ? snapshot.assetDataUrl : undefined,
    assetName: typeof snapshot.assetName === "string" ? snapshot.assetName : undefined,
    pdfDataUrl: typeof snapshot.pdfDataUrl === "string" ? snapshot.pdfDataUrl : undefined,
    pdfName: typeof snapshot.pdfName === "string" ? snapshot.pdfName : undefined,
    signatureDataUrl: typeof snapshot.signatureDataUrl === "string" ? snapshot.signatureDataUrl : undefined,
    signerName: typeof snapshot.signerName === "string" ? snapshot.signerName : undefined,
    signerTitle: typeof snapshot.signerTitle === "string" ? snapshot.signerTitle : undefined,
    signature2DataUrl: typeof snapshot.signature2DataUrl === "string" ? snapshot.signature2DataUrl : undefined,
    signer2Name: typeof snapshot.signer2Name === "string" ? snapshot.signer2Name : undefined,
    signer2Title: typeof snapshot.signer2Title === "string" ? snapshot.signer2Title : undefined,
    layout: parseTemplateLayout(snapshot.layout) ?? fallbackTemplate.layout,
  };

  return template;
}

function shouldRenderFieldOverlay(template: CertificateTemplate) {
  return hasAssetBackedTemplateSurface(template) && Boolean(template.layout?.placements?.length);
}

function formatIssuedDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function DashboardCertificatePage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const user = await requireApprovedOrganizer();
  const { certificateId } = await params;
  const supabase = await createMongoServerClient();

  const { data } = await supabase!
    .from("certificates")
    .select("*")
    .eq("id", certificateId)
    .eq("organizer_id", user.id)
    .single();

  const certificate = (data as CertificateRow | null) ?? null;
  if (!certificate) notFound();

  const { data: eventData } = certificate.event_id
    ? await supabase!
        .from("events")
        .select("id, name, start_date, end_date, venue, org_name_display")
        .eq("id", certificate.event_id)
        .eq("organizer_id", user.id)
        .single()
    : { data: null };

  const event = (eventData as EventRow | null) ?? null;

  const templateSnapshot = parseJsonRecord<JsonRecord>(certificate.template_snapshot_json);
  let template = resolveTemplateFromSnapshot(templateSnapshot, certificate.template_id);

  if (!template && certificate.template_source === "custom" && certificate.template_id) {
    const { data: customTemplateData } = await supabase!
      .from("certificate_templates")
      .select("*")
      .eq("id", certificate.template_id)
      .eq("organizer_id", user.id)
      .single();

    if (customTemplateData) {
      template = mapCustomCertificateTemplate(customTemplateData as JsonRecord);
    }
  }

  if (!template) {
    template = getCertificateTemplate(certificate.template_id);
  }

  const fallbackValues = buildCertificateValueMap({
    registration: {
      full_name: certificate.recipient_name,
      email: certificate.recipient_email,
      phone: certificate.recipient_phone,
      college_name: certificate.recipient_organization,
    },
    participant: {
      full_name: certificate.recipient_name,
      email: certificate.recipient_email,
      category: certificate.category,
      achievement_detail: certificate.achievement_detail,
    },
    event: event as JsonRecord | null,
    organizationName: certificate.organization_name || user.orgName || event?.org_name_display || "ProofPass",
    certificateId: certificate.certificate_id_display,
    issueDate: certificate.issued_at,
    verificationUrl: certificate.verification_url,
    signerName: template.signerName,
    signerTitle: template.signerTitle,
    signatureDataUrl: template.signatureDataUrl,
    signer2Name: template.signer2Name,
    signer2Title: template.signer2Title,
    signature2DataUrl: template.signature2DataUrl,
  });

  const storedValues = parseJsonRecord<Partial<Record<CertificateFieldSourceKey, string>>>(certificate.field_values_json);
  const fieldValues: Partial<Record<CertificateFieldSourceKey, string>> = {
    ...fallbackValues,
    ...(storedValues ?? {}),
  };

  if (typeof certificate.qr_code_data === "string" && certificate.qr_code_data.startsWith("data:image")) {
    fieldValues.verification_qr = certificate.qr_code_data;
  }

  const verifyHref =
    certificate.verification_url ||
    (certificate.certificate_id_display
      ? `/verify/${encodeURIComponent(certificate.certificate_id_display)}`
      : undefined);

  const statusBadgeClass =
    certificate.status === "revoked"
      ? "badge-danger"
      : certificate.status === "draft"
        ? "badge-neutral"
        : "badge-success";

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "24px" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              .certificate-page-chrome {
                display: none !important;
              }

              .certificate-print-card {
                padding: 0 !important;
                border: none !important;
                background: #ffffff !important;
                box-shadow: none !important;
              }

              body {
                background: #ffffff !important;
              }
            }
          `,
        }}
      />

      <div className="certificate-page-chrome" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <Link href="/dashboard/certificates" className="btn-secondary" style={{ marginBottom: "12px", width: "fit-content" }}>
            <ArrowLeft size={16} />
            Back to Certificates
          </Link>
          <h1 className="text-2xl font-bold" style={{ marginBottom: "6px" }}>
            {certificate.recipient_name || "Certificate"}
          </h1>
          <p style={{ color: "var(--muted-foreground)", margin: 0 }}>
            Review the generated certificate, open its verification page, or print and save it as PDF.
          </p>
        </div>

        <div className="certificate-page-chrome" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {verifyHref ? (
            <a href={verifyHref} target="_blank" rel="noreferrer" className="btn-secondary">
              <ExternalLink size={16} />
              Open Verification
            </a>
          ) : null}
          <PrintCertificateButton />
        </div>
      </div>

      <div className="glass-card certificate-print-card" style={{ padding: "20px" }}>
        <CertificateSurface
          template={template}
          values={fieldValues}
          showPlacedFields={shouldRenderFieldOverlay(template)}
          showTemplateMeta={false}
          style={{ boxShadow: "none" }}
        />
      </div>

      <div className="certificate-page-chrome" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", alignItems: "start" }}>
        <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <UserRound size={18} style={{ color: "var(--primary-soft)" }} />
            <h2 className="font-semibold" style={{ margin: 0 }}>
              Recipient Details
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            <div>
              <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "6px" }}>
                Recipient Name
              </div>
              <div style={{ fontWeight: 600 }}>{fieldValues.recipient_name || "-"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "6px" }}>
                Category
              </div>
              <span className="badge badge-info">{formatCategoryLabel(certificate.category)}</span>
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "6px" }}>
                Email
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--muted-foreground)" }}>
                <Mail size={14} />
                <span>{certificate.recipient_email || "-"}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "6px" }}>
                Phone
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--muted-foreground)" }}>
                <Phone size={14} />
                <span>{certificate.recipient_phone || "-"}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "6px" }}>
                College / Organization
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--foreground)" }}>
                <Building2 size={14} />
                <span>{certificate.recipient_organization || "-"}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "6px" }}>
                Achievement
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--foreground)" }}>
                <Trophy size={14} />
                <span>{certificate.achievement_detail || fieldValues.achievement || "Participant"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShieldCheck size={18} style={{ color: "var(--primary-soft)" }} />
            <h2 className="font-semibold" style={{ margin: 0 }}>
              Certificate Summary
            </h2>
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ padding: "14px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "6px" }}>
                Certificate ID
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileBadge2 size={16} style={{ color: "var(--primary-soft)" }} />
                <code style={{ color: "var(--primary-soft)", fontWeight: 700 }}>{certificate.certificate_id_display || "-"}</code>
              </div>
            </div>

            <div style={{ padding: "14px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "6px" }}>
                Status
              </div>
              <span className={`badge ${statusBadgeClass}`}>{certificate.status || "active"}</span>
            </div>

            <div style={{ padding: "14px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "6px" }}>
                Event
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <CalendarDays size={16} style={{ color: "var(--primary-soft)" }} />
                <span style={{ fontWeight: 600 }}>{event?.name || fieldValues.event_name || "-"}</span>
              </div>
              <div style={{ color: "var(--muted-foreground)", fontSize: "0.84rem" }}>
                {formatEventDate(event as JsonRecord | null)}
                {event?.venue ? ` • ${event.venue}` : ""}
              </div>
            </div>

            <div style={{ padding: "14px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "6px" }}>
                Issuing Organization
              </div>
              <div style={{ marginBottom: "6px", fontWeight: 600 }}>{certificate.organization_name || event?.org_name_display || user.orgName || "ProofPass"}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--muted-foreground)", fontSize: "0.84rem" }}>
                <BadgeCheck size={14} />
                <span>Issued on {formatIssuedDate(certificate.issued_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
