export interface CertificateTemplate {
  id: string;
  name: string;
  source: "built_in" | "custom";
  label: string;
  accent: string;
  frame: string;
  paper: string;
  ink: string;
  badge: string;
  sampleRecipient: string;
  sampleAchievement: string;
  pdfDataUrl?: string;
  pdfName?: string;
  signatureDataUrl?: string;
  signerName?: string;
  signerTitle?: string;
  placeholders?: {
    recipientName: string;
    achievement: string;
    eventName: string;
    organizationName: string;
    certificateId: string;
    issueDate: string;
  };
}

export const CERTIFICATE_TEMPLATES: CertificateTemplate[] = [
  {
    id: "midnight-grid",
    name: "Midnight Grid",
    source: "built_in",
    label: "Tech events",
    accent: "linear-gradient(135deg, #8fdcff 0%, #5873ff 55%, #8b5cf6 100%)",
    frame: "rgba(143,220,255,0.32)",
    paper: "linear-gradient(160deg, #07111f 0%, #0a1629 55%, #101a33 100%)",
    ink: "#eff5ff",
    badge: "#8fdcff",
    sampleRecipient: "Aarav Mehta",
    sampleAchievement: "Winner - AI Product Sprint 2026",
  },
  {
    id: "royal-laurel",
    name: "Royal Laurel",
    source: "built_in",
    label: "Awards",
    accent: "linear-gradient(135deg, #f6d365 0%, #f59e0b 50%, #b45309 100%)",
    frame: "rgba(245,158,11,0.3)",
    paper: "linear-gradient(160deg, #120e09 0%, #1a130b 55%, #20160a 100%)",
    ink: "#fff5df",
    badge: "#f6d365",
    sampleRecipient: "Naina Kapoor",
    sampleAchievement: "Best Innovation Award",
  },
  {
    id: "clean-slate",
    name: "Clean Slate",
    source: "built_in",
    label: "Workshops",
    accent: "linear-gradient(135deg, #d7e3ff 0%, #8fdcff 100%)",
    frame: "rgba(215,227,255,0.26)",
    paper: "linear-gradient(160deg, #11141b 0%, #171c26 55%, #1a2230 100%)",
    ink: "#f6fbff",
    badge: "#c9d8ff",
    sampleRecipient: "Sara Iqbal",
    sampleAchievement: "Workshop Completion Certificate",
  },
];

export function getCertificateTemplate(templateId?: string | null) {
  return CERTIFICATE_TEMPLATES.find((template) => template.id === templateId) ?? CERTIFICATE_TEMPLATES[0];
}
