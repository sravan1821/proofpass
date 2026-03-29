"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Eye,
  LayoutTemplate,
  Plus,
  Save,
  Trophy,
  Upload,
  Users,
  X,
} from "lucide-react";

import { CertificateSurface } from "@/components/certificates/certificate-surface";
import {
  buildCertificateValueMap,
  EMPTY_TEMPLATE_LAYOUT,
  PREVIEW_ISSUE_DATE,
  type CertificateTemplateAssetType,
  type CertificateTemplateLayout,
} from "@/lib/certificates/fields";
import { hasAssetBackedTemplateSurface, type CertificateTemplate } from "@/lib/certificates/templates";
import { issueCertificatesAction, upsertCustomCertificateTemplateAction } from "./actions";
import { TemplateDesigner } from "./template-designer";

interface CertificatesClientProps {
  events: Array<Record<string, unknown>>;
  certificates: Array<Record<string, unknown>>;
  templates: CertificateTemplate[];
  registrations: Array<Record<string, unknown>>;
  organizationName: string;
}

type EditorState = {
  templateId?: string;
  name: string;
  signerName: string;
  signerTitle: string;
  signer2Name: string;
  signer2Title: string;
  assetType?: CertificateTemplateAssetType;
  assetDataUrl?: string;
  assetName?: string;
  signatureDataUrl?: string;
  signature2DataUrl?: string;
  layout: CertificateTemplateLayout;
};

type CertTab = "events" | "templates";

const DEMO_EVENTS: Array<Record<string, unknown>> = [
  { id: "demo-evt-1", name: "TechFest 2026", status: "active", start_date: "2026-03-25", end_date: "2026-03-25" },
  { id: "demo-evt-2", name: "Code Sprint Championship", status: "completed", start_date: "2026-03-18", end_date: "2026-03-18" },
  { id: "demo-evt-3", name: "AI/ML Workshop", status: "published", start_date: "2026-03-29", end_date: "2026-03-29" },
];

const DEMO_REGISTRATIONS: Array<Record<string, unknown>> = [
  { id: "demo-r1", event_id: "demo-evt-1", full_name: "Aarav Sharma", email: "aarav.sharma@email.com", phone: "+91 98765 43210", college_name: "JNTU Hyderabad", payment_status: "paid", receipt_number: "PP-RX1A2B", created_at: "2026-03-20T10:00:00Z" },
  { id: "demo-r2", event_id: "demo-evt-1", full_name: "Priya Patel", email: "priya.patel@email.com", phone: "+91 87654 32109", college_name: "IIT Bombay", payment_status: "paid", receipt_number: "PP-RX3C4D", created_at: "2026-03-21T14:30:00Z" },
  { id: "demo-r3", event_id: "demo-evt-1", full_name: "Rohit Verma", email: "rohit.v@email.com", phone: "+91 76543 21098", college_name: "NIT Warangal", payment_status: "pending", receipt_number: "PP-RX5E6F", created_at: "2026-03-22T09:15:00Z" },
  { id: "demo-r4", event_id: "demo-evt-1", full_name: "Sneha Reddy", email: "sneha.r@email.com", phone: "+91 65432 10987", college_name: "BITS Pilani", payment_status: "paid", receipt_number: "PP-RX7G8H", created_at: "2026-03-23T16:45:00Z" },
  { id: "demo-r5", event_id: "demo-evt-1", full_name: "Karthik Nair", email: "karthik.n@email.com", phone: "+91 54321 09876", college_name: "VIT Vellore", payment_status: "paid", receipt_number: "PP-RX9I0J", created_at: "2026-03-24T11:20:00Z" },
  { id: "demo-r6", event_id: "demo-evt-2", full_name: "Ananya Gupta", email: "ananya.g@email.com", phone: "+91 43210 98765", college_name: "IIIT Hyderabad", payment_status: "paid", receipt_number: "PP-RY1K2L", created_at: "2026-03-18T08:00:00Z" },
  { id: "demo-r7", event_id: "demo-evt-2", full_name: "Vikram Singh", email: "vikram.s@email.com", phone: "+91 32109 87654", college_name: "DTU Delhi", payment_status: "paid", receipt_number: "PP-RY3M4N", created_at: "2026-03-19T13:10:00Z" },
  { id: "demo-r8", event_id: "demo-evt-3", full_name: "Meera Joshi", email: "meera.j@email.com", phone: "+91 21098 76543", college_name: "CBIT Hyderabad", payment_status: "pending", receipt_number: "PP-RZ5O6P", created_at: "2026-03-25T15:30:00Z" },
];

