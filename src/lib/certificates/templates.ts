import {
  type CertificateTemplateAssetType,
  type CertificateTemplateLayout,
  EMPTY_TEMPLATE_LAYOUT,
  guessTemplateAssetType,
  parseTemplateLayout,
} from "@/lib/certificates/fields";

export interface CertificateTemplate {
  id: string;
  name: string;
  source: "built_in" | "custom";
  hidden?: boolean;
  label: string;
  accent: string;
  frame: string;
  paper: string;
  ink: string;
  badge: string;
  sampleRecipient: string;
  sampleAchievement: string;
  assetType?: CertificateTemplateAssetType;
  assetDataUrl?: string;
  assetName?: string;
  pdfDataUrl?: string;
  pdfName?: string;
  signatureDataUrl?: string;
  signerName?: string;
  signerTitle?: string;
  signature2DataUrl?: string;
  signer2Name?: string;
  signer2Title?: string;
  layout?: CertificateTemplateLayout | null;
  placeholders?: {
    recipientName: string;
    achievement: string;
    certificateStatement?: string;
    eventName: string;
    organizationName: string;
    certificateId: string;
    issueDate: string;
  };
}

const participationTemplateLayout: CertificateTemplateLayout = {
  version: 1,
  aspectRatio: 1275 / 901,
  placements: [
    {
      id: "participant-name",
      sourceKey: "recipient_name",
      label: "Recipient Name",
      kind: "text",
      x: 0.19,
      y: 0.4,
      width: 0.62,
      height: 0.15,
      fontSize: 0.082,
      color: "#283a6b",
      align: "center",
      bold: false,
    },
    {
      id: "certificate-statement",
      sourceKey: "certificate_statement",
      label: "Certificate Statement",
      kind: "text",
      x: 0.16,
      y: 0.57,
      width: 0.68,
      height: 0.1,
      fontSize: 0.025,
      color: "#283a6b",
      align: "center",
      bold: true,
    },
    {
      id: "signature-one-image",
      sourceKey: "signature_image",
      label: "Signatory 1 Signature",
      kind: "image",
      x: 0.315,
      y: 0.67,
      width: 0.12,
      height: 0.085,
    },
    {
      id: "signature-one-name",
      sourceKey: "signer_name",
      label: "Signatory 1 Name",
      kind: "text",
      x: 0.26,
      y: 0.785,
      width: 0.22,
      height: 0.04,
      fontSize: 0.025,
      color: "#283a6b",
      align: "center",
      bold: true,
    },
    {
      id: "signature-one-title",
      sourceKey: "signer_title",
      label: "Signatory 1 Title",
      kind: "text",
      x: 0.26,
      y: 0.83,
      width: 0.22,
      height: 0.03,
      fontSize: 0.018,
      color: "#283a6b",
      align: "center",
      bold: true,
    },
    {
      id: "signature-two-image",
      sourceKey: "signature2_image",
      label: "Signatory 2 Signature",
      kind: "image",
      x: 0.567,
      y: 0.67,
      width: 0.12,
      height: 0.085,
    },
    {
      id: "signature-two-name",
      sourceKey: "signer2_name",
      label: "Signatory 2 Name",
      kind: "text",
      x: 0.515,
      y: 0.785,
      width: 0.22,
      height: 0.04,
      fontSize: 0.025,
      color: "#283a6b",
      align: "center",
      bold: true,
    },
    {
      id: "signature-two-title",
      sourceKey: "signer2_title",
      label: "Signatory 2 Title",
      kind: "text",
      x: 0.515,
      y: 0.83,
      width: 0.22,
      height: 0.03,
      fontSize: 0.018,
      color: "#283a6b",
      align: "center",
      bold: true,
    },
    {
      id: "verification-qr",
      sourceKey: "verification_qr",
      label: "Verification QR",
      kind: "qr",
      x: 0.86,
      y: 0.76,
      width: 0.07,
      height: 0.1,
    },
  ],
  meta: {
    secondSignatory: {
      name: "Donna Stroupe",
      title: "Representative",
    },
  },
};

