import { createMongoServerClient } from "@/lib/db/mongo/server";
import {
  AlertTriangle,
  CheckCircle2,
  Medal,
  ScanSearch,
  ScrollText,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { QrScanner } from "../qr-scanner";

type VerificationEvent = {
  name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  venue?: string | null;
};

type VerificationCertificate = {
  id: string;
  status?: string | null;
  category?: string | null;
  certificate_id_display?: string | null;
  recipient_name?: string | null;
  organization_name?: string | null;
  issued_at?: string | null;
  achievement_detail?: string | null;
  events?: VerificationEvent | null;
};

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createMongoServerClient();

  let certificate: VerificationCertificate | null = null;
  let event: VerificationEvent | null = null;

  if (supabase) {
    // Try lookup by certificate_id_display (human-readable ID)
    const { data } = await supabase
      .from("certificates")
      .select("*, events(name, start_date, end_date, venue)")
      .eq("certificate_id_display", decodeURIComponent(token))
      .single();

    if (data) {
      certificate = data as VerificationCertificate;
      event = certificate.events ?? null;
    } else {
      // Fallback: try by token_hash
      const { data: byHash } = await supabase
        .from("certificates")
        .select("*, events(name, start_date, end_date, venue)")
        .eq("token_hash", token)
        .single();

      if (byHash) {
        certificate = byHash as VerificationCertificate;
        event = certificate.events ?? null;
      }
    }

    // Log verification
    if (certificate) {
      await supabase.from("verification_logs").insert({
        certificate_id: certificate.id,
        result_status: certificate.status ?? "unknown",
      });
    }
  }

  const statusConfig: Record<string, { bg: string; border: string; icon: ReactNode; color: string; title: string; message: string }> = {
    active: {
      bg: "rgba(16,185,129,0.08)",
      border: "rgba(16,185,129,0.25)",
      icon: <CheckCircle2 size={40} />,
      color: "#10b981",
      title: "Certificate Verified",
      message: "This certificate is valid and verified.",
    },
    revoked: {
      bg: "rgba(239,68,68,0.08)",
      border: "rgba(239,68,68,0.25)",
      icon: <XCircle size={40} />,
      color: "#ef4444",
      title: "Certificate Revoked",
      message: "This certificate has been revoked and is no longer valid.",
    },
    draft: {
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.25)",
      icon: <AlertTriangle size={40} />,
      color: "#f59e0b",
      title: "Certificate Suspended",
      message: "This certificate has been temporarily suspended.",
    },
  };

  const notFoundConfig = {
    bg: "rgba(148,163,184,0.08)",
    border: "rgba(148,163,184,0.25)",
    icon: <ScanSearch size={40} />,
    color: "#94a3b8",
    title: "Certificate Not Found",
    message: "No certificate found with this ID. Please verify the ID and try again.",
  };

  const config = certificate ? (statusConfig[certificate.status as string] || notFoundConfig) : notFoundConfig;
  const achievementDetail = certificate?.achievement_detail?.trim();

  const categoryLabels: Record<string, string> = {
    winner: "Winner",
    runner_up: "Runner-Up",
    participant: "Participant",
  };

  const categoryIcons: Record<string, ReactNode> = {
    winner: <ShieldCheck size={14} />,
    runner_up: <Medal size={14} />,
    participant: <ScrollText size={14} />,
  };

  const categoryColors: Record<string, string> = {
    winner: "#f59e0b",
    runner_up: "#9ca3af",
    participant: "#4f46e5",
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px", background: "radial-gradient(circle at 50% 30%, rgba(79,70,229,0.12), transparent 40%), linear-gradient(180deg, #060816 0%, #070b17 42%, #091121 100%)" }}>
      <div className="w-full animate-fade-in" style={{ maxWidth: "560px" }}>
        {/* ProofPass Brand */}
        <div className="text-center" style={{ marginBottom: "32px" }}>
          <div className="inline-flex items-center gap-3 mb-2">
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1.1rem" }}>P</div>
            <span className="text-xl font-bold">ProofPass</span>
          </div>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>Certificate Verification Portal</p>
        </div>

        {/* Status Banner */}
        <div style={{
          background: config.bg,
          border: `2px solid ${config.border}`,
          borderRadius: "16px",
          padding: "24px",
          textAlign: "center",
          marginBottom: "24px",
        }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px", color: config.color }}>{config.icon}</div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: config.color, marginBottom: "6px" }}>{config.title}</h2>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>{config.message}</p>
        </div>

        {/* Certificate Details */}
        {certificate && (
          <div className="glass-card" style={{ padding: "28px", marginBottom: "24px" }}>
            {/* Category Badge */}
            <div className="text-center" style={{ marginBottom: "20px" }}>
              <span style={{
                display: "inline-block",
                padding: "6px 20px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: categoryColors[certificate.category as string] || "#4f46e5",
                background: `${categoryColors[certificate.category as string] || "#4f46e5"}15`,
                border: `1px solid ${categoryColors[certificate.category as string] || "#4f46e5"}30`,
              }} className="inline-flex items-center gap-2">
                {categoryIcons[certificate.category as string] ?? null}
                {categoryLabels[certificate.category as string] || "Certificate"}
              </span>
            </div>

            {/* Details Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Certificate ID</p>
                <code style={{ fontSize: "0.95rem", color: "var(--primary-soft)", fontWeight: 600 }}>{certificate.certificate_id_display as string}</code>
              </div>
              <div>
                <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Recipient</p>
                <p style={{ fontWeight: 600 }}>{certificate.recipient_name as string}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Event</p>
                <p style={{ fontWeight: 500 }}>{(event?.name as string) || "—"}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Issuing Organization</p>
                <p style={{ fontWeight: 500 }}>{(certificate.organization_name as string) || "—"}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Date of Issue</p>
                <p style={{ fontWeight: 500 }}>{certificate.issued_at ? new Date(certificate.issued_at as string).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—"}</p>
              </div>
              {achievementDetail ? (
                <div>
                  <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Achievement</p>
                  <p style={{ fontWeight: 500 }}>{achievementDetail}</p>
                </div>
              ) : null}
            </div>

            {event && (
              <div style={{ marginTop: "16px", padding: "14px", borderRadius: "10px", background: "rgba(79,70,229,0.05)", border: "1px solid rgba(79,70,229,0.1)" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                  Event Date: {event.start_date ? new Date(event.start_date as string).toLocaleDateString() : "—"}
                  {event.end_date && ` — ${new Date(event.end_date as string).toLocaleDateString()}`}
                  {event.venue && ` • ${event.venue}`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Verify Another */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <form action="/verify" method="GET" style={{ display: "flex", gap: "8px" }}>
            <input name="q" type="text" className="input-field" placeholder="Enter Certificate ID (e.g., PP-2026-TF-00001)" style={{ flex: 1 }} />
            <button type="submit" className="btn-primary" style={{ padding: "12px 20px" }}>Verify</button>
          </form>
        </div>

        {/* QR Scanner */}
        <div className="glass-card" style={{ padding: "20px", marginTop: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <ScanSearch size={18} style={{ color: "var(--primary-soft)" }} />
            <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--foreground)", margin: 0 }}>
              Scan QR Code
            </p>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", marginBottom: "14px", lineHeight: 1.6 }}>
            Point your camera at the QR code on a ProofPass certificate to instantly verify it.
          </p>
          <QrScanner />
        </div>

        {/* Footer */}
        <div className="text-center" style={{ marginTop: "24px" }}>
          <Link href="/" style={{ color: "var(--muted-foreground)", fontSize: "0.8rem" }}>
            proofpass.in — Verified Event Credentials
          </Link>
        </div>
      </div>
    </main>
  );
}
