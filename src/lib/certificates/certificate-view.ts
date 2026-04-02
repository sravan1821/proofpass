import {
  buildCertificateValueMap,
  parseTemplateLayout,
  type CertificateFieldSourceKey,
} from "@/lib/certificates/fields";
import {
  getCertificateTemplate,
  hasAssetBackedTemplateSurface,
  mapCustomCertificateTemplate,
  type CertificateTemplate,
} from "@/lib/certificates/templates";

export type JsonRecord = Record<string, unknown>;

export type CertificateViewRow = {
  id: string;
  event_id?: string | null;
  template_id?: string | null;
  template_source?: string | null;
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

export function parseJsonRecord<T extends JsonRecord>(value: unknown): T | null {
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

export function resolveTemplateFromSnapshot(snapshot: JsonRecord | null, fallbackTemplateId?: string | null) {
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

export function shouldRenderFieldOverlay(template: CertificateTemplate) {
  return hasAssetBackedTemplateSurface(template) && Boolean(template.layout?.placements?.length);
}

export function buildCertificateViewData(args: {
  certificate: CertificateViewRow;
  event?: JsonRecord | null;
  organizationName?: string | null;
}) {
  const { certificate, event, organizationName } = args;

  const templateSnapshot = parseJsonRecord<JsonRecord>(certificate.template_snapshot_json);
  let template = resolveTemplateFromSnapshot(templateSnapshot, certificate.template_id);

  if (!template && certificate.template_source === "custom" && certificate.template_snapshot_json) {
    const snapshotRecord = parseJsonRecord<JsonRecord>(certificate.template_snapshot_json);
    if (snapshotRecord) {
      template = mapCustomCertificateTemplate(snapshotRecord);
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
    event,
    organizationName: certificate.organization_name || organizationName || "ProofPass",
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

  return {
    template,
    fieldValues,
  };
}