export const CERTIFICATE_TEMPLATES: CertificateTemplate[] = [
  {
    id: "participation-blue-gold",
    name: "Participation Blue & Gold",
    source: "built_in",
    label: "Participation",
    accent: "linear-gradient(135deg, #f7d370 0%, #c99721 100%)",
    frame: "rgba(201,151,33,0.34)",
    paper: "#ffffff",
    ink: "#283a6b",
    badge: "#c99721",
    sampleRecipient: "Rosa Maria Aguado",
    sampleAchievement: "Participation Certificate",
    assetType: "image",
    assetDataUrl: "/certificate-templates/participation-blue-gold.png",
    assetName: "White Gold Blue Participation Template",
    signatureDataUrl: undefined,
    signerName: "Brigita Tsamara",
    signerTitle: "Chairman",
    signature2DataUrl: undefined,
    signer2Name: "Donna Stroupe",
    signer2Title: "Representative",
    layout: participationTemplateLayout,
    placeholders: {
      recipientName: "{{recipient_name}}",
      achievement: "{{achievement}}",
      certificateStatement: "{{certificate_statement}}",
      eventName: "{{event_name}}",
      organizationName: "{{organization_name}}",
      certificateId: "{{certificate_id}}",
      issueDate: "{{issue_date}}",
    },
  },
];

export function getVisibleCertificateTemplates() {
  return CERTIFICATE_TEMPLATES.filter((template) => !template.hidden);
}

export function hasAssetBackedTemplateSurface(template?: CertificateTemplate | null) {
  return Boolean(template && (template.assetDataUrl || template.pdfDataUrl));
}

export function dedupeCertificateTemplates(templates: CertificateTemplate[]) {
  const seen = new Set<string>();

  return templates.filter((template) => {
    const key = `${template.id}::${template.assetDataUrl || template.pdfDataUrl || template.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getCertificateTemplate(templateId?: string | null) {
  return CERTIFICATE_TEMPLATES.find((template) => template.id === templateId) ?? CERTIFICATE_TEMPLATES[0];
}

export function mapCustomCertificateTemplate(record: Record<string, unknown>): CertificateTemplate {
  const assetDataUrl =
    (typeof record.template_asset_data_url === "string" && record.template_asset_data_url) ||
    (typeof record.pdf_data_url === "string" && record.pdf_data_url) ||
    undefined;

  const assetName =
    (typeof record.template_asset_name === "string" && record.template_asset_name) ||
    (typeof record.pdf_name === "string" && record.pdf_name) ||
    undefined;

  const assetType = guessTemplateAssetType(
    typeof record.template_asset_type === "string" ? record.template_asset_type : undefined,
    assetDataUrl,
  );

  const layout = parseTemplateLayout(record.layout_json) ?? EMPTY_TEMPLATE_LAYOUT;
  const secondSignatory = layout.meta?.secondSignatory;

  return {
    id: String(record.id),
    name: String(record.name ?? "Custom Template"),
    source: "custom",
    label: assetType === "image" ? "Custom image" : assetType === "pdf" ? "Custom PDF" : "Custom template",
    accent: "linear-gradient(135deg, #8fdcff 0%, #5873ff 100%)",
    frame: "rgba(143,220,255,0.18)",
    paper: "linear-gradient(160deg, #0b1220 0%, #121b2d 100%)",
    ink: "#eff5ff",
    badge: "#8fdcff",
    sampleRecipient: "Participant Name",
    sampleAchievement: "Your uploaded certificate layout",
    assetType,
    assetDataUrl,
    assetName,
    pdfDataUrl: assetType === "pdf" ? assetDataUrl : undefined,
    pdfName: assetType === "pdf" ? assetName : undefined,
    signatureDataUrl: typeof record.signature_data_url === "string" ? record.signature_data_url : undefined,
    signerName: typeof record.signer_name === "string" ? record.signer_name : undefined,
    signerTitle: typeof record.signer_title === "string" ? record.signer_title : undefined,
    signature2DataUrl: secondSignatory?.signatureDataUrl ?? undefined,
    signer2Name: secondSignatory?.name ?? undefined,
    signer2Title: secondSignatory?.title ?? undefined,
    layout,
    placeholders: {
      recipientName: typeof record.placeholder_recipient_name === "string" ? record.placeholder_recipient_name : "{{recipient_name}}",
      achievement: typeof record.placeholder_achievement === "string" ? record.placeholder_achievement : "{{achievement}}",
      certificateStatement: "{{certificate_statement}}",
      eventName: typeof record.placeholder_event_name === "string" ? record.placeholder_event_name : "{{event_name}}",
      organizationName: typeof record.placeholder_organization_name === "string" ? record.placeholder_organization_name : "{{organization_name}}",
      certificateId: typeof record.placeholder_certificate_id === "string" ? record.placeholder_certificate_id : "{{certificate_id}}",
      issueDate: typeof record.placeholder_issue_date === "string" ? record.placeholder_issue_date : "{{issue_date}}",
    },
  };
}
