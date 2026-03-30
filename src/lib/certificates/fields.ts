export type CertificateTemplateAssetType = "pdf" | "image" | "built_in";
export type CertificatePlacementKind = "text" | "qr" | "image";
export type CertificateTextAlign = "left" | "center" | "right";

export type CertificateFieldSourceKey =
  | "recipient_name"
  | "recipient_email"
  | "recipient_phone"
  | "recipient_organization"
  | "receipt_number"
  | "category"
  | "achievement"
  | "certificate_statement"
  | "event_name"
  | "event_date"
  | "organization_name"
  | "certificate_id"
  | "issue_date"
  | "verification_url"
  | "verification_qr"
  | "signer_name"
  | "signer_title"
  | "signature_image"
  | "signer2_name"
  | "signer2_title"
  | "signature2_image";

export interface CertificateTemplatePlacement {
  id: string;
  sourceKey: CertificateFieldSourceKey;
  label: string;
  kind: CertificatePlacementKind;
  x: number;
  y: number;
  width: number;
  height?: number;
  fontSize?: number;
  color?: string;
  align?: CertificateTextAlign;
  bold?: boolean;
}

export interface SecondarySignatoryConfig {
  name?: string | null;
  title?: string | null;
  signatureDataUrl?: string | null;
}

export interface CertificateTemplateLayoutMeta {
  secondSignatory?: SecondarySignatoryConfig | null;
}

export interface CertificateTemplateLayout {
  version: 1;
  aspectRatio?: number;
  placements: CertificateTemplatePlacement[];
  meta?: CertificateTemplateLayoutMeta;
}

export interface CertificateFieldDefinition {
  sourceKey: CertificateFieldSourceKey;
  label: string;
  group: "registration" | "event" | "system" | "signatory";
  kind: CertificatePlacementKind;
  defaultWidth: number;
  defaultHeight?: number;
  defaultFontSize?: number;
  defaultColor?: string;
  defaultAlign?: CertificateTextAlign;
  defaultBold?: boolean;
  description?: string;
  legacy?: boolean;
}

export interface CertificateValueContext {
  registration?: Record<string, unknown> | null;
  participant?: Record<string, unknown> | null;
  event?: Record<string, unknown> | null;
  organizationName?: string | null;
  certificateId?: string | null;
  issueDate?: string | null;
  verificationUrl?: string | null;
  signerName?: string | null;
  signerTitle?: string | null;
  signatureDataUrl?: string | null;
  signer2Name?: string | null;
  signer2Title?: string | null;
  signature2DataUrl?: string | null;
}

export const EMPTY_TEMPLATE_LAYOUT: CertificateTemplateLayout = {
  version: 1,
  aspectRatio: 1.414,
  placements: [],
  meta: {},
};

export const PREVIEW_ISSUE_DATE = "2026-03-28T00:00:00.000Z";

