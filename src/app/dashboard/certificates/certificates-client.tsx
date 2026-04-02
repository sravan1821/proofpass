"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Award,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  LayoutTemplate,
  Mail,
  MapPin,
  Medal,
  Pencil,
  Plus,
  Save,
  Send,
  Tag,
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
import {
  issueCertificatesAction,
  issueCertificatesByCategoryAction,
  sendIssuedCertificatesAction,
  upsertCustomCertificateTemplateAction,
} from "./actions";
import { checkInParticipantAction, checkOutParticipantAction, bulkCheckInAction, updateRegistrationDetailsAction } from "@/app/dashboard/events/actions";
import { saveOrganizerSmtpSettingsAction, testOrganizerSmtpSettingsAction } from "@/app/dashboard/settings/actions";
import { TemplateDesigner } from "./template-designer";

interface CertificatesClientProps {
  events: Array<Record<string, unknown>>;
  certificates: Array<Record<string, unknown>>;
  templates: CertificateTemplate[];
  registrations: Array<Record<string, unknown>>;
  organizationName: string;
  smtpProfile: Record<string, unknown> | null;
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

type PendingMailIntent =
  | { kind: "bulk-generate" }
  | { kind: "role-based-generate" }
  | { kind: "send-certificates"; certificateIds: string[] };

type PendingRegenerateIntent =
  | { kind: "bulk-generate"; existingCount: number }
  | { kind: "role-based-generate"; existingCount: number };

type SmtpFormState = {
  enabled: boolean;
  secure: boolean;
  host: string;
  port: string;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  sendRegistrationEmails: boolean;
  sendCertificateEmails: boolean;
};

const BULK_SEND_EMAIL_PREFERENCE_KEY = "proofpass:bulk-send-certificates";
const ROLE_SEND_EMAIL_PREFERENCE_KEY = "proofpass:role-send-certificates";

function readSendEmailPreference(storageKey: string, fallback = false) {
  if (typeof window === "undefined") return fallback;

  const storedValue = window.localStorage.getItem(storageKey);
  if (storedValue === "true") return true;
  if (storedValue === "false") return false;
  return fallback;
}

function createSmtpFormState(profile: Record<string, unknown> | null): SmtpFormState {
  return {
    enabled: Boolean(profile?.smtp_enabled),
    secure: Boolean(profile?.smtp_secure),
    host: String(profile?.smtp_host || ""),
    port: String(profile?.smtp_port || 587),
    username: String(profile?.smtp_username || ""),
    password: "",
    fromName: String(profile?.smtp_from_name || ""),
    fromEmail: String(profile?.smtp_from_email || ""),
    replyTo: String(profile?.smtp_reply_to || ""),
    sendRegistrationEmails: Boolean(profile?.smtp_send_registration_emails),
    sendCertificateEmails: Boolean(profile?.smtp_send_certificate_emails),
  };
}

function hasSmtpConfigured(profile: Record<string, unknown> | null) {
  return Boolean(
    profile?.smtp_enabled &&
      profile?.smtp_host &&
      profile?.smtp_username &&
      (profile?.smtp_password || profile?.smtp_has_saved_password) &&
      profile?.smtp_from_email,
  );
}

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
  smtpProfile,
}: CertificatesClientProps) {
  const router = useRouter();
  const events = realEvents;
  const certificates = realCertificates;
  const registrations = realRegistrations;

  const [certTab, setCertTab] = useState<CertTab>("events");
  const [selectedEventId, setSelectedEventId] = useState(String(events[0]?.id ?? ""));
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id ?? "");
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorState, setEditorState] = useState<EditorState>(createDefaultEditorState());
  const [sendEmail, setSendEmail] = useState(() => readSendEmailPreference(BULK_SEND_EMAIL_PREFERENCE_KEY, false));
  const [loading, setLoading] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [msg, setMsg] = useState("");
  const [eventsTabEventId, setEventsTabEventId] = useState(String(events[0]?.id ?? ""));
  const [overviewEventId, setOverviewEventId] = useState<string | null>(null);

  // Events tab: role assignment & per-category template selection
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [runnerId, setRunnerId] = useState<string | null>(null);
  const [winnerTemplateId, setWinnerTemplateId] = useState(templates[0]?.id ?? "");
  const [runnerTemplateId, setRunnerTemplateId] = useState(templates[0]?.id ?? "");
  const [participantTemplateId, setParticipantTemplateId] = useState(templates[0]?.id ?? "");
  const [sendEmailEvents, setSendEmailEvents] = useState(() => readSendEmailPreference(ROLE_SEND_EMAIL_PREFERENCE_KEY, false));
  const [issuingCerts, setIssuingCerts] = useState(false);
  const [showTemplatePanel, setShowTemplatePanel] = useState(false);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [editingRegId, setEditingRegId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [selectedCertificateIds, setSelectedCertificateIds] = useState<string[]>([]);
  const [sendingCertificates, setSendingCertificates] = useState(false);
  const [smtpModalOpen, setSmtpModalOpen] = useState(false);
  const [smtpForm, setSmtpForm] = useState<SmtpFormState>(() => createSmtpFormState(smtpProfile));
  const [smtpConfig, setSmtpConfig] = useState<Record<string, unknown> | null>(smtpProfile);
  const [smtpMessage, setSmtpMessage] = useState("");
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [pendingMailIntent, setPendingMailIntent] = useState<PendingMailIntent | null>(null);
  const [pendingRegenerateIntent, setPendingRegenerateIntent] = useState<PendingRegenerateIntent | null>(null);

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

  const overviewRegistrations = useMemo(
    () => (overviewEventId ? registrations.filter((r) => String(r.event_id) === overviewEventId) : []),
    [overviewEventId, registrations],
  );

  const overviewEvent = useMemo(
    () => (overviewEventId ? events.find((e) => String(e.id) === overviewEventId) ?? null : null),
    [overviewEventId, events],
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

  const groupedCertificates = useMemo(() => {
    const groupedByEvent = new Map<string, { eventName: string; certs: Array<Record<string, unknown>> }>();

    for (const cert of certificates) {
      const eventId = String(cert.event_id || "unknown");
      if (!groupedByEvent.has(eventId)) {
        const matchedEvent = events.find((event) => String(event.id) === eventId);
        groupedByEvent.set(eventId, {
          eventName: String(matchedEvent?.name || cert.event_name || "Unknown Event"),
          certs: [],
        });
      }

      groupedByEvent.get(eventId)?.certs.push(cert);
    }

    return Array.from(groupedByEvent.entries());
  }, [certificates, events]);

  const smtpReady = hasSmtpConfigured(smtpConfig);

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

  useEffect(() => {
    window.localStorage.setItem(BULK_SEND_EMAIL_PREFERENCE_KEY, String(sendEmail));
  }, [sendEmail]);

  useEffect(() => {
    window.localStorage.setItem(ROLE_SEND_EMAIL_PREFERENCE_KEY, String(sendEmailEvents));
  }, [sendEmailEvents]);

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

  async function handleIssue(forceRegenerate = false) {
    if (!selectedEventId || !selectedTemplateId) return;
    setLoading(true);
    setMsg("");

    const result = await issueCertificatesAction(selectedEventId, selectedTemplateId, sendEmail, forceRegenerate);
    if (result?.needsRegenerate) {
      setLoading(false);
      setPendingRegenerateIntent({
        kind: "bulk-generate",
        existingCount: result.existingCount ?? 0,
      });
      return;
    }

    if (result?.error) {
      setMsg(result.error);
    } else {
      setMsg(forceRegenerate ? `Successfully regenerated ${result.count} certificate(s) in bulk.` : `Successfully generated ${result.count} certificate(s) in bulk.`);
      router.refresh();
    }

    setLoading(false);
  }

  async function executePendingMailIntent(intent: PendingMailIntent) {
    if (intent.kind === "bulk-generate") {
      await handleIssue();
      return;
    }

    if (intent.kind === "role-based-generate") {
      if (!overviewEventId) return;

      setIssuingCerts(true);
      setMsg("");
      const result = await issueCertificatesByCategoryAction(
        overviewEventId,
        {
          winner: winnerTemplateId,
          runner_up: runnerTemplateId,
          participant: participantTemplateId,
        },
        winnerId,
        runnerId,
        sendEmailEvents,
        false,
      );

      if (result?.needsRegenerate) {
        setIssuingCerts(false);
        setPendingRegenerateIntent({
          kind: "role-based-generate",
          existingCount: result.existingCount ?? 0,
        });
        return;
      }

      if (result?.error) {
        setMsg(result.error);
      } else {
        setMsg(`Successfully issued ${result.count} certificate(s) with role-based templates!`);
        setOverviewEventId(null);
        setShowTemplatePanel(false);
        router.refresh();
      }

      setIssuingCerts(false);
      return;
    }

    setSendingCertificates(true);
    setMsg("");
    const result = await sendIssuedCertificatesAction(intent.certificateIds);
    if (result?.error) {
      setMsg(result.error);
    } else {
      const skippedSuffix = result.skippedCount ? `, ${result.skippedCount} skipped` : "";
      setMsg(`Sent ${result.sentCount} certificate email(s)${skippedSuffix}.`);
      setSelectedCertificateIds((current) => current.filter((id) => !intent.certificateIds.includes(id)));
    }
    setSendingCertificates(false);
  }

  async function requestMailIntent(intent: PendingMailIntent) {
    if (!smtpReady) {
      setPendingMailIntent(intent);
      setSmtpModalOpen(true);
      setSmtpMessage("Configure SMTP to send certificate emails.");
      return;
    }

    await executePendingMailIntent(intent);
  }

  async function handleConfirmRegenerate() {
    if (!pendingRegenerateIntent) return;

    if (pendingRegenerateIntent.kind === "bulk-generate") {
      setPendingRegenerateIntent(null);
      await handleIssue(true);
      return;
    }

    if (!overviewEventId) {
      setPendingRegenerateIntent(null);
      return;
    }

    setPendingRegenerateIntent(null);
    setIssuingCerts(true);
    setMsg("");

    const regenerateResult = await issueCertificatesByCategoryAction(
      overviewEventId,
      {
        winner: winnerTemplateId,
        runner_up: runnerTemplateId,
        participant: participantTemplateId,
      },
      winnerId,
      runnerId,
      sendEmailEvents,
      true,
    );

    if (regenerateResult?.error) {
      setMsg(regenerateResult.error);
    } else {
      setMsg(`Successfully regenerated ${regenerateResult.count} certificate(s) with role-based templates!`);
      setOverviewEventId(null);
      setShowTemplatePanel(false);
      router.refresh();
    }

    setIssuingCerts(false);
  }

  function toggleCertificateSelection(certificateId: string) {
    setSelectedCertificateIds((current) =>
      current.includes(certificateId) ? current.filter((id) => id !== certificateId) : [...current, certificateId],
    );
  }

  function toggleEventCertificateSelection(eventCertificateIds: string[]) {
    setSelectedCertificateIds((current) => {
      const allSelected = eventCertificateIds.every((id) => current.includes(id));
      if (allSelected) {
        return current.filter((id) => !eventCertificateIds.includes(id));
      }

      return Array.from(new Set([...current, ...eventCertificateIds]));
    });
  }

  async function handleSaveSmtp() {
    setSavingSmtp(true);
    setSmtpMessage("");

    const formData = new FormData();
    if (smtpForm.enabled) formData.set("smtpEnabled", "on");
    if (smtpForm.secure) formData.set("smtpSecure", "on");
    formData.set("smtpHost", smtpForm.host);
    formData.set("smtpPort", smtpForm.port || "587");
    formData.set("smtpUsername", smtpForm.username);
    formData.set("smtpPassword", smtpForm.password);
    formData.set("smtpFromName", smtpForm.fromName);
    formData.set("smtpFromEmail", smtpForm.fromEmail);
    formData.set("smtpReplyTo", smtpForm.replyTo);
    if (smtpForm.sendRegistrationEmails) formData.set("smtpSendRegistrationEmails", "on");
    if (smtpForm.sendCertificateEmails) formData.set("smtpSendCertificateEmails", "on");

    const result = await saveOrganizerSmtpSettingsAction(formData);
    setSavingSmtp(false);

    if (result?.error) {
      setSmtpMessage(result.error);
      return;
    }

    const nextConfig: Record<string, unknown> = {
      smtp_enabled: smtpForm.enabled,
      smtp_secure: smtpForm.secure,
      smtp_host: smtpForm.host,
      smtp_port: Number(smtpForm.port || 587),
      smtp_username: smtpForm.username,
      smtp_has_saved_password: Boolean(smtpForm.password || smtpConfig?.smtp_has_saved_password),
      smtp_from_name: smtpForm.fromName,
      smtp_from_email: smtpForm.fromEmail,
      smtp_reply_to: smtpForm.replyTo,
      smtp_send_registration_emails: smtpForm.sendRegistrationEmails,
      smtp_send_certificate_emails: smtpForm.sendCertificateEmails,
    };

    setSmtpConfig(nextConfig);
    setSmtpForm((current) => ({ ...current, password: "" }));
    setSmtpMessage("SMTP settings saved.");

    if (!hasSmtpConfigured(nextConfig)) {
      setSmtpMessage("SMTP settings saved, but required fields are still incomplete.");
      return;
    }

    if (pendingMailIntent) {
      const intent = pendingMailIntent;
      setPendingMailIntent(null);
      setSmtpModalOpen(false);
      await executePendingMailIntent(intent);
    }
  }

  async function handleTestSmtp() {
    setTestingSmtp(true);
    setSmtpMessage("");
    const result = await testOrganizerSmtpSettingsAction();
    setTestingSmtp(false);
    setSmtpMessage(result?.error || "SMTP connection verified.");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 className="text-2xl font-bold mb-2">Certificates</h1>
        <p style={{ color: "var(--muted-foreground)" }}>
          The uploaded participation PPT is now your default certificate base. Customize its placeholders and signatures, or upload your own PDF/image design.
        </p>
      </div>

      {events.length === 0 ? (
        <div style={{ padding: "12px 18px", borderRadius: "12px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.1rem" }}>📋</span>
          <span style={{ fontSize: "0.875rem", color: "#f59e0b" }}>
            No events yet. Create events from the Events section and collect registrations to see your data here.
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
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Section Header */}
          <div className="inline-flex items-center gap-2" style={{ color: "var(--primary-soft)" }}>
            <CalendarDays size={18} />
            <span className="font-semibold">Your Events</span>
            <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginLeft: "8px" }}>
              Click &ldquo;Overview&rdquo; to manage participants and issue certificates
            </span>
          </div>

          {/* Event Card Grid */}
          {events.length === 0 ? (
            <div className="glass-card" style={{ padding: "48px", textAlign: "center" }}>
              <CalendarDays size={40} style={{ margin: "0 auto 12px", color: "var(--primary-soft)", opacity: 0.5 }} />
              <p style={{ color: "var(--muted-foreground)" }}>No events found. Create your first event from the Events section.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
              {events.map((evt) => {
                const evtId = String(evt.id);
                const category = String(evt.category || "event").toLowerCase();
                const fee = Number(evt.registration_fee || 0);
                const advantages = (evt.advantages as string[]) || [];
                const catColorMap: Record<string, string> = {
                  hackathon: "#818cf8", workshop: "#10b981", seminar: "#f59e0b",
                  conference: "#3b82f6", competition: "#ef4444", webinar: "#8b5cf6", other: "#6b7280",
                };
                const catColor = catColorMap[category] || catColorMap.other;
                const gradientMap: Record<string, string> = {
                  hackathon: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                  workshop: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
                  seminar: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
                  conference: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  competition: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                  webinar: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                  other: "linear-gradient(135deg, #6b7280 0%, #374151 100%)",
                };
                const gradient = gradientMap[category] || gradientMap.other;
                const eventRegs = registrations.filter((r) => String(r.event_id) === evtId);
                const startDate = evt.start_date ? new Date(String(evt.start_date)).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBA";
                const endDate = evt.end_date && evt.end_date !== evt.start_date ? new Date(String(evt.end_date)).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : null;

                return (
                  <div
                    key={evtId}
                    style={{
                      borderRadius: "20px",
                      border: "1px solid rgba(255,255,255,0.06)",
                      background: "linear-gradient(180deg, rgba(14,16,32,0.95), rgba(8,10,22,0.98))",
                      overflow: "hidden",
                      transition: "border-color 0.25s ease, box-shadow 0.25s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${catColor}40`;
                      e.currentTarget.style.boxShadow = `0 8px 32px ${catColor}12`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Gradient top bar */}
                    <div style={{ height: "5px", background: gradient }} />
                    <div style={{ padding: "22px 24px" }}>
                      {/* Category + Price */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                        <span style={{
                          padding: "4px 14px", borderRadius: "20px",
                          background: `${catColor}18`, border: `1px solid ${catColor}35`,
                          fontSize: "0.72rem", fontWeight: 600, color: catColor, textTransform: "capitalize",
                        }}>
                          {category}
                        </span>
                        <span style={{ fontSize: "0.92rem", color: fee > 0 ? "var(--foreground)" : "#10b981", fontWeight: 700 }}>
                          {fee > 0 ? `₹${fee}` : "FREE"}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 style={{ fontSize: "1.12rem", fontWeight: 700, marginBottom: "8px", color: "white" }}>
                        {String(evt.name)}
                      </h3>

                      {/* Description */}
                      {evt.description ? (
                        <p style={{
                          fontSize: "0.82rem", color: "var(--muted-foreground)", marginBottom: "14px",
                          lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                        }}>
                          {String(evt.description)}
                        </p>
                      ) : null}

                      {/* Event details */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                          <CalendarDays size={13} style={{ color: catColor, flexShrink: 0 }} />
                          <span>{startDate}{endDate ? ` – ${endDate}` : ""}</span>
                        </div>
                        {evt.event_time ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                            <Clock size={13} style={{ color: catColor, flexShrink: 0 }} />
                            <span>{String(evt.event_time)}</span>
                          </div>
                        ) : null}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                          <MapPin size={13} style={{ color: catColor, flexShrink: 0 }} />
                          <span>{String(evt.venue_details || evt.venue || "Online")}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                          <Users size={13} style={{ color: catColor, flexShrink: 0 }} />
                          <span>{String(evt.org_name_display || "Organizer")}</span>
                        </div>
                      </div>

                      {/* Advantages */}
                      {advantages.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                          {advantages.slice(0, 3).map((adv) => (
                            <span key={adv} style={{
                              padding: "3px 10px", borderRadius: "16px",
                              background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)",
                              fontSize: "0.7rem", color: "#10b981",
                            }}>
                              ✓ {adv}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {/* Footer */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "0.76rem", color: "var(--muted-foreground)" }}>
                            {eventRegs.length} registered
                          </span>
                          <span className={`badge ${String(evt.status) === "completed" ? "badge-success" : String(evt.status) === "draft" ? "badge-neutral" : "badge-info"}`} style={{ fontSize: "0.68rem" }}>
                            {String(evt.status || "published")}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            setOverviewEventId(evtId);
                            setEventsTabEventId(evtId);
                            setWinnerId(null);
                            setRunnerId(null);
                            setShowTemplatePanel(false);
                            setMsg("");
                            // Auto check-in all participants by default
                            const unchecked = eventRegs.filter(r => !r.checked_in).map(r => String(r.id));
                            if (unchecked.length > 0) {
                              await bulkCheckInAction(evtId, unchecked);
                              router.refresh();
                            }
                          }}
                          className="btn-primary"
                          style={{ padding: "8px 18px", fontSize: "0.82rem", borderRadius: "10px", border: "none", cursor: "pointer" }}
                        >
                          Overview →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── OVERVIEW MODAL ── */}
          {overviewEventId && overviewEvent ? (
            <div
              style={{
                position: "fixed", inset: 0,
                background: "rgba(3, 8, 20, 0.78)",
                backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 85, padding: "24px",
              }}
              onClick={() => setOverviewEventId(null)}
            >
              <div
                className="glass-card"
                style={{ width: "min(1100px, 100%)", maxHeight: "92vh", overflow: "auto", padding: "28px", position: "relative" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setOverviewEventId(null)}
                  style={{
                    position: "absolute", top: "18px", right: "18px",
                    width: "36px", height: "36px", borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)",
                    color: "var(--foreground)", display: "inline-flex", alignItems: "center",
                    justifyContent: "center", cursor: "pointer",
                  }}
                >
                  <X size={18} />
                </button>

                {/* Event header info */}
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <Tag size={16} style={{ color: "var(--primary-soft)" }} />
                    <span style={{
                      padding: "3px 12px", borderRadius: "16px",
                      background: "rgba(88,115,255,0.1)", border: "1px solid rgba(88,115,255,0.2)",
                      fontSize: "0.72rem", fontWeight: 600, color: "var(--primary-soft)", textTransform: "capitalize",
                    }}>
                      {String(overviewEvent.category || "event")}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold" style={{ marginBottom: "4px" }}>
                    {String(overviewEvent.name)} — Participant Overview
                  </h2>
                  <p style={{ color: "var(--muted-foreground)", margin: 0, fontSize: "0.85rem" }}>
                    Assign roles and then select templates to issue certificates
                  </p>
                </div>

                {/* Check-in Stats Bar */}
                {overviewRegistrations.length > 0 && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap",
                    padding: "12px 18px", borderRadius: "12px",
                    background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.1)",
                    marginBottom: "16px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <CheckCircle2 size={16} style={{ color: "#10b981" }} />
                      <span style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                        Checked in: <strong style={{ color: "#10b981" }}>
                          {overviewRegistrations.filter(r => r.checked_in).length}
                        </strong> / {overviewRegistrations.length}
                      </span>
                    </div>
                    {overviewRegistrations.some(r => !r.checked_in) && (
                      <button
                        type="button"
                        disabled={checkingIn === "bulk"}
                        onClick={async () => {
                          setCheckingIn("bulk");
                          const unchecked = overviewRegistrations.filter(r => !r.checked_in).map(r => String(r.id));
                          await bulkCheckInAction(overviewEventId, unchecked);
                          router.refresh();
                          setCheckingIn(null);
                        }}
                        style={{
                          padding: "6px 14px", borderRadius: "8px", border: "none",
                          background: "rgba(16,185,129,0.12)", color: "#10b981",
                          fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                        }}
                      >
                        {checkingIn === "bulk" ? "Checking in..." : "✓ Check-In All"}
                      </button>
                    )}
                    <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginLeft: "auto" }}>
                      ⚠️ Only checked-in participants will receive certificates
                    </span>
                  </div>
                )}

                {/* Participant Table - always show */}
                <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: "24px" }}>
                  <table className="schedule-table" style={{ width: "100%" }}>
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                        {["NAME", "EMAIL", "TEAM", "CHECK-IN", "WINNER", "RUNNER", "PARTICIPANT", ""].map((heading) => (
                          <th key={heading} style={{
                            padding: "14px 14px", textAlign: "left",
                            fontSize: "0.72rem", color: "var(--muted-foreground)",
                            textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700,
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                            whiteSpace: "nowrap",
                          }}>
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {overviewRegistrations.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "var(--muted-foreground)" }}>
                            No registrations for this event yet.
                          </td>
                        </tr>
                      ) : (
                        overviewRegistrations.map((registration) => {
                          const regId = String(registration.id);
                          const currentRole = regId === winnerId ? "winner" : regId === runnerId ? "runner_up" : "participant";
                          const isCheckedIn = Boolean(registration.checked_in);
                          const teamSize = Number(registration.team_size || 1);
                          const teamMembers = (registration.team_members as Array<{ name: string; email: string }>) || [];
                          const isExpanded = expandedTeam === regId;

                          return (
                            <Fragment key={regId}>
                              <tr style={{
                                borderBottom: "1px solid rgba(255,255,255,0.06)",
                                background: !isCheckedIn
                                  ? "rgba(239,68,68,0.02)"
                                  : currentRole === "winner"
                                    ? "rgba(245,158,11,0.04)"
                                    : currentRole === "runner_up"
                                      ? "rgba(156,163,175,0.04)"
                                      : "transparent",
                              }}>
                                <td style={{ padding: "12px 14px", fontWeight: 600, fontSize: "0.88rem" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    {currentRole === "winner" && <Trophy size={15} color="#fbbf24" />}
                                    {currentRole === "runner_up" && <Medal size={15} color="#c0c0c0" />}
                                    {currentRole === "participant" && <Award size={15} color="#60a5fa" />}
                                    {String(registration.full_name || "—")}
                                  </div>
                                </td>
                                <td style={{ padding: "12px 14px", color: "var(--muted-foreground)", fontSize: "0.84rem" }}>
                                  {String(registration.email || "—")}
                                </td>
                                {/* Team column */}
                                <td style={{ padding: "12px 14px" }}>
                                  {teamSize > 1 ? (
                                    <button
                                      type="button"
                                      onClick={() => setExpandedTeam(isExpanded ? null : regId)}
                                      style={{
                                        padding: "3px 10px", borderRadius: "12px", border: "none",
                                        background: "rgba(99,102,241,0.1)", color: "var(--primary-soft)",
                                        fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
                                        display: "inline-flex", alignItems: "center", gap: "4px",
                                      }}
                                    >
                                      <Users size={12} /> {teamSize} {isExpanded ? "▲" : "▼"}
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>Solo</span>
                                  )}
                                </td>
                                {/* Check-in toggle */}
                                <td style={{ padding: "12px 14px" }}>
                                  <button
                                    type="button"
                                    disabled={checkingIn === regId}
                                    onClick={async () => {
                                      setCheckingIn(regId);
                                      if (isCheckedIn) {
                                        await checkOutParticipantAction(regId, overviewEventId);
                                        // When check-in is turned OFF, also clear any role assignment
                                        if (winnerId === regId) setWinnerId(null);
                                        if (runnerId === regId) setRunnerId(null);
                                      } else {
                                        await checkInParticipantAction(regId, overviewEventId);
                                      }
                                      router.refresh();
                                      setCheckingIn(null);
                                    }}
                                    style={{
                                      width: "44px", height: "24px", borderRadius: "12px", border: "none",
                                      background: isCheckedIn ? "#10b981" : "rgba(239,68,68,0.2)",
                                      position: "relative", cursor: "pointer", transition: "background 0.2s ease",
                                      opacity: checkingIn === regId ? 0.5 : 1,
                                    }}
                                  >
                                    <span style={{
                                      position: "absolute", top: "3px",
                                      left: isCheckedIn ? "22px" : "3px",
                                      width: "18px", height: "18px", borderRadius: "50%",
                                      background: "white", transition: "left 0.2s ease",
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                    }} />
                                  </button>
                                </td>
                                {/* Winner toggle */}
                                <td style={{ padding: "12px 14px" }}>
                                  <button
                                    type="button"
                                    disabled={!isCheckedIn}
                                    onClick={() => {
                                      if (!isCheckedIn) return;
                                      if (currentRole === "winner") {
                                        setWinnerId(null);
                                      } else {
                                        setWinnerId(regId);
                                        if (runnerId === regId) setRunnerId(null);
                                      }
                                    }}
                                    style={{
                                      width: "44px", height: "24px", borderRadius: "12px", border: "none",
                                      background: !isCheckedIn ? "rgba(255,255,255,0.04)" : currentRole === "winner" ? "#fbbf24" : "rgba(255,255,255,0.1)",
                                      position: "relative", cursor: isCheckedIn ? "pointer" : "not-allowed", transition: "background 0.2s ease",
                                      opacity: isCheckedIn ? 1 : 0.35,
                                    }}
                                  >
                                    <span style={{
                                      position: "absolute", top: "3px",
                                      left: currentRole === "winner" ? "22px" : "3px",
                                      width: "18px", height: "18px", borderRadius: "50%",
                                      background: "white", transition: "left 0.2s ease",
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                    }} />
                                  </button>
                                </td>
                                {/* Runner toggle */}
                                <td style={{ padding: "12px 14px" }}>
                                  <button
                                    type="button"
                                    disabled={!isCheckedIn}
                                    onClick={() => {
                                      if (!isCheckedIn) return;
                                      if (currentRole === "runner_up") {
                                        setRunnerId(null);
                                      } else {
                                        setRunnerId(regId);
                                        if (winnerId === regId) setWinnerId(null);
                                      }
                                    }}
                                    style={{
                                      width: "44px", height: "24px", borderRadius: "12px", border: "none",
                                      background: !isCheckedIn ? "rgba(255,255,255,0.04)" : currentRole === "runner_up" ? "#d1d5db" : "rgba(255,255,255,0.1)",
                                      position: "relative", cursor: isCheckedIn ? "pointer" : "not-allowed", transition: "background 0.2s ease",
                                      opacity: isCheckedIn ? 1 : 0.35,
                                    }}
                                  >
                                    <span style={{
                                      position: "absolute", top: "3px",
                                      left: currentRole === "runner_up" ? "22px" : "3px",
                                      width: "18px", height: "18px", borderRadius: "50%",
                                      background: "white", transition: "left 0.2s ease",
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                    }} />
                                  </button>
                                </td>
                                {/* Participant toggle */}
                                <td style={{ padding: "12px 14px" }}>
                                  <button
                                    type="button"
                                    disabled={!isCheckedIn}
                                    onClick={() => {
                                      if (!isCheckedIn) return;
                                      if (winnerId === regId) setWinnerId(null);
                                      if (runnerId === regId) setRunnerId(null);
                                    }}
                                    style={{
                                      width: "44px", height: "24px", borderRadius: "12px", border: "none",
                                      background: !isCheckedIn ? "rgba(255,255,255,0.04)" : currentRole === "participant" ? "#3b82f6" : "rgba(255,255,255,0.1)",
                                      position: "relative", cursor: isCheckedIn ? "pointer" : "not-allowed", transition: "background 0.2s ease",
                                      opacity: isCheckedIn ? 1 : 0.35,
                                    }}
                                  >
                                    <span style={{
                                      position: "absolute", top: "3px",
                                      left: currentRole === "participant" ? "22px" : "3px",
                                      width: "18px", height: "18px", borderRadius: "50%",
                                      background: "white", transition: "left 0.2s ease",
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                    }} />
                                  </button>
                                </td>
                                {/* Edit button */}
                                <td style={{ padding: "12px 14px" }}>
                                  {editingRegId === regId ? (
                                    <div style={{ display: "flex", gap: "6px" }}>
                                      <button
                                        type="button"
                                        disabled={savingEdit}
                                        onClick={async () => {
                                          setSavingEdit(true);
                                          const result = await updateRegistrationDetailsAction(
                                            regId,
                                            overviewEventId,
                                            editName,
                                            editEmail
                                          );
                                          if (result?.error) {
                                            setMsg(result.error);
                                          } else {
                                            setMsg("Participant updated successfully.");
                                            router.refresh();
                                          }
                                          setSavingEdit(false);
                                          setEditingRegId(null);
                                        }}
                                        style={{
                                          width: "30px", height: "30px", borderRadius: "8px", border: "none",
                                          background: "rgba(16,185,129,0.15)", color: "#10b981",
                                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                                          cursor: savingEdit ? "wait" : "pointer",
                                          opacity: savingEdit ? 0.5 : 1,
                                        }}
                                        title="Save"
                                      >
                                        <Check size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingRegId(null)}
                                        style={{
                                          width: "30px", height: "30px", borderRadius: "8px", border: "none",
                                          background: "rgba(239,68,68,0.12)", color: "#ef4444",
                                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                                          cursor: "pointer",
                                        }}
                                        title="Cancel"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingRegId(regId);
                                        setEditName(String(registration.full_name || ""));
                                        setEditEmail(String(registration.email || ""));
                                      }}
                                      style={{
                                        width: "30px", height: "30px", borderRadius: "8px", border: "none",
                                        background: "rgba(88,115,255,0.1)", color: "var(--primary-soft)",
                                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                                        cursor: "pointer", transition: "background 0.2s ease",
                                      }}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(88,115,255,0.2)"; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(88,115,255,0.1)"; }}
                                      title="Edit name & email"
                                    >
                                      <Pencil size={14} />
                                    </button>
                                  )}
                                </td>
                              </tr>
                              {/* Inline edit row */}
                              {editingRegId === regId && (
                                <tr style={{
                                  borderBottom: "1px solid rgba(88,115,255,0.15)",
                                  background: "rgba(88,115,255,0.04)",
                                }}>
                                  <td style={{ padding: "8px 14px" }}>
                                    <input
                                      type="text"
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      placeholder="Full name"
                                      style={{
                                        width: "100%", padding: "7px 10px", borderRadius: "8px",
                                        border: "1px solid rgba(88,115,255,0.25)",
                                        background: "rgba(255,255,255,0.04)", color: "var(--foreground)",
                                        fontSize: "0.84rem", outline: "none",
                                      }}
                                      onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(88,115,255,0.5)"; }}
                                      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(88,115,255,0.25)"; }}
                                    />
                                  </td>
                                  <td style={{ padding: "8px 14px" }}>
                                    <input
                                      type="email"
                                      value={editEmail}
                                      onChange={(e) => setEditEmail(e.target.value)}
                                      placeholder="Email"
                                      style={{
                                        width: "100%", padding: "7px 10px", borderRadius: "8px",
                                        border: "1px solid rgba(88,115,255,0.25)",
                                        background: "rgba(255,255,255,0.04)", color: "var(--foreground)",
                                        fontSize: "0.84rem", outline: "none",
                                      }}
                                      onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(88,115,255,0.5)"; }}
                                      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(88,115,255,0.25)"; }}
                                    />
                                  </td>
                                  <td colSpan={6} style={{ padding: "8px 14px", fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
                                    ✏️ Editing — press <strong style={{ color: "#10b981" }}>✓</strong> to save or <strong style={{ color: "#ef4444" }}>✕</strong> to cancel
                                  </td>
                                </tr>
                              )}
                              {/* Team member sub-rows */}
                              {isExpanded && teamMembers.length > 0 && teamMembers.map((member, mIdx) => (
                                <tr key={`${regId}-m${mIdx}`} style={{
                                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                                  background: "rgba(99,102,241,0.03)",
                                }}>
                                  <td style={{ padding: "8px 14px 8px 38px", fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                                    <span style={{ marginRight: "6px", opacity: 0.5 }}>└</span>
                                    {member.name || "—"}
                                  </td>
                                  <td style={{ padding: "8px 14px", fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                                    {member.email || "—"}
                                  </td>
                                  <td colSpan={6} style={{ padding: "8px 14px" }}>
                                    <span style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", opacity: 0.6 }}>Team Member {mIdx + 2}</span>
                                  </td>
                                </tr>
                              ))}
                            </Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Action buttons */}
                {overviewRegistrations.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {!showTemplatePanel ? (
                      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: "10px 20px", fontSize: "0.88rem" }}
                          onClick={() => setOverviewEventId(null)}
                        >
                          <X size={15} /> Close
                        </button>
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ padding: "10px 24px", fontSize: "0.92rem" }}
                          onClick={() => setShowTemplatePanel(true)}
                        >
                          <LayoutTemplate size={16} />
                          Select Template & Issue Certificates →
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          borderRadius: "16px",
                          border: "1px solid rgba(88,115,255,0.15)",
                          background: "linear-gradient(180deg, rgba(88,115,255,0.04), rgba(8,10,22,0.5))",
                          padding: "24px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                          <LayoutTemplate size={18} style={{ color: "var(--primary-soft)" }} />
                          <span className="font-semibold" style={{ fontSize: "0.95rem" }}>Select Templates by Category</span>
                        </div>
                        <p style={{ color: "var(--muted-foreground)", fontSize: "0.82rem", marginBottom: "18px", lineHeight: 1.6 }}>
                          Choose a certificate template for each category. Winner, Runner-Up, and Participant can each have a different design.
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px", marginBottom: "18px" }}>
                          {/* Winner template */}
                          <div style={{
                            padding: "14px",
                            borderRadius: "12px",
                            border: "1px solid rgba(251,191,36,0.15)",
                            background: "rgba(251,191,36,0.04)",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                              <Trophy size={15} color="#fbbf24" />
                              <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#fbbf24" }}>Winner Template</span>
                              <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginLeft: "auto" }}>
                                {winnerId ? "1 assigned" : "None assigned"}
                              </span>
                            </div>
                            <select
                              value={winnerTemplateId}
                              onChange={(e) => setWinnerTemplateId(e.target.value)}
                              className="input-field"
                              style={{ fontSize: "0.85rem" }}
                              disabled={!winnerId}
                            >
                              {templates.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Runner-up template */}
                          <div style={{
                            padding: "14px",
                            borderRadius: "12px",
                            border: "1px solid rgba(209,213,219,0.15)",
                            background: "rgba(209,213,219,0.04)",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                              <Medal size={15} color="#d1d5db" />
                              <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#d1d5db" }}>Runner-Up Template</span>
                              <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginLeft: "auto" }}>
                                {runnerId ? "1 assigned" : "None assigned"}
                              </span>
                            </div>
                            <select
                              value={runnerTemplateId}
                              onChange={(e) => setRunnerTemplateId(e.target.value)}
                              className="input-field"
                              style={{ fontSize: "0.85rem" }}
                              disabled={!runnerId}
                            >
                              {templates.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Participant template */}
                          <div style={{
                            padding: "14px",
                            borderRadius: "12px",
                            border: "1px solid rgba(59,130,246,0.15)",
                            background: "rgba(59,130,246,0.04)",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                              <Award size={15} color="#3b82f6" />
                              <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#3b82f6" }}>Participant Template</span>
                              <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginLeft: "auto" }}>
                                {overviewRegistrations.length - (winnerId ? 1 : 0) - (runnerId ? 1 : 0)} assigned
                              </span>
                            </div>
                            <select
                              value={participantTemplateId}
                              onChange={(e) => setParticipantTemplateId(e.target.value)}
                              className="input-field"
                              style={{ fontSize: "0.85rem" }}
                            >
                              {templates.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Send email checkbox */}
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem", marginBottom: "18px" }}>
                          <input
                            type="checkbox"
                            checked={sendEmailEvents}
                            onChange={(e) => setSendEmailEvents(e.target.checked)}
                          />
                          Send certificates by email to participants
                        </label>

                        {/* Summary */}
                        <div style={{
                          padding: "12px 16px",
                          borderRadius: "10px",
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          marginBottom: "18px",
                          fontSize: "0.82rem",
                          color: "var(--muted-foreground)",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "16px",
                        }}>
                          <span>Total: <strong style={{ color: "var(--foreground)" }}>{overviewRegistrations.length}</strong> participants</span>
                          <span>✅ Checked In: <strong style={{ color: "#10b981" }}>{overviewRegistrations.filter(r => r.checked_in).length}</strong></span>
                          {overviewRegistrations.some(r => !r.checked_in) && (
                            <span style={{ color: "#f59e0b" }}>⚠️ {overviewRegistrations.filter(r => !r.checked_in).length} not checked in (will be skipped)</span>
                          )}
                          {winnerId && <span>🏆 Winner: <strong style={{ color: "#fbbf24" }}>{String(overviewRegistrations.find(r => String(r.id) === winnerId)?.full_name || "—")}</strong></span>}
                          {runnerId && <span>🥈 Runner: <strong style={{ color: "#d1d5db" }}>{String(overviewRegistrations.find(r => String(r.id) === runnerId)?.full_name || "—")}</strong></span>}
                        </div>

                        {/* Buttons */}
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: "10px 20px", fontSize: "0.88rem" }}
                            onClick={() => setShowTemplatePanel(false)}
                          >
                            ← Back to Roles
                          </button>
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: "10px 24px", fontSize: "0.92rem" }}
                            disabled={issuingCerts}
                            onClick={async () => {
                              if (sendEmailEvents) {
                                await requestMailIntent({ kind: "role-based-generate" });
                                return;
                              }

                              await executePendingMailIntent({ kind: "role-based-generate" });
                            }}
                          >
                            <Send size={16} />
                            {issuingCerts ? "Issuing Certificates..." : `Issue ${overviewRegistrations.length} Certificate(s)`}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
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

                <button
                  onClick={() => {
                    if (sendEmail) {
                      void requestMailIntent({ kind: "bulk-generate" });
                      return;
                    }

                    void handleIssue();
                  }}
                  className="btn-primary"
                  disabled={!selectedEventId || !selectedTemplateId || loading || customTemplateNeedsSetup}
                >
                  <span className="inline-flex items-center gap-2">
                    <Trophy size={16} />
                    {loading ? "Generating..." : "Generate Bulk Certificates"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Issued Certificates grouped by Event ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="inline-flex items-center gap-2" style={{ color: "var(--primary-soft)" }}>
              <Award size={18} />
              <span className="font-semibold">Issued Certificates</span>
              <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginLeft: "8px" }}>
                Grouped by event — {certificates.length} total
              </span>
            </div>

            {certificates.length === 0 ? (
              <div className="glass-card" style={{ padding: "48px", textAlign: "center" }}>
                <Award size={40} style={{ margin: "0 auto 12px", color: "var(--primary-soft)", opacity: 0.5 }} />
                <p style={{ color: "var(--muted-foreground)" }}>No certificates issued yet. Use the Events tab to assign roles and issue certificates.</p>
              </div>
            ) : (
              groupedCertificates.map(([eid, group]) => {
                  const catColorMap: Record<string, string> = {
                    hackathon: "#818cf8", workshop: "#10b981", seminar: "#f59e0b",
                    conference: "#3b82f6", competition: "#ef4444", webinar: "#8b5cf6", other: "#6b7280",
                  };
                  const matchedEvent = events.find((e) => String(e.id) === eid);
                  const evtCategory = String(matchedEvent?.category || "other").toLowerCase();
                  const catColor = catColorMap[evtCategory] || catColorMap.other;
                  return (
                    <div
                      key={eid}
                      className="glass-card"
                      style={{ overflow: "hidden", padding: 0 }}
                    >
                      {/* Event group header */}
                      <div
                        style={{
                          padding: "16px 22px",
                          background: `linear-gradient(135deg, ${catColor}08, transparent)`,
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                          <div
                            style={{
                              width: "4px", height: "28px", borderRadius: "4px",
                              background: catColor, flexShrink: 0,
                            }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "white", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {group.eventName}
                            </h3>
                            {matchedEvent && (
                              <span style={{ fontSize: "0.72rem", color: catColor, textTransform: "capitalize" }}>
                                {evtCategory}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          <span style={{
                            padding: "4px 14px", borderRadius: "20px",
                            background: `${catColor}15`, border: `1px solid ${catColor}30`,
                            fontSize: "0.78rem", fontWeight: 600, color: catColor,
                          }}>
                            {group.certs.length} certificate{group.certs.length !== 1 ? "s" : ""}
                          </span>
                          {(() => {
                            const emailableIds = group.certs
                              .filter((certificate) => String(certificate.recipient_email || "").trim())
                              .map((certificate) => String(certificate.id));
                            const selectedInGroup = emailableIds.filter((id) => selectedCertificateIds.includes(id));
                            if (emailableIds.length === 0) return null;

                            return (
                              <>
                                <button
                                  type="button"
                                  className="btn-secondary"
                                  style={{ padding: "6px 10px", fontSize: "0.76rem" }}
                                  onClick={() => toggleEventCertificateSelection(emailableIds)}
                                >
                                  {selectedInGroup.length === emailableIds.length ? "Clear Selection" : "Select All"}
                                </button>
                                <button
                                  type="button"
                                  className="btn-secondary"
                                  style={{ padding: "6px 10px", fontSize: "0.76rem" }}
                                  disabled={sendingCertificates || selectedInGroup.length === 0}
                                  onClick={() => void requestMailIntent({ kind: "send-certificates", certificateIds: selectedInGroup })}
                                >
                                  <Send size={14} />
                                  Send Selected
                                </button>
                                <button
                                  type="button"
                                  className="btn-secondary"
                                  style={{ padding: "6px 10px", fontSize: "0.76rem" }}
                                  disabled={sendingCertificates}
                                  onClick={() => void requestMailIntent({ kind: "send-certificates", certificateIds: emailableIds })}
                                >
                                  <Mail size={14} />
                                  Send All
                                </button>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Certificates table for this event */}
                      <div style={{ overflow: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "920px" }}>
                          <thead>
                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                              {["", "Certificate ID", "Recipient", "Achievement", "Download", "Template", "Status", "Issued", "Send", "View"].map((heading) => (
                                <th key={heading} style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                                  {heading}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {group.certs.map((certificate) => (
                              <tr key={String(certificate.id)} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                <td style={{ padding: "11px 16px" }}>
                                  <input
                                    type="checkbox"
                                    checked={selectedCertificateIds.includes(String(certificate.id))}
                                    disabled={!String(certificate.recipient_email || "").trim()}
                                    onChange={() => toggleCertificateSelection(String(certificate.id))}
                                  />
                                </td>
                                <td style={{ padding: "11px 16px" }}>
                                  <code style={{ fontSize: "0.83rem", color: "var(--primary-soft)" }}>{String(certificate.certificate_id_display || "—")}</code>
                                </td>
                                <td style={{ padding: "11px 16px", fontSize: "0.9rem" }}>
                                  <div style={{ fontWeight: 500 }}>{String(certificate.recipient_name || "—")}</div>
                                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "6px", color: "var(--muted-foreground)", fontSize: "0.8rem" }}>
                                    <span>{String(certificate.recipient_email || "No email address")}</span>
                                    {String(certificate.recipient_email || "").trim() ? (
                                      <button
                                        type="button"
                                        onClick={() => void requestMailIntent({ kind: "send-certificates", certificateIds: [String(certificate.id)] })}
                                        disabled={sendingCertificates}
                                        title="Send certificate by email"
                                        style={{
                                          width: "28px",
                                          height: "28px",
                                          borderRadius: "999px",
                                          border: "1px solid rgba(88,115,255,0.24)",
                                          background: "rgba(88,115,255,0.08)",
                                          color: "var(--primary-soft)",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          cursor: "pointer",
                                        }}
                                      >
                                        <Mail size={14} />
                                      </button>
                                    ) : null}
                                  </div>
                                </td>
                                <td style={{ padding: "11px 16px" }}>
                                  {(() => {
                                    const cat = String(certificate.category || "participant");
                                    const isWinner = cat === "winner";
                                    const isRunner = cat === "runner_up";
                                    const iconColor = isWinner ? "#fbbf24" : isRunner ? "#c0c0c0" : "#60a5fa";
                                    const bgColor = isWinner ? "rgba(251,191,36,0.10)" : isRunner ? "rgba(192,192,192,0.10)" : "rgba(96,165,250,0.10)";
                                    const borderColor = isWinner ? "rgba(251,191,36,0.25)" : isRunner ? "rgba(192,192,192,0.25)" : "rgba(96,165,250,0.25)";
                                    const label = isWinner ? "Winner" : isRunner ? "Runner Up" : "Participant";
                                    return (
                                      <div style={{
                                        display: "inline-flex", alignItems: "center", gap: "7px",
                                        padding: "5px 14px", borderRadius: "20px",
                                        background: bgColor, border: `1px solid ${borderColor}`,
                                      }}>
                                        {isWinner && <Trophy size={14} color={iconColor} />}
                                        {isRunner && <Medal size={14} color={iconColor} />}
                                        {!isWinner && !isRunner && <Award size={14} color={iconColor} />}
                                        <span style={{ fontSize: "0.76rem", fontWeight: 700, color: iconColor, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                          {label}
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </td>
                                {/* Download button */}
                                <td style={{ padding: "11px 16px" }}>
                                  <Link
                                    href={`/dashboard/certificates/${String(certificate.id)}`}
                                    target="_blank"
                                    style={{
                                      display: "inline-flex", alignItems: "center", gap: "6px",
                                      padding: "7px 14px", borderRadius: "10px", border: "none",
                                      background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.06))",
                                      color: "#10b981", fontSize: "0.78rem", fontWeight: 600,
                                      cursor: "pointer", textDecoration: "none",
                                      transition: "all 0.2s ease",
                                      border: "1px solid rgba(16,185,129,0.18)",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = "linear-gradient(135deg, rgba(16,185,129,0.22), rgba(16,185,129,0.12))";
                                      e.currentTarget.style.borderColor = "rgba(16,185,129,0.35)";
                                      e.currentTarget.style.transform = "translateY(-1px)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.06))";
                                      e.currentTarget.style.borderColor = "rgba(16,185,129,0.18)";
                                      e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                  >
                                    <Download size={14} />
                                    View
                                  </Link>
                                </td>
                                <td style={{ padding: "11px 16px", fontSize: "0.84rem", color: "var(--foreground)" }}>{String(certificate.template_name || "—")}</td>
                                <td style={{ padding: "11px 16px" }}>
                                  <span className={`badge ${statusColors[String(certificate.status || "active")] || "badge-neutral"}`}>{String(certificate.status || "active")}</span>
                                </td>
                                <td style={{ padding: "11px 16px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                                  {formatUtcDate(certificate.issued_at, { day: "numeric", month: "short", year: "numeric" })}
                                </td>
                                <td style={{ padding: "11px 16px" }}>
                                  <button
                                    type="button"
                                    className="btn-secondary"
                                    style={{ padding: "6px 8px", fontSize: "0.78rem" }}
                                    disabled={sendingCertificates || !String(certificate.recipient_email || "").trim()}
                                    onClick={() =>
                                      void requestMailIntent({
                                        kind: "send-certificates",
                                        certificateIds: [String(certificate.id)],
                                      })
                                    }
                                  >
                                    <Mail size={14} />
                                  </button>
                                </td>
                                <td style={{ padding: "11px 16px" }}>
                                  <Link href={`/dashboard/certificates/${String(certificate.id)}`} className="btn-secondary" style={{ padding: "6px 10px", fontSize: "0.78rem" }}>
                                    Open
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
              })
            )}
          </div>
        </>
      )}

      {smtpModalOpen ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(3, 8, 20, 0.74)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 85, padding: "24px" }} onClick={() => setSmtpModalOpen(false)}>
          <div className="glass-card" style={{ width: "min(820px, 100%)", maxHeight: "92vh", overflow: "auto", padding: "24px" }} onClick={(event) => event.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
              <div>
                <h2 className="text-xl font-bold" style={{ marginBottom: "4px" }}>Configure SMTP Before Sending</h2>
                <p style={{ color: "var(--muted-foreground)", margin: 0 }}>
                  Add your organization SMTP details here. Once saved, the pending certificate send action will continue automatically.
                </p>
              </div>
              <button type="button" onClick={() => setSmtpModalOpen(false)} style={{ width: "36px", height: "36px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "var(--foreground)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                <input type="checkbox" checked={smtpForm.enabled} onChange={(event) => setSmtpForm((current) => ({ ...current, enabled: event.target.checked }))} />
                Enable SMTP delivery
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                <input type="checkbox" checked={smtpForm.secure} onChange={(event) => setSmtpForm((current) => ({ ...current, secure: event.target.checked }))} />
                Use secure connection
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>SMTP Host</label>
                <input className="input-field" value={smtpForm.host} onChange={(event) => setSmtpForm((current) => ({ ...current, host: event.target.value }))} placeholder="smtp.gmail.com" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Port</label>
                <input type="number" className="input-field" value={smtpForm.port} onChange={(event) => setSmtpForm((current) => ({ ...current, port: event.target.value }))} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>SMTP Username</label>
                <input className="input-field" value={smtpForm.username} onChange={(event) => setSmtpForm((current) => ({ ...current, username: event.target.value }))} placeholder="mailer@yourorg.com" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>SMTP Password</label>
                <input type="password" className="input-field" value={smtpForm.password} onChange={(event) => setSmtpForm((current) => ({ ...current, password: event.target.value }))} placeholder={smtpConfig?.smtp_password ? "Saved password" : "App password or mailbox password"} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>From Name</label>
                <input className="input-field" value={smtpForm.fromName} onChange={(event) => setSmtpForm((current) => ({ ...current, fromName: event.target.value }))} placeholder="ProofPass Labs" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>From Email</label>
                <input type="email" className="input-field" value={smtpForm.fromEmail} onChange={(event) => setSmtpForm((current) => ({ ...current, fromEmail: event.target.value }))} placeholder="events@yourorg.com" />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Reply-To Email</label>
              <input type="email" className="input-field" value={smtpForm.replyTo} onChange={(event) => setSmtpForm((current) => ({ ...current, replyTo: event.target.value }))} placeholder="team@yourorg.com" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                <input type="checkbox" checked={smtpForm.sendRegistrationEmails} onChange={(event) => setSmtpForm((current) => ({ ...current, sendRegistrationEmails: event.target.checked }))} />
                Auto-send registration confirmations
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                <input type="checkbox" checked={smtpForm.sendCertificateEmails} onChange={(event) => setSmtpForm((current) => ({ ...current, sendCertificateEmails: event.target.checked }))} />
                Auto-send certificate delivery mails
              </label>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={() => void handleSaveSmtp()} className="btn-primary" disabled={savingSmtp}>
                <Save size={16} />
                {savingSmtp ? "Saving..." : pendingMailIntent ? "Save SMTP & Continue" : "Save SMTP"}
              </button>
              <button type="button" onClick={() => void handleTestSmtp()} className="btn-secondary" disabled={testingSmtp}>
                <Send size={16} />
                {testingSmtp ? "Testing..." : "Test Connection"}
              </button>
            </div>

            {smtpMessage ? (
              <div style={{ marginTop: "14px", padding: "12px 14px", borderRadius: "12px", background: isErrorMessage(smtpMessage) ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", color: isErrorMessage(smtpMessage) ? "var(--danger)" : "var(--success)", fontSize: "0.875rem" }}>
                {smtpMessage}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

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

      {pendingRegenerateIntent ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(3, 8, 20, 0.74)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 86, padding: "24px" }} onClick={() => setPendingRegenerateIntent(null)}>
          <div className="glass-card" style={{ width: "min(560px, 100%)", padding: "24px" }} onClick={(event) => event.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
              <div>
                <h2 className="text-xl font-bold" style={{ marginBottom: "4px" }}>Regenerate Certificates?</h2>
                <p style={{ color: "var(--muted-foreground)", margin: 0 }}>
                  Certificates already exist for this event ({pendingRegenerateIntent.existingCount}). Regenerating will replace all existing certificates for this event.
                </p>
              </div>
              <button type="button" onClick={() => setPendingRegenerateIntent(null)} style={{ width: "36px", height: "36px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "var(--foreground)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "14px 16px", borderRadius: "12px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b", fontSize: "0.84rem", marginBottom: "18px" }}>
              This will remove the current certificates for the selected event and create a new set.
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button type="button" className="btn-secondary" onClick={() => setPendingRegenerateIntent(null)}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={() => void handleConfirmRegenerate()}>
                Regenerate Certificates
              </button>
            </div>
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