const DEMO_CERTIFICATES: Array<Record<string, unknown>> = [
  { id: "demo-c1", certificate_id_display: "PP-2026-TF-00001", recipient_name: "Aarav Sharma", category: "winner", template_name: "Participation Blue & Gold", event_name: "TechFest 2026", status: "active", issued_at: "2026-03-25T12:00:00Z" },
  { id: "demo-c2", certificate_id_display: "PP-2026-TF-00002", recipient_name: "Priya Patel", category: "runner_up", template_name: "Participation Blue & Gold", event_name: "TechFest 2026", status: "active", issued_at: "2026-03-25T12:00:00Z" },
  { id: "demo-c3", certificate_id_display: "PP-2026-TF-00003", recipient_name: "Sneha Reddy", category: "participant", template_name: "Participation Blue & Gold", event_name: "TechFest 2026", status: "active", issued_at: "2026-03-25T12:00:00Z" },
];

function cloneLayout(layout?: CertificateTemplateLayout | null): CertificateTemplateLayout {
  return JSON.parse(JSON.stringify(layout || EMPTY_TEMPLATE_LAYOUT));
}

function createDefaultEditorState(): EditorState {
  return {
    name: "",
    signerName: "",
    signerTitle: "",
    signer2Name: "",
    signer2Title: "",
    assetType: undefined,
    assetDataUrl: undefined,
    assetName: undefined,
    signatureDataUrl: undefined,
    signature2DataUrl: undefined,
    layout: cloneLayout(EMPTY_TEMPLATE_LAYOUT),
  };
}

function createEditorStateFromTemplate(template: CertificateTemplate): EditorState {
  const cloneMode = template.source !== "custom";
  return {
    templateId: cloneMode ? undefined : template.id,
    name: cloneMode ? `${template.name} Custom` : template.name,
    signerName: template.signerName || "",
    signerTitle: template.signerTitle || "",
    signer2Name: template.signer2Name || "",
    signer2Title: template.signer2Title || "",
    assetType: template.assetType,
    assetDataUrl: template.assetDataUrl || template.pdfDataUrl,
    assetName: template.assetName || template.pdfName,
    signatureDataUrl: template.signatureDataUrl,
    signature2DataUrl: template.signature2DataUrl,
    layout: cloneLayout(template.layout),
  };
}

async function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });
}

async function readImageAspectRatio(dataUrl: string) {
  return new Promise<number | undefined>((resolve) => {
    const image = new Image();
    image.onload = () => {
      if (!image.naturalWidth || !image.naturalHeight) {
        resolve(undefined);
        return;
      }

      resolve(image.naturalWidth / image.naturalHeight);
    };
    image.onerror = () => resolve(undefined);
    image.src = dataUrl;
  });
}

function isErrorMessage(message: string) {
  return /error|not found|no |required|already/i.test(message);
}

function shouldShowPlacedFields(template?: CertificateTemplate | null) {
  return Boolean(template && hasAssetBackedTemplateSurface(template) && (template.layout?.placements?.length || 0) > 0);
}

function formatUtcDate(value: unknown, options: Intl.DateTimeFormatOptions) {
  const normalizedValue = typeof value === "string" ? value : "";
  if (!normalizedValue) return "—";

  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    ...options,
    timeZone: "UTC",
  }).format(date);
}