export const CERTIFICATE_FIELD_DEFINITIONS: CertificateFieldDefinition[] = [
  {
    sourceKey: "recipient_name",
    label: "Recipient Name",
    group: "registration",
    kind: "text",
    defaultWidth: 0.52,
    defaultHeight: 0.12,
    defaultFontSize: 0.045,
    defaultColor: "#111827",
    defaultAlign: "center",
    defaultBold: true,
  },
  {
    sourceKey: "achievement",
    label: "Achievement",
    group: "registration",
    kind: "text",
    defaultWidth: 0.52,
    defaultHeight: 0.08,
    defaultFontSize: 0.024,
    defaultColor: "#1f2937",
    defaultAlign: "center",
  },
  {
    sourceKey: "certificate_statement",
    label: "Certificate Statement",
    group: "event",
    kind: "text",
    defaultWidth: 0.76,
    defaultHeight: 0.14,
    defaultFontSize: 0.02,
    defaultColor: "#1f2937",
    defaultAlign: "center",
    defaultBold: true,
    description: "Useful for participation certificates with a full event sentence.",
  },
  {
    sourceKey: "recipient_email",
    label: "Email",
    group: "registration",
    kind: "text",
    defaultWidth: 0.42,
    defaultHeight: 0.06,
    defaultFontSize: 0.018,
    defaultColor: "#1f2937",
    defaultAlign: "left",
  },
  {
    sourceKey: "recipient_phone",
    label: "Phone",
    group: "registration",
    kind: "text",
    defaultWidth: 0.26,
    defaultHeight: 0.06,
    defaultFontSize: 0.018,
    defaultColor: "#1f2937",
    defaultAlign: "left",
  },
  {
    sourceKey: "recipient_organization",
    label: "College / Organization",
    group: "registration",
    kind: "text",
    defaultWidth: 0.42,
    defaultHeight: 0.06,
    defaultFontSize: 0.018,
    defaultColor: "#1f2937",
    defaultAlign: "left",
  },
  {
    sourceKey: "receipt_number",
    label: "Receipt Number",
    group: "registration",
    kind: "text",
    defaultWidth: 0.28,
    defaultHeight: 0.06,
    defaultFontSize: 0.016,
    defaultColor: "#1f2937",
    defaultAlign: "left",
  },
  {
    sourceKey: "category",
    label: "Category",
    group: "registration",
    kind: "text",
    defaultWidth: 0.22,
    defaultHeight: 0.06,
    defaultFontSize: 0.018,
    defaultColor: "#1f2937",
    defaultAlign: "center",
    defaultBold: true,
  },
  {
    sourceKey: "event_name",
    label: "Event Name",
    group: "event",
    kind: "text",
    defaultWidth: 0.42,
    defaultHeight: 0.06,
    defaultFontSize: 0.02,
    defaultColor: "#1f2937",
    defaultAlign: "center",
  },
  {
    sourceKey: "event_date",
    label: "Event Date",
    group: "event",
    kind: "text",
    defaultWidth: 0.28,
    defaultHeight: 0.06,
    defaultFontSize: 0.018,
    defaultColor: "#1f2937",
    defaultAlign: "center",
  },
  {
    sourceKey: "organization_name",
    label: "Issuing Organization",
    group: "event",
    kind: "text",
    defaultWidth: 0.38,
    defaultHeight: 0.06,
    defaultFontSize: 0.018,
    defaultColor: "#1f2937",
    defaultAlign: "center",
  },
  {
    sourceKey: "certificate_id",
    label: "Certificate ID",
    group: "system",
    kind: "text",
    defaultWidth: 0.28,
    defaultHeight: 0.06,
    defaultFontSize: 0.018,
    defaultColor: "#1f2937",
    defaultAlign: "left",
    defaultBold: true,
  },
  {
    sourceKey: "issue_date",
    label: "Issue Date",
    group: "system",
    kind: "text",
    defaultWidth: 0.22,
    defaultHeight: 0.06,
    defaultFontSize: 0.018,
    defaultColor: "#1f2937",
    defaultAlign: "left",
  },
  {
    sourceKey: "verification_url",
    label: "Verification URL",
    group: "system",
    kind: "text",
    defaultWidth: 0.34,
    defaultHeight: 0.08,
    defaultFontSize: 0.014,
    defaultColor: "#1f2937",
    defaultAlign: "left",
  },
  {
    sourceKey: "verification_qr",
    label: "Verification QR",
    group: "system",
    kind: "qr",
    defaultWidth: 0.12,
    defaultHeight: 0.16,
  },
  {
    sourceKey: "signer_name",
    label: "Signatory 1 Name",
    group: "signatory",
    kind: "text",
    defaultWidth: 0.24,
    defaultHeight: 0.05,
    defaultFontSize: 0.02,
    defaultColor: "#1f2937",
    defaultAlign: "left",
    defaultBold: true,
  },
  {
    sourceKey: "signer_title",
    label: "Signatory 1 Title",
    group: "signatory",
    kind: "text",
    defaultWidth: 0.24,
    defaultHeight: 0.04,
    defaultFontSize: 0.016,
    defaultColor: "#4b5563",
    defaultAlign: "left",
  },
  {
    sourceKey: "signature_image",
    label: "Signature 1 Image",
    group: "signatory",
    kind: "image",
    defaultWidth: 0.18,
    defaultHeight: 0.12,
  },
  {
    sourceKey: "signer2_name",
    label: "Signatory 2 Name",
    group: "signatory",
    kind: "text",
    defaultWidth: 0.24,
    defaultHeight: 0.05,
    defaultFontSize: 0.02,
    defaultColor: "#1f2937",
    defaultAlign: "left",
    defaultBold: true,
  },
  {
    sourceKey: "signer2_title",
    label: "Signatory 2 Title",
    group: "signatory",
    kind: "text",
    defaultWidth: 0.24,
    defaultHeight: 0.04,
    defaultFontSize: 0.016,
    defaultColor: "#4b5563",
    defaultAlign: "left",
  },
  {
    sourceKey: "signature2_image",
    label: "Signature 2 Image",
    group: "signatory",
    kind: "image",
    defaultWidth: 0.18,
    defaultHeight: 0.12,
  },
];

