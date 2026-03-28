"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Eye, CalendarDays, LayoutTemplate, Plus, Save, Trophy, Upload, Users, X } from "lucide-react";
import type { CertificateTemplate } from "@/lib/certificates/templates";
import { issueCertificatesAction, upsertCustomCertificateTemplateAction } from "./actions";

interface CertificatesClientProps {
  events: Array<Record<string, unknown>>;
  certificates: Array<Record<string, unknown>>;
  templates: CertificateTemplate[];
  registrations: Array<Record<string, unknown>>;
}

function TemplateArtwork({
  template,
  compact = false,
}: {
  template: CertificateTemplate;
  compact?: boolean;
}) {
  if (template.source === "custom") {
    return (
      <div
        style={{
          height: compact ? "142px" : "420px",
          width: "100%",
          borderRadius: compact ? "16px" : "26px",
          overflow: "hidden",
          background: template.paper,
          border: `1px solid ${template.frame}`,
          position: "relative",
        }}
      >
        {template.pdfDataUrl ? (
          <iframe
            src={template.pdfDataUrl}
            title={template.name}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              pointerEvents: "none",
              transform: compact ? "scale(1.02)" : "none",
              transformOrigin: "center top",
              background: "white",
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            left: compact ? "8px" : "16px",
            right: compact ? "8px" : "16px",
            bottom: compact ? "8px" : "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
            background: "rgba(6,12,24,0.72)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: compact ? "10px" : "14px",
            padding: compact ? "6px 8px" : "10px 12px",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: compact ? "0.68rem" : "0.86rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{template.name}</div>
            <div style={{ color: "var(--muted-foreground)", fontSize: compact ? "0.58rem" : "0.74rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {template.pdfName || "Uploaded PDF"}
            </div>
          </div>
          <span className="badge badge-info" style={{ flexShrink: 0, fontSize: compact ? "0.54rem" : undefined, padding: compact ? "4px 7px" : undefined }}>Custom PDF</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: compact ? "142px" : "420px",
        width: "100%",
        borderRadius: compact ? "16px" : "26px",
        position: "relative",
        overflow: "hidden",
        background: template.paper,
        border: `1px solid ${template.frame}`,
        boxShadow: compact ? "0 16px 44px rgba(5, 10, 24, 0.24)" : "0 28px 90px rgba(5, 10, 24, 0.36)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: compact ? "10px" : "18px",
          borderRadius: compact ? "12px" : "22px",
          border: `1px solid ${template.frame}`,
          background:
            "radial-gradient(circle at top left, rgba(255,255,255,0.08), transparent 28%), radial-gradient(circle at bottom right, rgba(255,255,255,0.05), transparent 24%)",
          padding: compact ? "12px" : "30px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: compact ? "8px" : "14px" }}>
          <div>
            <div style={{ color: template.badge, fontSize: compact ? "0.48rem" : "0.8rem", letterSpacing: compact ? "0.12em" : "0.18em", textTransform: "uppercase", marginBottom: compact ? "5px" : "12px" }}>
              ProofPass Credential
            </div>
            <div style={{ color: template.badge, fontSize: compact ? "0.46rem" : "0.76rem", letterSpacing: compact ? "0.08em" : "0.12em", textTransform: "uppercase", padding: compact ? "3px 6px" : "6px 12px", borderRadius: "999px", border: `1px solid ${template.frame}`, display: "inline-flex" }}>
              {template.label}
            </div>
          </div>
          <div
            style={{
              width: compact ? "28px" : "54px",
              height: compact ? "28px" : "54px",
              borderRadius: compact ? "9px" : "16px",
              background: template.accent,
              opacity: 0.95,
              boxShadow: "0 12px 34px rgba(0,0,0,0.24)",
            }}
          />
        </div>

        <div style={{ textAlign: "center", padding: compact ? "0 4px" : "0 16px", minHeight: compact ? "40px" : "auto", display: "flex", flexDirection: "column", justifyContent: "center", gap: compact ? "5px" : 0 }}>
          <div style={{ color: template.ink, fontSize: compact ? "0.48rem" : "1rem", letterSpacing: compact ? "0.08em" : "0.14em", textTransform: "uppercase", opacity: 0.72, marginBottom: compact ? "0" : "16px" }}>
            Certificate of Achievement
          </div>
          <div style={{ color: template.ink, fontSize: compact ? "0.64rem" : "3.15rem", fontWeight: 700, letterSpacing: compact ? "-0.02em" : "-0.04em", lineHeight: compact ? 1.05 : 1.02, marginBottom: compact ? "0" : "18px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {template.sampleRecipient}
          </div>
          <div style={{ width: compact ? "42px" : "136px", height: compact ? "2px" : "4px", margin: "0 auto", borderRadius: "999px", background: template.accent, marginBottom: compact ? "0" : "18px" }} />
          {!compact ? (
            <div style={{ color: template.ink, fontSize: "1rem", opacity: 0.84, whiteSpace: "normal", overflow: "hidden", textOverflow: "ellipsis" }}>
              {template.sampleAchievement}
            </div>
          ) : null}
        </div>

        {compact ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
            <div style={{ color: template.ink, opacity: 0.72, fontSize: "0.48rem", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {template.sampleAchievement}
            </div>
            <div style={{ color: template.ink, opacity: 0.52, fontSize: "0.42rem", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>
              ProofPass
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "12px" }}>
            <div>
              <div style={{ width: "112px", height: "2px", background: template.frame, marginBottom: "8px" }} />
              <div style={{ color: template.ink, opacity: 0.72, fontSize: "0.78rem" }}>Organizer Signature</div>
            </div>
            <div style={{ color: template.ink, opacity: 0.66, fontSize: "0.76rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Verify with ProofPass
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type EditorState = {
  templateId?: string;
  name: string;
  signerName: string;
  signerTitle: string;
  placeholderRecipientName: string;
  placeholderAchievement: string;
  placeholderEventName: string;
  placeholderOrganizationName: string;
  placeholderCertificateId: string;
  placeholderIssueDate: string;
};

const DEFAULT_EDITOR_STATE: EditorState = {
  name: "",
  signerName: "",
  signerTitle: "",
  placeholderRecipientName: "{{recipient_name}}",
  placeholderAchievement: "{{achievement}}",
  placeholderEventName: "{{event_name}}",
  placeholderOrganizationName: "{{organization_name}}",
  placeholderCertificateId: "{{certificate_id}}",
  placeholderIssueDate: "{{issue_date}}",
};

type CertTab = "events" | "templates";

// ── Demo / dummy data shown when organizer has no real data ──
const DEMO_EVENTS: Array<Record<string, unknown>> = [
  { id: "demo-evt-1", name: "TechFest 2026", status: "active" },
  { id: "demo-evt-2", name: "Code Sprint Championship", status: "completed" },
  { id: "demo-evt-3", name: "AI/ML Workshop", status: "published" },
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
  { id: "demo-c1", certificate_id_display: "PP-2026-TF-00001", recipient_name: "Aarav Sharma", category: "winner", template_name: "Midnight Grid", event_name: "TechFest 2026", status: "active", issued_at: "2026-03-25T12:00:00Z" },
  { id: "demo-c2", certificate_id_display: "PP-2026-TF-00002", recipient_name: "Priya Patel", category: "runner_up", template_name: "Midnight Grid", event_name: "TechFest 2026", status: "active", issued_at: "2026-03-25T12:00:00Z" },
  { id: "demo-c3", certificate_id_display: "PP-2026-TF-00003", recipient_name: "Sneha Reddy", category: "participant", template_name: "Royal Crest", event_name: "TechFest 2026", status: "active", issued_at: "2026-03-25T12:00:00Z" },
  { id: "demo-c4", certificate_id_display: "PP-2026-CS-00001", recipient_name: "Ananya Gupta", category: "winner", template_name: "Emerald Night", event_name: "Code Sprint Championship", status: "active", issued_at: "2026-03-22T10:00:00Z" },
  { id: "demo-c5", certificate_id_display: "PP-2026-CS-00002", recipient_name: "Vikram Singh", category: "participant", template_name: "Emerald Night", event_name: "Code Sprint Championship", status: "active", issued_at: "2026-03-22T10:00:00Z" },
];

export function CertificatesClient({ events: realEvents, certificates: realCertificates, templates, registrations: realRegistrations }: CertificatesClientProps) {
  // Use demo data when no real data exists
  const events = realEvents.length > 0 ? realEvents : DEMO_EVENTS;
  const certificates = realCertificates.length > 0 ? realCertificates : DEMO_CERTIFICATES;
  const registrations = realRegistrations.length > 0 ? realRegistrations : DEMO_REGISTRATIONS;
  const isDemo = realEvents.length === 0;

  const [certTab, setCertTab] = useState<CertTab>("events");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id ?? "");
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorState, setEditorState] = useState<EditorState>(DEFAULT_EDITOR_STATE);
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [msg, setMsg] = useState("");

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? templates[0],
    [selectedTemplateId, templates],
  );

  const previewTemplate = useMemo(
    () => templates.find((template) => template.id === previewTemplateId) ?? null,
    [previewTemplateId, templates],
  );

  // Get registrations for the selected event in the Events tab
  const [eventsTabEventId, setEventsTabEventId] = useState(events[0]?.id as string || "");
  const filteredRegistrations = useMemo(
    () => registrations.filter((r) => r.event_id === eventsTabEventId),
    [eventsTabEventId, registrations],
  );

  function openCreateModal() {
    setEditorState(DEFAULT_EDITOR_STATE);
    setEditorOpen(true);
  }

  function openEditModal(template: CertificateTemplate) {
    setEditorState({
      templateId: template.id,
      name: template.name,
      signerName: template.signerName || "",
      signerTitle: template.signerTitle || "",
      placeholderRecipientName: template.placeholders?.recipientName || "{{recipient_name}}",
      placeholderAchievement: template.placeholders?.achievement || "{{achievement}}",
      placeholderEventName: template.placeholders?.eventName || "{{event_name}}",
      placeholderOrganizationName: template.placeholders?.organizationName || "{{organization_name}}",
      placeholderCertificateId: template.placeholders?.certificateId || "{{certificate_id}}",
      placeholderIssueDate: template.placeholders?.issueDate || "{{issue_date}}",
    });
    setEditorOpen(true);
  }

  async function handleSaveTemplate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingTemplate(true);
    setMsg("");
    const result = await upsertCustomCertificateTemplateAction(new FormData(event.currentTarget));
    if (result?.error) {
      setMsg(result.error);
    } else {
      setEditorOpen(false);
      setMsg("Custom template saved.");
    }
    setSavingTemplate(false);
  }

  async function handleIssue() {
    if (!selectedEventId || !selectedTemplateId) return;
    setLoading(true);
    setMsg("");
    const result = await issueCertificatesAction(selectedEventId, selectedTemplateId, sendEmail);
    if (result?.error) setMsg(result.error);
    else setMsg(`Successfully issued ${result.count} certificate(s)!`);
    setLoading(false);
  }

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 className="text-2xl font-bold mb-2">Certificates</h1>
        <p style={{ color: "var(--muted-foreground)" }}>Manage events, pick templates, and issue verified certificates.</p>
      </div>

      {isDemo && (
        <div style={{ padding: "12px 18px", borderRadius: "12px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.1rem" }}>📋</span>
          <span style={{ fontSize: "0.875rem", color: "#f59e0b" }}>
            <strong>Demo data</strong> — These are sample entries. Create events and register participants to see your real data here.
          </span>
        </div>
      )}

      {/* ── Tab Navigation ── */}
      <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.02)", borderRadius: "14px", padding: "4px", border: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { key: "events" as CertTab, label: "Events", icon: <CalendarDays size={16} /> },
          { key: "templates" as CertTab, label: "Templates", icon: <LayoutTemplate size={16} /> },
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
        <div style={{ padding: "10px 14px", borderRadius: "10px", fontSize: "0.875rem", background: msg.includes("error") || msg.includes("Error") || msg.includes("No ") || msg.includes("not found") ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", color: msg.includes("error") || msg.includes("Error") || msg.includes("No ") || msg.includes("not found") ? "var(--danger)" : "var(--success)" }}>
          {msg}
        </div>
      ) : null}

      {/* ══════════════════ EVENTS TAB ══════════════════ */}
      {certTab === "events" && (
        <>
          <div className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div className="inline-flex items-center gap-2" style={{ color: "var(--primary-soft)" }}>
                <CalendarDays size={18} />
                <span className="font-semibold">Your Events</span>
              </div>
              <div>
                <select
                  value={eventsTabEventId}
                  onChange={(e) => setEventsTabEventId(e.target.value)}
                  className="input-field"
                  style={{ minWidth: "240px" }}
                >
                  <option value="">Select an event...</option>
                  {events.map((ev) => (
                    <option key={ev.id as string} value={ev.id as string}>
                      {ev.name as string} ({ev.status as string})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Registration Stats */}
            {eventsTabEventId && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "20px" }}>
                <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(88,115,255,0.06)", border: "1px solid rgba(88,115,255,0.12)", textAlign: "center" }}>
                  <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#5873ff" }}>{filteredRegistrations.length}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginTop: "4px" }}>Total Registered</p>
                </div>
                <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)", textAlign: "center" }}>
                  <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#10b981" }}>{filteredRegistrations.filter((r) => r.payment_status === "paid").length}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginTop: "4px" }}>Paid</p>
                </div>
                <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)", textAlign: "center" }}>
                  <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#f59e0b" }}>{filteredRegistrations.filter((r) => r.payment_status !== "paid").length}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginTop: "4px" }}>Pending</p>
                </div>
              </div>
            )}

            {/* Registrations Table */}
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
                      {["#", "Name", "Email", "Phone", "College/Org", "Payment", "Registered"].map((h) => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* eslint-disable @typescript-eslint/no-explicit-any */}
                    {filteredRegistrations.map((reg: any, idx: number) => (
                      <tr key={reg.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "12px 16px", color: "var(--muted-foreground)", fontSize: "0.8rem" }}>{idx + 1}</td>
                        <td style={{ padding: "12px 16px", fontWeight: 600 }}>{reg.full_name}</td>
                        <td style={{ padding: "12px 16px", color: "var(--muted-foreground)" }}>{reg.email || "—"}</td>
                        <td style={{ padding: "12px 16px", color: "var(--muted-foreground)" }}>{reg.phone || "—"}</td>
                        <td style={{ padding: "12px 16px", color: "var(--muted-foreground)", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{reg.college_name || "—"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span className={`badge ${reg.payment_status === "paid" ? "badge-success" : "badge-warning"}`}>{reg.payment_status}</span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "var(--muted-foreground)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                          {reg.created_at ? new Date(reg.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ══════════════════ TEMPLATES TAB ══════════════════ */}
      {certTab === "templates" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "24px", alignItems: "start" }}>
            <div className="glass-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div className="inline-flex items-center gap-2" style={{ color: "var(--primary-soft)" }}>
                  <LayoutTemplate size={18} />
                  <span className="font-semibold">Certificate Templates</span>
                </div>
                <button type="button" onClick={openCreateModal} className="btn-secondary" style={{ padding: "8px 12px", fontSize: "0.82rem" }}>
                  <Plus size={15} />
                  Add PDF Template
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px" }}>
                {templates.map((template) => {
                  const selected = selectedTemplateId === template.id;
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
                      <button
                        type="button"
                        onClick={() => setSelectedTemplateId(template.id)}
                        style={{ display: "block", width: "100%", background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
                      >
                        <TemplateArtwork template={template} compact />
                      </button>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                        <div style={{ minWidth: 0 }}>
                          <div className="font-semibold" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{template.name}</div>
                          <div style={{ color: "var(--muted-foreground)", fontSize: "0.78rem", marginTop: "2px" }}>{template.label}</div>
                        </div>
                        {selected ? <CheckCircle2 size={18} color="#8fdcff" /> : null}
                      </div>
                      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedTemplateId(template.id)}
                          className={selected ? "btn-primary" : "btn-secondary"}
                          style={{ flex: 1, padding: "8px 12px", fontSize: "0.8rem" }}
                        >
                          {selected ? "Selected" : "Select"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewTemplateId(template.id)}
                          className="btn-secondary"
                          style={{ padding: "8px 12px", fontSize: "0.8rem" }}
                        >
                          <Eye size={15} />
                          Preview
                        </button>
                      </div>
                      {template.source === "custom" ? (
                        <button
                          type="button"
                          onClick={() => openEditModal(template)}
                          style={{ marginTop: "10px", background: "transparent", border: "none", color: "var(--primary-soft)", padding: 0, fontSize: "0.78rem", cursor: "pointer", alignSelf: "flex-start" }}
                        >
                          Edit placeholders
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card" style={{ padding: "24px" }}>
              <h2 className="font-bold mb-4">Issue Certificates</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Select Event</label>
                  <select
                    value={selectedEventId}
                    onChange={(event) => setSelectedEventId(event.target.value)}
                    className="input-field"
                  >
                    <option value="">Choose an event...</option>
                    {events.map((event) => (
                      <option key={event.id as string} value={event.id as string}>
                        {event.name as string} ({event.status as string})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ padding: "14px", borderRadius: "18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", marginBottom: "10px" }}>
                    Selected Template
                  </div>
                  <TemplateArtwork template={selectedTemplate} compact />
                  {selectedTemplate.source === "custom" && selectedTemplate.placeholders ? (
                    <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {[
                        selectedTemplate.placeholders.recipientName,
                        selectedTemplate.placeholders.achievement,
                        selectedTemplate.placeholders.eventName,
                        selectedTemplate.placeholders.organizationName,
                        selectedTemplate.placeholders.certificateId,
                        selectedTemplate.placeholders.issueDate,
                      ].map((token) => (
                        <span key={token} className="badge badge-neutral" style={{ textTransform: "none", letterSpacing: 0 }}>{token}</span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                  <input type="checkbox" checked={sendEmail} onChange={(event) => setSendEmail(event.target.checked)} />
                  Send issued certificates by email when recipient email is available
                </label>

                <button onClick={handleIssue} className="btn-primary" disabled={!selectedEventId || !selectedTemplateId || loading}>
                  <span className="inline-flex items-center gap-2">
                    <Trophy size={16} />
                    {loading ? "Issuing..." : "Issue Certificates"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "880px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Certificate ID", "Recipient", "Category", "Template", "Event", "Status", "Issued"].map((heading) => (
                    <th key={heading} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {certificates.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--muted-foreground)" }}>
                      No certificates issued yet.
                    </td>
                  </tr>
                ) : (
                  certificates.map((cert) => (
                    <tr key={cert.id as string} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <code style={{ fontSize: "0.85rem", color: "var(--primary-soft)" }}>{cert.certificate_id_display as string}</code>
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 500 }}>{cert.recipient_name as string}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span className={`badge ${categoryColors[cert.category as string] || "badge-info"}`}>
                          {(cert.category as string)?.replace("_", " ")}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "0.84rem", color: "var(--foreground)" }}>
                        {(cert.template_name as string) || "Midnight Grid"}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>{(cert as Record<string, unknown>).event_name as string || "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span className={`badge ${statusColors[cert.status as string] || "badge-neutral"}`}>{cert.status as string}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                        {cert.issued_at ? new Date(cert.issued_at as string).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Preview Modal ── */}
      {previewTemplate ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(3, 8, 20, 0.74)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 80,
            padding: "24px",
          }}
          onClick={() => setPreviewTemplateId(null)}
        >
          <div
            className="glass-card"
            style={{ width: "min(1120px, 100%)", padding: "22px", position: "relative" }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewTemplateId(null)}
              style={{ position: "absolute", top: "18px", right: "18px", width: "36px", height: "36px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "var(--foreground)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <X size={18} />
            </button>
            <div style={{ marginBottom: "14px" }}>
              <h2 className="text-xl font-bold" style={{ marginBottom: "4px" }}>{previewTemplate.name}</h2>
              <p style={{ color: "var(--muted-foreground)", margin: 0 }}>{previewTemplate.source === "custom" ? "Uploaded PDF template preview" : previewTemplate.label}</p>
            </div>
            <TemplateArtwork template={previewTemplate} />
          </div>
        </div>
      ) : null}

      {/* ── Editor Modal ── */}
      {editorOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(3, 8, 20, 0.74)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 90,
            padding: "24px",
          }}
          onClick={() => setEditorOpen(false)}
        >
          <div
            className="glass-card"
            style={{ width: "min(1040px, 100%)", padding: "24px" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 className="text-xl font-bold" style={{ marginBottom: "4px" }}>{editorState.templateId ? "Edit Custom PDF Template" : "Add Custom PDF Template"}</h2>
                <p style={{ color: "var(--muted-foreground)", margin: 0 }}>
                  Upload the certificate PDF, add signature art, and define the placeholder tokens you want to replace later.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                style={{ width: "36px", height: "36px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "var(--foreground)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate}>
              {editorState.templateId ? <input type="hidden" name="templateId" value={editorState.templateId} /> : null}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Template Name</label>
                    <input name="name" className="input-field" value={editorState.name} onChange={(event) => setEditorState((current) => ({ ...current, name: event.target.value }))} placeholder="Luxury Gold Appreciation" />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Certificate PDF</label>
                    <input name="pdfFile" type="file" accept="application/pdf" className="input-field" style={{ padding: "10px 12px" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Signature Image</label>
                    <input name="signatureFile" type="file" accept="image/png,image/jpeg,image/webp" className="input-field" style={{ padding: "10px 12px" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Signer Name</label>
                      <input name="signerName" className="input-field" value={editorState.signerName} onChange={(event) => setEditorState((current) => ({ ...current, signerName: event.target.value }))} placeholder="Pilla Usha Rani" />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Signer Title</label>
                      <input name="signerTitle" className="input-field" value={editorState.signerTitle} onChange={(event) => setEditorState((current) => ({ ...current, signerTitle: event.target.value }))} placeholder="Founder" />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ fontSize: "0.84rem", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                    Use the same placeholder tokens inside your PDF design. Later, the system can replace them with participant and event values when the certificate is rendered.
                  </div>
                  {[
                    ["placeholderRecipientName", "Recipient name", editorState.placeholderRecipientName],
                    ["placeholderAchievement", "Achievement", editorState.placeholderAchievement],
                    ["placeholderEventName", "Event name", editorState.placeholderEventName],
                    ["placeholderOrganizationName", "Organization name", editorState.placeholderOrganizationName],
                    ["placeholderCertificateId", "Certificate ID", editorState.placeholderCertificateId],
                    ["placeholderIssueDate", "Issue date", editorState.placeholderIssueDate],
                  ].map(([field, label, value]) => (
                    <div key={field}>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>{label}</label>
                      <input
                        name={field}
                        className="input-field"
                        value={String(value)}
                        onChange={(event) => setEditorState((current) => ({ ...current, [field]: event.target.value } as EditorState))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button type="button" className="btn-secondary" onClick={() => setEditorOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={savingTemplate}>
                  {editorState.templateId ? <Save size={16} /> : <Upload size={16} />}
                  {savingTemplate ? "Saving..." : editorState.templateId ? "Save Template" : "Upload Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