function buildTemplatePreviewValues(args: {
  template?: CertificateTemplate | null;
  registration?: Record<string, unknown> | null;
  event?: Record<string, unknown> | null;
  organizationName: string;
  certificateId: string;
}) {
  const { template, registration, event, organizationName, certificateId } = args;
  return buildCertificateValueMap({
    registration,
    event,
    organizationName,
    certificateId,
    issueDate: PREVIEW_ISSUE_DATE,
    verificationUrl: `https://proofpass.in/verify/${certificateId}`,
    signerName: template?.signerName,
    signerTitle: template?.signerTitle,
    signatureDataUrl: template?.signatureDataUrl,
    signer2Name: template?.signer2Name,
    signer2Title: template?.signer2Title,
    signature2DataUrl: template?.signature2DataUrl,
  });
}

export function CertificatesClient({
  events: realEvents,
  certificates: realCertificates,
  templates,
  registrations: realRegistrations,
  organizationName,
}: CertificatesClientProps) {
  const router = useRouter();
  const events = realEvents.length > 0 ? realEvents : DEMO_EVENTS;
  const certificates = realCertificates.length > 0 ? realCertificates : DEMO_CERTIFICATES;
  const registrations = realRegistrations.length > 0 ? realRegistrations : DEMO_REGISTRATIONS;
  const isDemo = realEvents.length === 0;

  const [certTab, setCertTab] = useState<CertTab>("events");
  const [selectedEventId, setSelectedEventId] = useState(String(events[0]?.id ?? ""));
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id ?? "");
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorState, setEditorState] = useState<EditorState>(createDefaultEditorState());
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [msg, setMsg] = useState("");
  const [eventsTabEventId, setEventsTabEventId] = useState(String(events[0]?.id ?? ""));

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? templates[0],
    [selectedTemplateId, templates],
  );

  const previewTemplate = useMemo(
    () => templates.find((template) => template.id === previewTemplateId) ?? null,
    [previewTemplateId, templates],
  );

  const filteredRegistrations = useMemo(
    () => registrations.filter((registration) => String(registration.event_id) === eventsTabEventId),
    [eventsTabEventId, registrations],
  );

  const selectedEvent = useMemo(
    () => events.find((event) => String(event.id) === selectedEventId) ?? events[0] ?? null,
    [events, selectedEventId],
  );

  const sampleRegistrationForSelectedEvent = useMemo(
    () => registrations.find((registration) => String(registration.event_id) === selectedEventId) ?? registrations[0] ?? null,
    [registrations, selectedEventId],
  );

  const selectedTemplatePreviewValues = useMemo(
    () =>
      buildTemplatePreviewValues({
        template: selectedTemplate,
        registration: sampleRegistrationForSelectedEvent,
        event: selectedEvent,
        organizationName,
        certificateId: "PP-2026-SAMPLE-00001",
      }),
    [organizationName, sampleRegistrationForSelectedEvent, selectedEvent, selectedTemplate],
  );

  const previewTemplateValues = useMemo(() => {
    if (!previewTemplate) return undefined;

    const previewRegistration =
      registrations.find((registration) => String(registration.event_id) === String(selectedEvent?.id ?? "")) ??
      registrations[0] ??
      null;
    const previewEvent =
      events.find((event) => String(event.id) === String(previewRegistration?.event_id ?? selectedEvent?.id ?? "")) ??
      selectedEvent ??
      events[0] ??
      null;

    return buildTemplatePreviewValues({
      template: previewTemplate,
      registration: previewRegistration,
      event: previewEvent,
      organizationName,
      certificateId: "PP-2026-PREVIEW-00001",
    });
  }, [events, organizationName, previewTemplate, registrations, selectedEvent]);

  const categoryColors: Record<string, string> = {
    winner: "badge-gold",
    runner_up: "badge-silver",
    participant: "badge-info",
  };

  const statusColors: Record<string, string> = {
    active: "badge-success",
    revoked: "badge-danger",
    draft: "badge-neutral",
  };

  const customTemplateNeedsSetup =
    selectedTemplate?.source === "custom" && (!selectedTemplate.layout?.placements || selectedTemplate.layout.placements.length === 0);

  function openCreateModal() {
    setEditorState(createDefaultEditorState());
    setEditorOpen(true);
  }

  function openEditModal(template: CertificateTemplate) {
    setEditorState(createEditorStateFromTemplate(template));
    setEditorOpen(true);
  }

  async function handleTemplateFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const assetType = file.type.startsWith("image/") ? "image" : "pdf";
      const aspectRatio = assetType === "image" ? await readImageAspectRatio(dataUrl) : undefined;

      setEditorState((current) => ({
        ...current,
        assetDataUrl: dataUrl,
        assetType,
        assetName: file.name,
        layout: aspectRatio
          ? {
              ...current.layout,
              aspectRatio,
            }
          : current.layout,
      }));
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Unable to preview the selected template file.");
    }
  }

  async function handleSignatureFileChange(slot: 1 | 2, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setEditorState((current) =>
        slot === 1
          ? {
              ...current,
              signatureDataUrl: dataUrl,
            }
          : {
              ...current,
              signature2DataUrl: dataUrl,
            },
      );
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Unable to preview the selected signature image.");
    }
  }

  async function handleSaveTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingTemplate(true);
    setMsg("");

    const result = await upsertCustomCertificateTemplateAction(new FormData(event.currentTarget));
    if (result?.error) {
      setMsg(result.error);
    } else {
      setEditorOpen(false);
      setMsg(editorState.templateId ? "Custom certificate template updated." : "Custom certificate template saved.");
      router.refresh();
    }

    setSavingTemplate(false);
  }

  async function handleIssue() {
    if (!selectedEventId || !selectedTemplateId) return;
    setLoading(true);
    setMsg("");

    const result = await issueCertificatesAction(selectedEventId, selectedTemplateId, sendEmail);
    if (result?.error) {
      setMsg(result.error);
    } else {
      setMsg(`Successfully generated ${result.count} certificate(s) in bulk.`);
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 className="text-2xl font-bold mb-2">Certificates</h1>
        <p style={{ color: "var(--muted-foreground)" }}>
          The uploaded participation PPT is now your default certificate base. Customize its placeholders and signatures, or upload your own PDF/image design.
        </p>
      </div>

      {isDemo ? (
        <div style={{ padding: "12px 18px", borderRadius: "12px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.1rem" }}>📋</span>
          <span style={{ fontSize: "0.875rem", color: "#f59e0b" }}>
            <strong>Demo data</strong> — These are sample entries. Create events and collect registrations to see your real data here.
          </span>
        </div>
      ) : null}

      <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.02)", borderRadius: "14px", padding: "4px", border: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { key: "events" as CertTab, label: "Events", icon: <CalendarDays size={16} /> },
          { key: "templates" as CertTab, label: "Templates & Bulk Issue", icon: <LayoutTemplate size={16} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCertTab(tab.key)}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.92rem",
              fontWeight: certTab === tab.key ? 600 : 500,
              color: certTab === tab.key ? "var(--foreground)" : "var(--muted-foreground)",
              background: certTab === tab.key ? "rgba(88,115,255,0.12)" : "transparent",
              transition: "all 0.2s ease",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {msg ? (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "10px",
            fontSize: "0.875rem",
            background: isErrorMessage(msg) ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
            color: isErrorMessage(msg) ? "var(--danger)" : "var(--success)",
          }}
        >
          {msg}
        </div>
      ) : null}

      {certTab === "events" ? (
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div className="inline-flex items-center gap-2" style={{ color: "var(--primary-soft)" }}>
              <CalendarDays size={18} />
              <span className="font-semibold">Registered Users by Event</span>
            </div>
            <div>
              <select value={eventsTabEventId} onChange={(event) => setEventsTabEventId(event.target.value)} className="input-field" style={{ minWidth: "240px" }}>
                <option value="">Select an event...</option>
                {events.map((event) => (
                  <option key={String(event.id)} value={String(event.id)}>
                    {String(event.name)} ({String(event.status)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {eventsTabEventId ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "20px" }}>
              <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(88,115,255,0.06)", border: "1px solid rgba(88,115,255,0.12)", textAlign: "center" }}>
                <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#5873ff" }}>{filteredRegistrations.length}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginTop: "4px" }}>Total Registered</p>
              </div>
              <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)", textAlign: "center" }}>
                <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#10b981" }}>{filteredRegistrations.filter((registration) => registration.payment_status === "paid").length}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginTop: "4px" }}>Paid</p>
              </div>
              <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)", textAlign: "center" }}>
                <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#f59e0b" }}>{filteredRegistrations.filter((registration) => registration.payment_status !== "paid").length}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginTop: "4px" }}>Pending</p>
              </div>
            </div>
          ) : null}

          {!eventsTabEventId ? (
            <div style={{ padding: "40px", textAlign: "center", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
              <CalendarDays size={36} style={{ margin: "0 auto 12px", color: "var(--primary-soft)" }} />
              <p style={{ color: "var(--muted-foreground)" }}>Select an event above to view registered users.</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
              <Users size={36} style={{ margin: "0 auto 12px", color: "var(--primary-soft)" }} />
              <p style={{ color: "var(--muted-foreground)" }}>No registrations for this event yet.</p>
            </div>
          ) : (
            <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <table className="schedule-table" style={{ width: "100%" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                    {["#", "Name", "Email", "Phone", "College/Org", "Payment", "Registered"].map((heading) => (
                      <th key={heading} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((registration, index) => (
                    <tr key={String(registration.id)} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "12px 16px", color: "var(--muted-foreground)", fontSize: "0.8rem" }}>{index + 1}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{String(registration.full_name || "—")}</td>
                      <td style={{ padding: "12px 16px", color: "var(--muted-foreground)" }}>{String(registration.email || "—")}</td>
                      <td style={{ padding: "12px 16px", color: "var(--muted-foreground)" }}>{String(registration.phone || "—")}</td>
                      <td style={{ padding: "12px 16px", color: "var(--muted-foreground)", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{String(registration.college_name || "—")}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span className={`badge ${registration.payment_status === "paid" ? "badge-success" : "badge-warning"}`}>{String(registration.payment_status || "pending")}</span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--muted-foreground)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {formatUtcDate(registration.created_at, { day: "numeric", month: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px", alignItems: "start" }}>
            <div className="glass-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div className="inline-flex items-center gap-2" style={{ color: "var(--primary-soft)" }}>
                  <LayoutTemplate size={18} />
                  <span className="font-semibold">Certificate Templates</span>
                </div>
                <button type="button" onClick={openCreateModal} className="btn-secondary" style={{ padding: "8px 12px", fontSize: "0.82rem" }}>
                  <Plus size={15} />
                  Add Template
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
                {templates.map((template) => {
                  const selected = selectedTemplateId === template.id;
                  const interactiveTemplate = shouldShowPlacedFields(template);
                  const templatePreviewValues = buildTemplatePreviewValues({
                    template,
                    registration: sampleRegistrationForSelectedEvent,
                    event: selectedEvent,
                    organizationName,
                    certificateId: "PP-2026-CARD-00001",
                  });

                  return (
                    <div
                      key={template.id}
                      style={{
                        padding: "12px",
                        background: selected ? "rgba(88,115,255,0.08)" : "rgba(255,255,255,0.02)",
                        border: selected ? "1px solid rgba(143,220,255,0.34)" : "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "18px",
                        minHeight: "286px",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <button type="button" onClick={() => setSelectedTemplateId(template.id)} style={{ display: "block", width: "100%", background: "transparent", border: "none", padding: 0, cursor: "pointer" }}>
                        <CertificateSurface
                          template={template}
                          values={interactiveTemplate ? templatePreviewValues : undefined}
                          compact
                          showPlacedFields={interactiveTemplate}
                          showTemplateMeta={!interactiveTemplate && template.source !== "custom"}
                        />
                      </button>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                        <div style={{ minWidth: 0 }}>
                          <div className="font-semibold" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{template.name}</div>
                          <div style={{ color: "var(--muted-foreground)", fontSize: "0.78rem", marginTop: "2px" }}>
                            {template.source === "custom"
                              ? `${template.layout?.placements?.length || 0} placed field(s)`
                              : interactiveTemplate
                                ? "Default PPT participation template"
                                : template.label}
                          </div>
                        </div>
                        {selected ? <CheckCircle2 size={18} color="#8fdcff" /> : null}
                      </div>
                      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                        <button type="button" onClick={() => setSelectedTemplateId(template.id)} className={selected ? "btn-primary" : "btn-secondary"} style={{ flex: 1, padding: "8px 12px", fontSize: "0.8rem" }}>
                          {selected ? "Selected" : "Select"}
                        </button>
                        <button type="button" onClick={() => setPreviewTemplateId(template.id)} className="btn-secondary" style={{ padding: "8px 12px", fontSize: "0.8rem" }}>
                          <Eye size={15} />
                          Preview
                        </button>
                      </div>
                      {(template.source === "custom" || interactiveTemplate) ? (
                        <button
                          type="button"
                          onClick={() => openEditModal(template)}
                          style={{ marginTop: "10px", background: "transparent", border: "none", color: "var(--primary-soft)", padding: 0, fontSize: "0.78rem", cursor: "pointer", alignSelf: "flex-start" }}
                        >
                          {template.source === "custom" ? "Edit layout & placeholders" : "Customize & save copy"}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card" style={{ padding: "24px" }}>
              <h2 className="font-bold mb-4">Bulk Generate Certificates</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Select Event</label>
                  <select value={selectedEventId} onChange={(event) => setSelectedEventId(event.target.value)} className="input-field">
                    <option value="">Choose an event...</option>
                    {events.map((event) => (
                      <option key={String(event.id)} value={String(event.id)}>
                        {String(event.name)} ({String(event.status)})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTemplate ? (
                  <div style={{ padding: "14px", borderRadius: "18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "10px" }}>
                      Selected Template Preview
                    </div>
                    <CertificateSurface
                      template={selectedTemplate}
                      values={selectedTemplatePreviewValues}
                      compact
                      showPlacedFields={shouldShowPlacedFields(selectedTemplate)}
                      showTemplateMeta={!shouldShowPlacedFields(selectedTemplate) && selectedTemplate.source !== "custom"}
                    />
                    {(selectedTemplate.source === "custom" || shouldShowPlacedFields(selectedTemplate)) ? (
                      <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", fontSize: "0.8rem" }}>
                        <span style={{ color: "var(--muted-foreground)" }}>
                          {selectedTemplate.layout?.placements?.length || 0} mapped field(s) will be filled using each registered user.
                        </span>
                        <button type="button" onClick={() => openEditModal(selectedTemplate)} className="btn-secondary" style={{ padding: "6px 10px", fontSize: "0.76rem" }}>
                          {selectedTemplate.source === "custom" ? "Edit Mapping" : "Customize Copy"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {customTemplateNeedsSetup ? (
                  <div style={{ padding: "12px 14px", borderRadius: "12px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b", fontSize: "0.84rem" }}>
                    This custom template does not have any placed fields yet. Open the template editor, place the registered-user fields, and then bulk issue certificates.
                  </div>
                ) : null}

                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                  <input type="checkbox" checked={sendEmail} onChange={(event) => setSendEmail(event.target.checked)} />
                  Send issued certificates by email when recipient email is available
                </label>

                <button onClick={handleIssue} className="btn-primary" disabled={!selectedEventId || !selectedTemplateId || loading || customTemplateNeedsSetup}>
                  <span className="inline-flex items-center gap-2">
                    <Trophy size={16} />
                    {loading ? "Generating..." : "Generate Bulk Certificates"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "980px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Certificate ID", "Recipient", "Category", "Template", "Event", "Status", "Issued", "View"].map((heading) => (
                    <th key={heading} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {certificates.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "var(--muted-foreground)" }}>
                      No certificates issued yet.
                    </td>
                  </tr>
                ) : (
                  certificates.map((certificate) => (
                    <tr key={String(certificate.id)} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <code style={{ fontSize: "0.85rem", color: "var(--primary-soft)" }}>{String(certificate.certificate_id_display || "—")}</code>
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 500 }}>{String(certificate.recipient_name || "—")}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span className={`badge ${categoryColors[String(certificate.category || "participant")] || "badge-info"}`}>{String(certificate.category || "participant").replace("_", " ")}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "0.84rem", color: "var(--foreground)" }}>{String(certificate.template_name || "—")}</td>
                      <td style={{ padding: "12px 16px", fontSize: "0.84rem", color: "var(--muted-foreground)" }}>{String(certificate.event_name || "—")}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span className={`badge ${statusColors[String(certificate.status || "active")] || "badge-neutral"}`}>{String(certificate.status || "active")}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                        {formatUtcDate(certificate.issued_at, { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Link href={`/dashboard/certificates/${String(certificate.id)}`} className="btn-secondary" style={{ padding: "6px 10px", fontSize: "0.78rem" }}>
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {previewTemplate ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(3, 8, 20, 0.74)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 80, padding: "24px" }} onClick={() => setPreviewTemplateId(null)}>
          <div className="glass-card" style={{ width: "min(1120px, 100%)", padding: "22px", position: "relative" }} onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setPreviewTemplateId(null)} style={{ position: "absolute", top: "18px", right: "18px", width: "36px", height: "36px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "var(--foreground)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={18} />
            </button>
            <div style={{ marginBottom: "14px" }}>
              <h2 className="text-xl font-bold" style={{ marginBottom: "4px" }}>{previewTemplate.name}</h2>
              <p style={{ color: "var(--muted-foreground)", margin: 0 }}>
                {previewTemplate.source === "custom" ? "Interactive custom template preview" : previewTemplate.label}
              </p>
            </div>
            <CertificateSurface
              template={previewTemplate}
              values={previewTemplateValues}
              showPlacedFields={shouldShowPlacedFields(previewTemplate)}
              showTemplateMeta={!shouldShowPlacedFields(previewTemplate) && previewTemplate.source !== "custom"}
            />
          </div>
        </div>
      ) : null}

      {editorOpen ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(3, 8, 20, 0.74)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 90, padding: "24px" }} onClick={() => setEditorOpen(false)}>
          <div className="glass-card" style={{ width: "min(1280px, 100%)", maxHeight: "92vh", overflow: "auto", padding: "24px" }} onClick={(event) => event.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 className="text-xl font-bold" style={{ marginBottom: "4px" }}>{editorState.templateId ? "Edit Certificate Template" : editorState.assetDataUrl ? "Customize Participation Template" : "Add Certificate Template"}</h2>
                <p style={{ color: "var(--muted-foreground)", margin: 0 }}>
                  {editorState.templateId
                    ? "Update your saved template, field mapping, and signatories."
                    : editorState.assetDataUrl
                      ? "This starts from the uploaded PPT participation design. Saving will create your own editable copy."
                      : "Upload your certificate design, then click on the preview to place placeholders mapped from registered users."}
                </p>
              </div>
              <button type="button" onClick={() => setEditorOpen(false)} style={{ width: "36px", height: "36px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "var(--foreground)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate}>
              {editorState.templateId ? <input type="hidden" name="templateId" value={editorState.templateId} /> : null}
              <input type="hidden" name="layoutJson" value={JSON.stringify(editorState.layout)} />
              <input type="hidden" name="assetDataUrl" value={editorState.assetDataUrl || ""} />
              <input type="hidden" name="assetType" value={editorState.assetType || ""} />
              <input type="hidden" name="assetName" value={editorState.assetName || ""} />
              <input type="hidden" name="signatureDataUrl" value={editorState.signatureDataUrl || ""} />
              <input type="hidden" name="signature2DataUrl" value={editorState.signature2DataUrl || ""} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "18px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Template Name</label>
                  <input name="name" className="input-field" value={editorState.name} onChange={(event) => setEditorState((current) => ({ ...current, name: event.target.value }))} placeholder="Annual Excellence Certificate" />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Template File (PDF, PNG, JPG)</label>
                  <input name="templateFile" type="file" accept="application/pdf,image/png,image/jpeg,image/webp" className="input-field" style={{ padding: "10px 12px" }} onChange={handleTemplateFileChange} />
                  <p style={{ marginTop: "6px", marginBottom: 0, fontSize: "0.76rem", color: "var(--muted-foreground)" }}>
                    {editorState.assetName ? `Using: ${editorState.assetName}` : "You can keep the current design or upload a new file."}
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px", marginBottom: "18px" }}>
                {[
                  {
                    slot: 1 as const,
                    title: "Signatory 1",
                    nameValue: editorState.signerName,
                    titleValue: editorState.signerTitle,
                    signatureValue: editorState.signatureDataUrl,
                    nameField: "signerName",
                    titleField: "signerTitle",
                  },
                  {
                    slot: 2 as const,
                    title: "Signatory 2",
                    nameValue: editorState.signer2Name,
                    titleValue: editorState.signer2Title,
                    signatureValue: editorState.signature2DataUrl,
                    nameField: "signer2Name",
                    titleField: "signer2Title",
                  },
                ].map((signatory) => (
                  <div key={signatory.slot} style={{ padding: "14px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "10px", fontWeight: 600 }}>
                      {signatory.title}
                    </div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", color: "var(--muted-foreground)" }}>Name</label>
                        <input
                          name={signatory.nameField}
                          className="input-field"
                          value={signatory.nameValue}
                          onChange={(event) =>
                            setEditorState((current) =>
                              signatory.slot === 1
                                ? { ...current, signerName: event.target.value }
                                : { ...current, signer2Name: event.target.value },
                            )
                          }
                          placeholder={signatory.slot === 1 ? "Brigita Tsamara" : "Donna Stroupe"}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", color: "var(--muted-foreground)" }}>Title</label>
                        <input
                          name={signatory.titleField}
                          className="input-field"
                          value={signatory.titleValue}
                          onChange={(event) =>
                            setEditorState((current) =>
                              signatory.slot === 1
                                ? { ...current, signerTitle: event.target.value }
                                : { ...current, signer2Title: event.target.value },
                            )
                          }
                          placeholder={signatory.slot === 1 ? "Chairman" : "Representative"}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "6px", fontSize: "0.82rem", color: "var(--muted-foreground)" }}>Signature Image</label>
                        <input
                          name={signatory.slot === 1 ? "signatureFile" : "signatureFile2"}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="input-field"
                          style={{ padding: "10px 12px" }}
                          onChange={(event) => handleSignatureFileChange(signatory.slot, event)}
                        />
                      </div>
                      {signatory.signatureValue ? (
                        <div style={{ minHeight: "58px", padding: "8px 10px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img src={signatory.signatureValue} alt={`${signatory.title} preview`} style={{ maxHeight: "42px", maxWidth: "100%", objectFit: "contain" }} />
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <TemplateDesigner
                layout={editorState.layout}
                onChange={(layout) => setEditorState((current) => ({ ...current, layout }))}
                assetDataUrl={editorState.assetDataUrl}
                assetType={editorState.assetType === "built_in" ? undefined : editorState.assetType}
                assetName={editorState.assetName}
                templateName={editorState.name}
                signerName={editorState.signerName}
                signerTitle={editorState.signerTitle}
                signatureDataUrl={editorState.signatureDataUrl}
                signer2Name={editorState.signer2Name}
                signer2Title={editorState.signer2Title}
                signature2DataUrl={editorState.signature2DataUrl}
                registrations={registrations}
                events={events}
                organizationName={organizationName}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button type="button" className="btn-secondary" onClick={() => setEditorOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={savingTemplate}>
                  {editorState.templateId ? <Save size={16} /> : <Upload size={16} />}
                  {savingTemplate ? "Saving..." : editorState.templateId ? "Save Template" : "Save Custom Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