export function formatCertificateDate(dateInput?: string | null) {
  const date = dateInput ? new Date(dateInput) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatCategoryLabel(category?: string | null) {
  if (!category) return "Participant";
  if (category === "runner_up") return "Runner-Up";
  return category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatEventDate(event?: Record<string, unknown> | null) {
  const startDate = typeof event?.start_date === "string" ? event.start_date : null;
  const endDate = typeof event?.end_date === "string" ? event.end_date : null;

  if (!startDate) return "—";

  const start = formatCertificateDate(startDate);
  if (!endDate || endDate === startDate) return start;
  return `${start} - ${formatCertificateDate(endDate)}`;
}

export function buildCertificateStatement(context: CertificateValueContext) {
  const event = context.event;
  const eventName = String(event?.name ?? "the event").trim();
  const organizationName = String(context.organizationName ?? event?.org_name_display ?? "the organizer").trim();
  const eventDate = formatEventDate(event);

  const parts = [`Who has attended ${eventName}`];

  if (organizationName && organizationName !== "—") {
    parts.push(`hosted by ${organizationName}`);
  }

  if (eventDate && eventDate !== "—") {
    parts.push(`on ${eventDate}`);
  }

  return parts.join(" ");
}

export function resolveCertificateFieldValue(sourceKey: CertificateFieldSourceKey, context: CertificateValueContext) {
  const registration = context.registration;
  const participant = context.participant;
  const event = context.event;

  switch (sourceKey) {
    case "recipient_name":
      return String(registration?.full_name ?? participant?.full_name ?? "Participant Name");
    case "recipient_email":
      return String(registration?.email ?? participant?.email ?? "participant@example.com");
    case "recipient_phone":
      return String(registration?.phone ?? "");
    case "recipient_organization":
      return String(registration?.college_name ?? context.organizationName ?? "");
    case "receipt_number":
      return String(registration?.receipt_number ?? "");
    case "category":
      return formatCategoryLabel(String(participant?.category ?? registration?.category ?? "participant"));
    case "achievement":
      return String(
        participant?.achievement_detail ??
          (participant?.category === "winner"
            ? "Winner"
            : participant?.category === "runner_up"
              ? "Runner-Up"
              : "Participant"),
      );
    case "certificate_statement":
      return buildCertificateStatement(context);
    case "event_name":
      return String(event?.name ?? "Event Name");
    case "event_date":
      return formatEventDate(event);
    case "organization_name":
      return String(context.organizationName ?? event?.org_name_display ?? "ProofPass");
    case "certificate_id":
      return String(context.certificateId ?? "PP-2026-DEMO-00001");
    case "issue_date":
      return formatCertificateDate(context.issueDate);
    case "verification_url":
      return String(context.verificationUrl ?? "https://proofpass.in/verify/PP-2026-DEMO-00001");
    case "verification_qr":
      return String(context.verificationUrl ?? "");
    case "signer_name":
      return String(context.signerName ?? "Signatory One");
    case "signer_title":
      return String(context.signerTitle ?? "Organizer");
    case "signature_image":
      return String(context.signatureDataUrl ?? "");
    case "signer2_name":
      return String(context.signer2Name ?? "Signatory Two");
    case "signer2_title":
      return String(context.signer2Title ?? "Representative");
    case "signature2_image":
      return String(context.signature2DataUrl ?? "");
    default:
      return "";
  }
}

export function buildCertificateValueMap(context: CertificateValueContext) {
  return CERTIFICATE_FIELD_DEFINITIONS.reduce<Partial<Record<CertificateFieldSourceKey, string>>>((accumulator, field) => {
    accumulator[field.sourceKey] = resolveCertificateFieldValue(field.sourceKey, context);
    return accumulator;
  }, {});
}

export function getCertificateFieldDefinition(sourceKey: CertificateFieldSourceKey) {
  return CERTIFICATE_FIELD_DEFINITIONS.find((field) => field.sourceKey === sourceKey);
}

export function createDefaultPlacement(sourceKey: CertificateFieldSourceKey): CertificateTemplatePlacement {
  const field = getCertificateFieldDefinition(sourceKey);
  if (!field) {
    throw new Error(`Unknown certificate field: ${sourceKey}`);
  }

  return {
    id: sourceKey,
    sourceKey,
    label: field.label,
    kind: field.kind,
    x: 0.18,
    y: 0.2,
    width: field.defaultWidth,
    height: field.defaultHeight,
    fontSize: field.defaultFontSize,
    color: field.defaultColor,
    align: field.defaultAlign,
    bold: field.defaultBold,
  };
}

export function parseTemplateLayout(input: unknown): CertificateTemplateLayout | null {
  if (!input) return null;

  try {
    const parsed = typeof input === "string" ? JSON.parse(input) : input;
    if (!parsed || typeof parsed !== "object") return null;

    const layout = parsed as Record<string, unknown>;
    const placements = Array.isArray(layout.placements)
      ? layout.placements
          .filter((placement): placement is Record<string, unknown> => Boolean(placement && typeof placement === "object"))
          .map((placement) => ({
            id: String(placement.id || placement.sourceKey || crypto.randomUUID?.() || Math.random().toString(36).slice(2)),
            sourceKey: String(placement.sourceKey) as CertificateFieldSourceKey,
            label: String(placement.label || placement.sourceKey || "Field"),
            kind: String(placement.kind || "text") as CertificatePlacementKind,
            x: Number(placement.x ?? 0),
            y: Number(placement.y ?? 0),
            width: Number(placement.width ?? 0.2),
            height: placement.height == null ? undefined : Number(placement.height),
            fontSize: placement.fontSize == null ? undefined : Number(placement.fontSize),
            color: placement.color == null ? undefined : String(placement.color),
            align: placement.align == null ? undefined : (String(placement.align) as CertificateTextAlign),
            bold: placement.bold == null ? undefined : Boolean(placement.bold),
          }))
      : [];

    const metaRecord = layout.meta && typeof layout.meta === "object" ? (layout.meta as Record<string, unknown>) : null;
    const secondSignatoryRecord =
      metaRecord?.secondSignatory && typeof metaRecord.secondSignatory === "object"
        ? (metaRecord.secondSignatory as Record<string, unknown>)
        : null;

    const meta: CertificateTemplateLayoutMeta | undefined = secondSignatoryRecord
      ? {
          secondSignatory: {
            name: secondSignatoryRecord.name == null ? undefined : String(secondSignatoryRecord.name),
            title: secondSignatoryRecord.title == null ? undefined : String(secondSignatoryRecord.title),
            signatureDataUrl:
              secondSignatoryRecord.signatureDataUrl == null
                ? undefined
                : String(secondSignatoryRecord.signatureDataUrl),
          },
        }
      : undefined;

    return {
      version: 1,
      aspectRatio: layout.aspectRatio == null ? 1.414 : Number(layout.aspectRatio),
      placements,
      meta,
    };
  } catch {
    return null;
  }
}

export function guessTemplateAssetType(fileType?: string | null, dataUrl?: string | null): CertificateTemplateAssetType {
  const normalizedType = String(fileType || "").toLowerCase();
  const normalizedDataUrl = String(dataUrl || "").toLowerCase();

  if (
    normalizedType.startsWith("image/") ||
    normalizedDataUrl.startsWith("data:image/") ||
    /\.(png|jpe?g|webp|gif|svg)(\?|#|$)/.test(normalizedDataUrl)
  ) {
    return "image";
  }

  if (
    normalizedType === "application/pdf" ||
    normalizedDataUrl.startsWith("data:application/pdf") ||
    /\.pdf(\?|#|$)/.test(normalizedDataUrl)
  ) {
    return "pdf";
  }

  return "built_in";
}
